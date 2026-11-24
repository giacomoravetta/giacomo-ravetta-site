/**
 * Animated 1-bit pixel figures (one per service), drawn without any library.
 *
 * One hidden WebGL canvas renders every figure on the page at its grid size (one
 * fragment = one chunky cell); the result is copied 1:1 into the figure's own 2D canvas,
 * which CSS scales up by a whole number of device pixels (`image-rendering: pixelated`),
 * so every cell is the same size and as crisp as vector at any zoom.
 *
 * Each figure is a few layered forms (bars, discs, boxes, gears). A form is opaque and
 * filled with a dither pattern (solid, Bayer 4x4 by tone, checker, lines, diagonal, dots).
 * The pattern is fixed to the cell grid and the forms move underneath it, so it never
 * swims. Time is stepped (`FPS`) for the 8-bit feel.
 *
 * The ink takes the canvas's CSS `color`.
 * Figures are scroll-driven: a figure's time follows its way through the viewport (it
 * stands still when the page does), and it builds up from the bottom, cell by cell
 * through the Bayer matrix, as its box enters the screen.
 * A canvas with `data-figure-mode="clock"` (the Home hero) runs on the clock instead and
 * builds up once on load.
 * `?t=<seconds>` freezes time (screenshots). Reduced motion: one still frame.
 */

const FIGURES = ["web", "ai", "automation", "dataviz", "hero"];
/** Cells along the short side of a figure. */
const CELLS = 96;
const FPS = 12;
/** Seconds of a figure's animation played while it crosses the viewport (scroll-driven). */
const SCROLL_SPAN = 12;
/** Seconds the build-up of a clock-driven figure takes on load. */
const BUILD = 1.6;

const VERT = `attribute vec2 a; void main() { gl_Position = vec4(a, 0., 1.); }`;

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes;
uniform float uT;
uniform float uFig;
uniform float uReveal;
const float TAU = 6.2831853;

float bayer2(vec2 a) { a = floor(a); return fract(a.x / 2. + a.y * a.y * .75); }
float bayer4(vec2 a) { return bayer2(.5 * a) * .25 + bayer2(a); }
float hash(float n) { return fract(sin(n * 127.1) * 43758.5453); }

// Ink (0 or 1) at cell c of a surface filled with pattern pat; tone 0..1 only matters for Bayer.
float ink(float pat, float tone, vec2 c) {
  if (pat < .5) return 1.;                                                // 0 solid
  if (pat < 1.5) return step(bayer4(c) + .03, tone);                      // 1 Bayer 4x4
  if (pat < 2.5) return step(mod(c.x + c.y, 2.), .5);                     // 2 checker
  if (pat < 3.5) return step(mod(c.x, 2.), .5);                           // 3 vertical lines
  if (pat < 4.5) return step(mod(c.y, 2.), .5);                           // 4 horizontal lines
  if (pat < 5.5) return step(mod(c.x + c.y, 4.), 1.5);                    // 5 diagonal
  return step(mod(c.x, 2.), .5) * step(mod(c.y, 2.), .5);                 // 6 dots
}

// Round-topped bar: centre x, half-width w, from y0 up to y1. Negative inside.
float arch(vec2 p, float x, float w, float y0, float y1) {
  float top = max(y1 - w, y0);
  float d = p.y > top ? length(p - vec2(x, top)) - w : abs(p.x - x) - w;
  return max(d, y0 - p.y);
}
float box(vec2 p, vec2 ctr, vec2 ext) {
  vec2 d = abs(p - ctr) - ext;
  return max(d.x, d.y);
}
// Inside (1) a gear of radius R with n teeth, turned by rot.
float gear(vec2 p, float R, float n, float rot) {
  float teeth = step(0., sin(n * (atan(p.y, p.x) + rot)));
  return step(length(p), R * (1. + .17 * teeth));
}

// Web: a browser window with a page scrolling inside it.
float figWeb(vec2 p, vec2 c, float t) {
  vec2 win = vec2(.84, .9);
  float frame = box(p, vec2(0.), win);
  if (frame > 0.) return 0.;
  float col = 0.;
  vec2 q = vec2(p.x, mod(p.y - t * .2, 2.4) - 1.2);
  if (arch(q, 0., .66, .22, 1.08) < 0.) col = ink(1., .2 + .8 * (q.x + .66) / 1.32, c);
  if (box(q, vec2(-.36, -.2), vec2(.3, .3)) < 0.) col = ink(2., 1., c);
  if (box(q, vec2(.36, -.2), vec2(.3, .3)) < 0.) col = ink(3., 1., c);
  if (box(q, vec2(0., -.72), vec2(.66, .045)) < 0.) col = 1.;
  if (box(q, vec2(-.2, -.9), vec2(.46, .045)) < 0.) col = 1.;
  if (box(q, vec2(-.3, -1.08), vec2(.36, .045)) < 0.) col = ink(6., 1., c);
  // Chrome: title bar with three holes, and the border.
  if (p.y > win.y - .24) {
    col = 1.;
    for (int i = 0; i < 3; i++) {
      if (length(p - vec2(-.66 + float(i) * .17, win.y - .12)) < .055) col = 0.;
    }
  }
  if (frame > -.05) col = 1.;
  return col;
}

// AI: one thick tube that undulates, its shading travelling along it.
float figAi(vec2 p, vec2 c, float t) {
  float col = 0.;
  for (int i = 0; i < 64; i++) {
    float s = float(i) / 63.;
    vec2 q = vec2(.56 * sin(TAU * 1.55 * s + t * .7), .74 - 1.48 * s + .1 * sin(TAU * 3.1 * s + t * .7));
    if (length(p - q) < .2) {
      float tone = .5 + .5 * sin(TAU * (s * 1.3 - t * .12));
      col = ink(1., .3 + .7 * tone, c);
    }
  }
  return col;
}

// Automation: two meshed gears turning each other.
float figAuto(vec2 p, vec2 c, float t) {
  float col = 0.;
  float w = t * .35;
  vec2 a = p - vec2(-.2, .2);
  float ra = length(a);
  if (gear(a, .58, 10., w) > .5) col = ink(2., 1., c);
  if (ra < .36) col = 0.;
  if (ra < .28) col = mod(atan(a.y, a.x) - t * .6, TAU) < TAU * .7 ? 1. : ink(3., 1., c);
  if (ra < .1) col = 0.;
  vec2 b = p - vec2(.5, -.52);
  float rb = length(b);
  if (gear(b, .29, 5., -2. * w + .3) > .5) col = ink(1., .35 + .65 * (b.y + .34) / .68, c);
  if (rb < .1) col = 0.;
  return col;
}

// Data visualization: two rows of round-topped bars rising and falling.
float figData(vec2 p, vec2 c, float t) {
  float col = 0.;
  for (int j = 0; j < 2; j++) {
    float row = float(j);
    for (int i = 0; i < 5; i++) {
      if (j == 0 && i == 4) continue;
      float fi = float(i);
      float x = (j == 0 ? -.54 : -.72) + fi * .36;
      float k = t / 2.4 + fi * .17 + row * .5;
      float seed = fi * 7.3 + row * 31.;
      float h = mix(hash(seed + floor(k)), hash(seed + floor(k) + 1.), smoothstep(0., .45, fract(k)));
      float y0 = -.88;
      float y1 = j == 0 ? mix(-.05, .88, h) : mix(-.6, .4, h);
      if (arch(p, x, .17, y0, y1) < 0.) {
        float pat = mod(fi * 2. + (j == 0 ? 5. : 0.), 7.);
        col = ink(pat, 1. - .85 * (p.y - y0) / (y1 - y0), c);
      }
    }
  }
  return col;
}

// Hero: three rows of round-topped arches marching sideways at different speeds.
float figHero(vec2 p, vec2 c, float t) {
  float col = 0.;
  for (int j = 0; j < 3; j++) {
    float row = float(j);
    float w = .27 - row * .045;
    float x = p.x + t * (.05 + row * .05) + row * .37;
    float n = floor(x / (2. * w));
    float lx = x - (n + .5) * 2. * w;
    float seed = n * 3.7 + row * 17.;
    float h = hash(seed);
    float y1 = mix(.85, -.25, row * .5) - h * .7 + .1 * sin(t * .6 + seed);
    if (h > .22 && arch(vec2(lx, p.y), 0., w, -1.3, y1) < 0.) {
      col = ink(mod(n + row * 3., 7.), 1. - .8 * (p.y + 1.1) / (y1 + 1.1), c);
    }
  }
  return col;
}

void main() {
  vec2 c = floor(gl_FragCoord.xy);
  vec2 p = (c + .5 - .5 * uRes) / (.46 * min(uRes.x, uRes.y));
  float col = uFig < .5 ? figWeb(p, c, uT) : uFig < 1.5 ? figAi(p, c, uT) : uFig < 2.5 ? figAuto(p, c, uT) : uFig < 3.5 ? figData(p, c, uT) : figHero(p, c, uT);
  // Build-up: rises from the bottom, each cell switching on at its Bayer threshold.
  col *= step(bayer4(c) + .03, clamp(uReveal * 2. - c.y / uRes.y, 0., 1.));
  gl_FragColor = vec4(0., 0., 0., col);
}
`;

type Figure = {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  index: number;
  cols: number;
  rows: number;
  time: number;
  /** Runs on the clock instead of the scroll. */
  clock: boolean;
  /** 0..1 build-up (scroll-driven); 1 = whole figure. */
  reveal: number;
  /** What was last drawn, to skip identical frames. */
  drawn: string;
  visible: boolean;
};

export function initFigures(canvases: HTMLCanvasElement[]) {
  const glCanvas = document.createElement("canvas");
  const gl = glCanvas.getContext("webgl", { antialias: false, depth: false, stencil: false });
  if (!gl) return;

  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(shader));
    return shader;
  };
  const program = gl.createProgram()!;
  gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const attr = gl.getAttribLocation(program, "a");
  gl.enableVertexAttribArray(attr);
  gl.vertexAttribPointer(attr, 2, gl.FLOAT, false, 0, 0);
  const uRes = gl.getUniformLocation(program, "uRes");
  const uT = gl.getUniformLocation(program, "uT");
  const uFig = gl.getUniformLocation(program, "uFig");
  const uReveal = gl.getUniformLocation(program, "uReveal");

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const frozen = new URLSearchParams(location.search).get("t");
  const still = reduced || frozen !== null;
  const startTime = frozen !== null ? Number(frozen) || 0 : 8;

  const figures: Figure[] = [];
  for (const canvas of canvases) {
    const index = FIGURES.indexOf(canvas.dataset.figure ?? "");
    const ctx = canvas.getContext("2d");
    if (index < 0 || !ctx) continue;
    figures.push({ canvas, ctx, index, cols: 0, rows: 0, time: startTime, clock: canvas.dataset.figureMode === "clock", reveal: still ? 1 : 0, drawn: "", visible: true });
  }
  if (!figures.length) return;

  const draw = (f: Figure) => {
    if (!f.cols || !f.rows) return;
    gl.viewport(0, 0, f.cols, f.rows);
    gl.uniform2f(uRes, f.cols, f.rows);
    gl.uniform1f(uT, Math.floor(f.time * FPS) / FPS);
    gl.uniform1f(uFig, f.index);
    gl.uniform1f(uReveal, f.reveal);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    // Copy the alpha mask, then flood it with the canvas's CSS colour.
    f.ctx.globalCompositeOperation = "copy";
    f.ctx.drawImage(glCanvas, 0, glCanvas.height - f.rows, f.cols, f.rows, 0, 0, f.cols, f.rows);
    f.ctx.globalCompositeOperation = "source-in";
    f.ctx.fillStyle = getComputedStyle(f.canvas).color;
    f.ctx.fillRect(0, 0, f.cols, f.rows);
    f.canvas.dataset.ready = "";
  };

  /** Size a figure's grid to its box: square cells of a whole number of device pixels. */
  const fit = (f: Figure) => {
    const host = f.canvas.parentElement;
    if (!host) return;
    const dpr = window.devicePixelRatio || 1;
    const w = Math.floor(host.clientWidth * dpr);
    const h = Math.floor(host.clientHeight * dpr);
    if (w < 8 || h < 8) return;
    const cell = Math.max(1, Math.round(Math.min(w, h) / CELLS));
    f.cols = Math.floor(w / cell);
    f.rows = Math.floor(h / cell);
    f.canvas.width = f.cols;
    f.canvas.height = f.rows;
    const style = f.canvas.style;
    style.width = `${(f.cols * cell) / dpr}px`;
    style.height = `${(f.rows * cell) / dpr}px`;
    style.left = `${Math.floor((w - f.cols * cell) / 2) / dpr}px`;
    style.top = `${Math.floor((h - f.rows * cell) / 2) / dpr}px`;
    glCanvas.width = Math.max(glCanvas.width, f.cols);
    glCanvas.height = Math.max(glCanvas.height, f.rows);
  };
  const fitAll = () => {
    figures.forEach(fit);
    figures.forEach(draw);
  };

  const resize = new ResizeObserver(fitAll);
  const seen = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const figure = figures.find((f) => f.canvas === entry.target);
      if (figure) figure.visible = entry.isIntersecting;
    }
  });
  for (const f of figures) {
    if (f.canvas.parentElement) resize.observe(f.canvas.parentElement);
    seen.observe(f.canvas);
  }
  window.addEventListener("resize", fitAll);
  fitAll();
  if (still) return;

  const clamp = (v: number) => Math.min(1, Math.max(0, v));
  const began = performance.now();
  let last = began;
  const frame = (now: number) => {
    requestAnimationFrame(frame);
    const dt = Math.min(now - last, 250) / 1000;
    last = now;
    const vh = window.innerHeight;
    for (const f of figures) {
      const box = f.canvas.parentElement;
      if (f.clock) {
        f.time += dt;
        f.reveal = clamp((now - began) / 1000 / BUILD);
      } else if (box && f.visible) {
        // Time and build-up follow the figure's box through the viewport.
        const rect = box.getBoundingClientRect();
        f.time = startTime + clamp((vh - rect.top) / (vh + rect.height)) * SCROLL_SPAN;
        f.reveal = clamp((vh - rect.top) / (vh * 0.6));
      }
      if (!f.visible) continue;
      const state = `${Math.floor(f.time * FPS)}|${f.reveal.toFixed(2)}|${f.cols}x${f.rows}`;
      if (state === f.drawn) continue;
      f.drawn = state;
      draw(f);
    }
  };
  requestAnimationFrame(frame);
}
