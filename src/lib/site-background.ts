/**
 * Site-wide 3D background (Three.js): one mesh shown as its topology — a perturbed
 * quad-sphere whose surface slowly flows, drawn as clean quad edge loops with glowing
 * vertices over a dark body that hides the far side, plus a scan band that sweeps
 * across it.
 *
 * - Shapes: the sphere mutates into an object for a service (`SHAPES`: a browser window
 *   for Web, a sparkle for AI, a gear for Automation, a bar chart for Data
 *   visualization). Every shape is the same vertices moved to new positions (morph
 *   targets as vertex attributes), so the quads flow from one form to the other: the
 *   change sweeps through the mesh as a wave, each vertex swinging out, overshooting
 *   and settling, lit up while in flight. With nothing hovered the mesh tours the
 *   shapes of the services on the page by itself (also on touch screens), marking the
 *   matching element with `data-svc-active`. The shape comes from `data-bg-shape` on <html> while a
 *   service is hovered/focused (any `[data-svc-id]` element, see SiteBackground.astro)
 *   or from `data-bg-shape` on the canvas (that service's subpage, i.e. after a click).
 *   While a shape is up the mesh stops spinning and faces the viewer with a slow sway.
 * - Placement (`data-bg` on the canvas): "home" puts the mesh beside the hero text
 *   (above it on portrait screens); "page" pushes a larger mesh to the bottom-right
 *   corner, where the canvas is also dimmed by CSS.
 * - Colour: the key colour comes from `data-bg-key` on the canvas (service subpages),
 *   overridden by `data-bg-key` on <html> while a service is hovered; otherwise the
 *   colour of the service whose shape is up, or neutral for the sphere.
 * - The clock is kept in sessionStorage, so the mesh carries on from the same pose
 *   when moving between pages instead of restarting.
 * - Reduced motion: a single still frame (redrawn on resize and colour change).
 */
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  Group,
  LineSegments,
  Mesh,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  Vector3,
  Vector4,
  WebGLRenderer,
} from "three";

const SEGMENTS = 26; // quads per cube-face side
const NEUTRAL = "#8d877f";
const INK = "#f4f1ec";
const BACKGROUND = "#090909"; // --color-background
const MOVE = 1.5; // seconds for a change of form
const HOLD = 3.6; // seconds a shape stays up on the tour

/**
 * Shared by the three materials: the surface. `position` is on the unit sphere; the
 * result is on the way from one form (`uFrom`) to another (`uTo`), each either the
 * perturbed sphere (all zeros) or one service shape (a 1 in its slot).
 */
const DISPLACE = /* glsl */ `
  uniform float uTime;
  uniform vec4 uFrom;
  uniform vec4 uTo;
  uniform float uProgress;
  uniform vec3 uAxis;
  attribute vec3 aT0;
  attribute vec3 aT1;
  attribute vec3 aT2;
  attribute vec3 aT3;
  attribute vec3 aN0;
  attribute vec3 aN1;
  attribute vec3 aN2;
  attribute vec3 aN3;
  vec3 surfaceNormal;
  float inFlight; /* 0 at rest, 1 for a vertex half-way through its move */
  vec3 displace(vec3 p) {
    float t = uTime;
    float f = sin(p.x * 2.3 + t * 0.5) * cos(p.y * 1.9 - t * 0.4)
      + 0.6 * sin(p.z * 3.1 + p.x * 1.3 + t * 0.7)
      + 0.35 * sin(p.y * 5.0 + p.z * 2.0 - t * 0.9)
      + 0.25 * sin(p.x * 6.0 - p.z * 4.0 + t * 1.1);
    vec3 blob = p * (1.0 + 0.16 * f);
    // A trace of the flow stays on the shapes, so they still feel alive.
    float live = 1.0 + 0.012 * f;
    float isFrom = uFrom.x + uFrom.y + uFrom.z + uFrom.w;
    float isTo = uTo.x + uTo.y + uTo.z + uTo.w;
    vec3 a = blob * (1.0 - isFrom) + (uFrom.x * aT0 + uFrom.y * aT1 + uFrom.z * aT2 + uFrom.w * aT3) * live;
    vec3 b = blob * (1.0 - isTo) + (uTo.x * aT0 + uTo.y * aT1 + uTo.z * aT2 + uTo.w * aT3) * live;
    vec3 na = p * (1.0 - isFrom) + uFrom.x * aN0 + uFrom.y * aN1 + uFrom.z * aN2 + uFrom.w * aN3;
    vec3 nb = p * (1.0 - isTo) + uTo.x * aN0 + uTo.y * aN1 + uTo.z * aN2 + uTo.w * aN3;

    // The change sweeps through the mesh along uAxis: every vertex leaves a little
    // later than the one before, overshoots its new place slightly and settles.
    float delay = (dot(p, uAxis) * 0.5 + 0.5) * 0.55;
    float x = clamp(uProgress * 1.55 - delay, 0.0, 1.0);
    float k = x - 1.0;
    float e = 1.0 + 2.6 * k * k * k + 1.6 * k * k;
    inFlight = sin(x * 3.14159265);
    vec3 pos = mix(a, b, e);
    // In flight a vertex swings around the sweep axis and swells outwards, so the
    // surface twists like a wave instead of sliding straight from form to form.
    float angle = inFlight * 1.1;
    pos = pos * cos(angle) + cross(uAxis, pos) * sin(angle) + uAxis * dot(uAxis, pos) * (1.0 - cos(angle));
    pos *= 1.0 + 0.1 * inFlight;
    surfaceNormal = normalize(mix(na, nb, clamp(e, 0.0, 1.0)));
    return pos;
  }
  /* 0 at the silhouette, 1 where the surface faces the camera. Call after displace(). */
  float facing(vec4 mv) {
    vec3 n = normalize(normalMatrix * surfaceNormal);
    return abs(dot(n, normalize(-mv.xyz)));
  }
  /* A band travelling up and down a tilted axis. */
  float scan(vec3 p) {
    float sweep = sin(uTime * 0.35) * 1.3;
    return smoothstep(0.16, 0.0, abs(dot(p, normalize(vec3(0.35, 1.0, 0.2))) - sweep));
  }
`;

/** A cube's six faces, each an n×n grid, pushed onto the unit sphere: all quads, even edge flow. */
function quadSphere(n: number) {
  const positions: number[] = [];
  const lines: number[] = [];
  const triangles: number[] = [];
  const normals = [
    [1, 0, 0],
    [-1, 0, 0],
    [0, 1, 0],
    [0, -1, 0],
    [0, 0, 1],
    [0, 0, -1],
  ];
  normals.forEach(([nx, ny, nz]) => {
    const base = positions.length / 3;
    // Two axes spanning the face: a cyclic shift of the normal, and their cross product.
    const [ux, uy, uz] = [ny, nz, nx];
    const [vx, vy, vz] = [ny * uz - nz * uy, nz * ux - nx * uz, nx * uy - ny * ux];
    for (let j = 0; j <= n; j++) {
      for (let i = 0; i <= n; i++) {
        // tan() spacing keeps the quads close to the same size across the face.
        const a = Math.tan(((i / n) * 2 - 1) * (Math.PI / 4));
        const b = Math.tan(((j / n) * 2 - 1) * (Math.PI / 4));
        const x = nx + a * ux + b * vx;
        const y = ny + a * uy + b * vy;
        const z = nz + a * uz + b * vz;
        const len = Math.hypot(x, y, z);
        positions.push(x / len, y / len, z / len);
        const k = base + j * (n + 1) + i;
        if (i < n) lines.push(k, k + 1);
        if (j < n) lines.push(k, k + n + 1);
        if (i < n && j < n) triangles.push(k, k + 1, k + n + 2, k, k + n + 2, k + n + 1);
      }
    }
  });
  return { positions: new Float32Array(positions), lines, triangles };
}

type V3 = [number, number, number];
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
/** Sphere point → the cube around it, with even spacing along each face (−1…1). */
const toCube = ([x, y, z]: V3): V3 => {
  const m = Math.max(Math.abs(x), Math.abs(y), Math.abs(z));
  const even = (v: number) => (Math.abs(v) === m ? Math.sign(v) : (Math.atan(v / m) * 4) / Math.PI);
  return [even(x), even(y), even(z)];
};

/**
 * The service shapes, in the order of their slots in `uFrom` / `uTo`. Each maps a point of the
 * unit sphere to its place on the object, facing +z (towards the viewer).
 */
const SHAPES: Record<string, (p: V3) => V3> = {
  // Web: a browser window — a thin slab whose front is an even grid, with a raised top bar.
  web: (p) => {
    const [x, y, z] = toCube(p);
    const bar = z > 0 ? 0.05 * smooth(0.6, 0.66, y) : 0;
    return [x * 1.3, y * 0.84, z * 0.07 + bar];
  },
  // AI: a sparkle — a star with a point on every axis, the front and back ones shorter.
  ai: ([x, y, z]) => {
    const k = 0.62;
    const s = 1.2 * (Math.abs(x) ** k + Math.abs(y) ** k + Math.abs(z) ** k) ** (-1 / k);
    return [x * s, y * s, z * s * 0.55];
  },
  // Automation: a gear — a toothed disc with a recessed hub. The polar angle from the
  // axis spreads the vertices evenly over each flat side, then down the toothed rim.
  automation: ([x, y, z]) => {
    const half = 0.2;
    const angle = Math.atan2(y, x);
    const radius = 0.98 + 0.15 * Math.min(1, Math.max(-1, 2.5 * Math.cos(10 * angle)));
    const polar = Math.acos(Math.min(1, Math.abs(z)));
    const edge = 1.2; // polar angle where the flat side meets the rim
    // Round up to the root circle; the teeth only grow out of the outer quarter.
    const along = Math.min(1, polar / edge);
    const r = along * (0.83 + (radius - 0.83) * smooth(0.72, 1, along));
    const hub = 1 - 0.55 * smooth(0.5, 0.42, r) + 0.35 * smooth(0.2, 0.14, r);
    const side = polar < edge ? hub : 1 - (polar - edge) / (Math.PI / 2 - edge);
    return [Math.cos(angle) * r, Math.sin(angle) * r, Math.sign(z) * half * side];
  },
  // Data visualization: a bar chart — five bars of different heights on a shared base.
  dataviz: (p) => {
    const [ux, uy, uz] = toCube(p);
    const x = ux * 1.3;
    const base = 0.1;
    let height = base;
    [0.55, 1.0, 0.75, 1.45, 1.9].forEach((h, i) => {
      height += (h - base) * (1 - smooth(0.19, 0.26, Math.abs(x - (-1.1 + i * 0.55))));
    });
    return [x, -0.95 + ((uy + 1) / 2) * height, uz * 0.3];
  },
};
const SHAPE_IDS = Object.keys(SHAPES);

export function initBackground(canvas: HTMLCanvasElement) {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isHome = canvas.dataset.bg === "home";
  const pageKey = canvas.dataset.bgKey;
  // `?shape=<service id>` forces a shape, to preview it without hovering.
  const pageShape = canvas.dataset.bgShape ?? new URLSearchParams(location.search).get("shape") ?? undefined;
  const root = document.documentElement;
  // The services on this page: elements that drive the mesh on hover, and that light up
  // (`data-svc-active`) while the mesh shows their shape on its own.
  const serviceEls = Array.from(document.querySelectorAll<HTMLElement>("[data-svc-id]"));
  const keys: Record<string, string | undefined> = {};
  serviceEls.forEach((el) => (keys[el.dataset.svcId!] = el.dataset.svcKey));
  // With nothing hovered the mesh goes through those services' shapes, then back to
  // the sphere (−1), and round again. Not on a service's own page, nor with reduced motion.
  const tour = pageShape || reduced ? [] : [...new Set(serviceEls.map((el) => SHAPE_IDS.indexOf(el.dataset.svcId!)))].filter((i) => i >= 0);
  if (tour.length) tour.push(-1);

  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
  } catch {
    return; // no WebGL: the page simply has no background
  }
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new PerspectiveCamera(35, 1, 0.1, 50);
  camera.position.z = 6;
  const group = new Group();
  scene.add(group);

  const { positions, lines, triangles } = quadSphere(SEGMENTS);
  const attributes: Record<string, BufferAttribute> = { position: new BufferAttribute(positions, 3) };
  // Morph targets: every vertex's place on each shape, and the shape's normals there.
  SHAPE_IDS.forEach((id, s) => {
    const target = new Float32Array(positions.length);
    for (let i = 0; i < positions.length; i += 3) {
      target.set(SHAPES[id]([positions[i], positions[i + 1], positions[i + 2]]), i);
    }
    const solid = new BufferGeometry();
    solid.setAttribute("position", new BufferAttribute(target, 3));
    solid.setIndex(triangles);
    solid.computeVertexNormals();
    attributes[`aT${s}`] = new BufferAttribute(target, 3);
    attributes[`aN${s}`] = solid.getAttribute("normal") as BufferAttribute;
  });
  const geometry = (index?: number[]) => {
    const g = new BufferGeometry();
    Object.entries(attributes).forEach(([name, attribute]) => g.setAttribute(name, attribute));
    if (index) g.setIndex(index);
    return g;
  };

  const uniforms = {
    uTime: { value: 0 },
    // Vector4 defaults to w = 1: spell out the zeros.
    uFrom: { value: new Vector4(0, 0, 0, 0) },
    uTo: { value: new Vector4(0, 0, 0, 0) },
    uProgress: { value: 1 },
    uAxis: { value: new Vector3(0, 1, 0) },
    uKey: { value: new Color(pageKey ?? NEUTRAL) },
    uInk: { value: new Color(INK) },
    uBackground: { value: new Color(BACKGROUND) },
    uPixelRatio: { value: 1 },
  };

  // Body: hides the far side of the mesh and catches a rim of the key colour.
  const body = new Mesh(
    geometry(triangles),
    new ShaderMaterial({
      uniforms,
      side: DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
      vertexShader: `
        ${DISPLACE}
        varying float vFacing;
        void main() {
          vec4 mv = modelViewMatrix * vec4(displace(position), 1.0);
          vFacing = facing(mv);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        uniform vec3 uKey;
        uniform vec3 uBackground;
        varying float vFacing;
        void main() {
          float rim = pow(1.0 - vFacing, 3.0);
          gl_FragColor = vec4(uBackground + uKey * rim * 0.22, 1.0);
        }
      `,
    }),
  );

  // Edges: the quad topology.
  const edges = new LineSegments(
    geometry(lines),
    new ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      vertexShader: `
        ${DISPLACE}
        varying float vFacing;
        varying float vScan;
        void main() {
          vec3 p = displace(position);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          vFacing = facing(mv);
          // Vertices in flight light up like the scan band.
          vScan = max(scan(p), inFlight * 0.8);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        uniform vec3 uKey;
        uniform vec3 uInk;
        varying float vFacing;
        varying float vScan;
        void main() {
          vec3 colour = mix(mix(uKey, uInk, 0.55), uKey, vScan);
          float alpha = mix(0.1, 0.5, vFacing) + vScan * 0.5;
          gl_FragColor = vec4(colour, alpha);
        }
      `,
    }),
  );

  // Vertices: small glowing dots that flare as the scan band passes.
  const vertices = new Points(
    geometry(),
    new ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      vertexShader: `
        ${DISPLACE}
        uniform float uPixelRatio;
        varying float vFacing;
        varying float vScan;
        void main() {
          vec3 p = displace(position);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          vFacing = facing(mv);
          vScan = max(scan(p), inFlight);
          gl_Position = projectionMatrix * mv;
          // Pull the dots a hair towards the camera so the body never hides them.
          gl_Position.z -= 0.002 * gl_Position.w;
          gl_PointSize = (20.0 + 26.0 * vScan) * uPixelRatio / -mv.z;
        }
      `,
      fragmentShader: `
        uniform vec3 uKey;
        uniform vec3 uInk;
        varying float vFacing;
        varying float vScan;
        void main() {
          float d = length(gl_PointCoord - 0.5) * 2.0;
          float disc = smoothstep(1.0, 0.35, d);
          vec3 colour = mix(uInk, uKey, 0.35 + 0.65 * vScan);
          gl_FragColor = vec4(colour, disc * (mix(0.15, 0.85, vFacing) + vScan * 0.4));
        }
      `,
    }),
  );
  group.add(body, edges, vertices);

  // Layout: where the mesh sits for this page and viewport.
  const layout = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(ratio);
    renderer.setSize(w, h, false);
    uniforms.uPixelRatio.value = ratio * (h / 900);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    // Half extents of the view at the mesh's depth.
    const halfH = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
    const halfW = halfH * camera.aspect;
    if (isHome) {
      if (camera.aspect >= 1.15) {
        group.position.set(halfW * 0.46, -halfH * 0.04, 0);
        group.scale.setScalar(Math.min(1.15, halfW * 0.4));
      } else {
        group.position.set(0, halfH * 0.42, 0);
        group.scale.setScalar(Math.min(1.1, halfW * 0.82));
      }
    } else if (pageShape) {
      // A service subpage: its whole shape, to the right of the text.
      group.position.set(halfW * 0.68, -halfH * 0.12, 0);
      group.scale.setScalar(Math.min(1.05, halfW * 0.5));
    } else {
      group.position.set(halfW * 0.82, -halfH * 0.5, 0);
      group.scale.setScalar(Math.max(1.3, Math.min(2, halfW * 0.7)));
    }
  };

  // One clock for the whole visit, so the pose carries over between pages.
  let start = Number(sessionStorage.getItem("bg-start"));
  if (!start) {
    start = Date.now();
    sessionStorage.setItem("bg-start", String(start));
  }
  // The slow spin is kept apart from the clock: it pauses (and squares up) while a shape is up.
  let spin = Number(sessionStorage.getItem("bg-spin")) || 0;
  window.addEventListener("pagehide", () => sessionStorage.setItem("bg-spin", String(spin)));
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const target = new Color();
  let raf = 0;
  let last = performance.now();

  // Form state: −1 is the sphere, 0…3 a shape. `to` is shown once `progress` reaches 1.
  let from = -1;
  let to = -1;
  let progress = 1;
  let pending: number | null = null;
  let clock = 0;
  let stop = tour.length - 1; // position in the tour (starts on the sphere)
  let nextAt = 1.4; // clock time of the next automatic change
  let active: string | undefined;
  const AXES = [new Vector3(0, 1, 0), new Vector3(1, 0, 0), new Vector3(0.7, 0.7, 0.14), new Vector3(-0.7, 0.7, -0.14), new Vector3(0, -1, 0)];
  const oneHot = (v: Vector4, i: number) => v.set(Number(i === 0), Number(i === 1), Number(i === 2), Number(i === 3));
  const move = (next: number) => {
    from = to;
    to = next;
    // `?progress=0…1` (with reduced motion) freezes a move part-way, to inspect it.
    progress = reduced ? Number(new URLSearchParams(location.search).get("progress") ?? 1) : 0;
    oneHot(uniforms.uFrom.value, from);
    oneHot(uniforms.uTo.value, to);
    uniforms.uAxis.value.copy(AXES[Math.floor(Math.random() * AXES.length)]).normalize();
  };
  /** Ask for a form. A move in flight finishes first (faster) unless it is simply turned back. */
  const go = (next: number) => {
    if (next === to) pending = null;
    else if (progress === 1) move(next);
    else if (next === from) {
      [from, to] = [to, from];
      progress = 1 - progress;
      oneHot(uniforms.uFrom.value, from);
      oneHot(uniforms.uTo.value, to);
      pending = null;
    } else pending = next;
  };

  const render = (now = performance.now()) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    clock += dt;
    const t = reduced ? 20 : (Date.now() - start) / 1000;
    uniforms.uTime.value = t;
    pointer.x += (pointer.tx - pointer.x) * Math.min(1, dt * 3);
    pointer.y += (pointer.ty - pointer.y) * Math.min(1, dt * 3);

    // Which form: the hovered service's, else this page's own, else the next stop of the tour.
    const hovered = root.dataset.bgShape;
    const fixed = hovered ?? pageShape;
    if (fixed !== undefined) {
      go(SHAPE_IDS.indexOf(fixed));
      // The tour picks up from here once the pointer leaves.
      if (tour.includes(to)) stop = tour.indexOf(to);
      nextAt = clock + 2.2;
    } else if (tour.length) {
      if (progress === 1 && clock > nextAt) {
        stop = (stop + 1) % tour.length;
        nextAt = clock + MOVE + (tour[stop] < 0 ? 1.6 : HOLD);
      }
      go(tour[stop]);
    } else go(-1);
    if (progress < 1) {
      progress = Math.min(1, progress + (dt / MOVE) * (pending === null ? 1 : 2.5));
      if (progress === 1 && pending !== null) {
        const next = pending;
        pending = null;
        move(next);
      }
    }
    uniforms.uProgress.value = progress;

    // The service being shown on tour lights up in the page.
    const showing = hovered === undefined && !pageShape ? SHAPE_IDS[to] : undefined;
    if (showing !== active) {
      active = showing;
      serviceEls.forEach((el) => el.toggleAttribute("data-svc-active", el.dataset.svcId === active));
    }
    target.set(root.dataset.bgKey ?? pageKey ?? keys[SHAPE_IDS[to]] ?? NEUTRAL);
    uniforms.uKey.value.lerp(target, reduced ? 1 : Math.min(1, dt * 3));

    // Sphere: spins slowly, tilted. Shape: squares up to the viewer and sways.
    const morph = Number(from >= 0) * (1 - progress) + Number(to >= 0) * progress;
    const turn = Math.PI * 2;
    spin += dt * 0.07 * (1 - morph);
    spin += (Math.round(spin / turn) * turn - spin) * Math.min(1, dt * 3) * morph;
    const sway = reduced ? 0.3 : Math.sin(t * 0.5) * 0.4;
    group.rotation.y = spin + pointer.x * 0.4 + sway * morph;
    group.rotation.x = 0.35 - 0.2 * morph + pointer.y * 0.25 + window.scrollY * 0.0005 * (1 - morph);
    renderer.render(scene, camera);
  };
  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    render(now);
  };
  const play = () => {
    if (reduced || raf || document.hidden) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  };
  const pause = () => {
    cancelAnimationFrame(raf);
    raf = 0;
  };

  layout();
  render();
  canvas.dataset.ready = "";

  window.addEventListener("resize", () => {
    layout();
    if (reduced) render();
  });
  window.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
  });
  document.addEventListener("visibilitychange", () => (document.hidden ? pause() : play()));
  // Reduced motion still follows the hovered service's colour.
  if (reduced) {
    new MutationObserver(() => render()).observe(document.documentElement, { attributeFilter: ["data-bg-key", "data-bg-shape"] });
  }
  play();
}
