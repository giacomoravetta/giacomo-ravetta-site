/**
 * Service scenes of the Home hero (markup in src/components/HeroScenes.astro), shared by
 * the desktop triptych and the mobile hero: one factory per scene, a board that lays a
 * set of scenes out as a collage and loops them, and the colours of each side.
 * Every animation is transforms, opacity, dash offsets or ScrambleText — no layout work.
 */
import gsap from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

gsap.registerPlugin(ScrambleTextPlugin);

/** A scene: its element, a function that (re)builds and plays its timeline, a reset. */
export type Scene = { el: HTMLElement | SVGSVGElement; play: () => gsap.core.Timeline; revert: () => void };

/** Key colour of each side and its complement (second accent), as --fx-key / --fx-alt. */
export const FX_COLORS = {
  left: { key: "#ff6a3d", alt: "#19c3c9" }, // vermilion ↔ teal
  center: { key: "#f2c14e", alt: "#6b7bff" }, // gold ↔ indigo
  right: { key: "#3dffb0", alt: "#ff3d9a" }, // mint ↔ magenta
} as const;

/** Build the scenes found inside `root` (null when a scene's markup is missing). */
export function createHeroScenes(root: HTMLElement) {
  // Designer hover: a pen tool draws a bezier over layout guides, then the shape is
  // selected (box, corner handles, size chip). Transforms, opacity and dash offsets only.
  const makeDrawer = () => {
    const wrap = root.querySelector<HTMLElement>("[data-fx-vector]");
    const svg = wrap?.querySelector<SVGSVGElement>("[data-design]");
    if (!wrap || !svg) return null;
    const q = <T extends Element>(sel: string) => Array.from(svg.querySelectorAll<T>(sel));
    const guides = q<SVGLineElement>(".d-guides line");
    const handles = q<SVGElement>(".d-handles > *");
    const path = svg.querySelector<SVGPathElement>(".d-path")!;
    const anchors = q<SVGRectElement>(".d-anchors rect");
    const select = svg.querySelector<SVGRectElement>(".d-select")!;
    const corners = q<SVGRectElement>(".d-corners rect");
    const chip = svg.querySelector<SVGGElement>(".d-chip")!;
    const cursor = svg.querySelector<SVGPathElement>(".d-cursor")!;
    const len = path.getTotalLength();
    const box = 2 * (260 + 150);
    let tl: gsap.core.Timeline | undefined;
    const pt = (f: number) => path.getPointAtLength(len * f);

    const play = () => {
      tl?.kill();
      gsap.set(handles, { autoAlpha: 0 });
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
      gsap.set([...anchors, ...corners], { scale: 0, transformOrigin: "50% 50%" });
      gsap.set(select, { strokeDasharray: box, strokeDashoffset: box });
      gsap.set(chip, { autoAlpha: 0, y: 6 });
      const p0 = pt(0);
      gsap.set(cursor, { x: p0.x, y: p0.y, autoAlpha: 0 });

      tl = gsap.timeline({ defaults: { ease: "power2.out" } });
      // Guides slide in from their edges.
      tl.fromTo(
        guides,
        { autoAlpha: 0, scaleX: (i: number) => (i < 2 ? 0 : 1), scaleY: (i: number) => (i < 2 ? 1 : 0), transformOrigin: "0 0" },
        { autoAlpha: 0.7, scaleX: 1, scaleY: 1, duration: 0.6, stagger: 0.08 },
      );
      // The pen: the cursor follows the curve while the stroke draws behind it.
      tl.to(cursor, { autoAlpha: 1, duration: 0.15 }, 0.3);
      const prog = { f: 0 };
      tl.to(
        prog,
        {
          f: 1,
          duration: 1.6,
          ease: "power1.inOut",
          onUpdate: () => {
            const p = pt(prog.f);
            gsap.set(cursor, { x: p.x, y: p.y });
            gsap.set(path, { strokeDashoffset: len * (1 - prog.f) });
          },
        },
        0.4,
      );
      // Anchors pop as the pen reaches them; their handles fan out.
      anchors.forEach((a, i) => tl!.to(a, { scale: 1, duration: 0.3, ease: "back.out(3)" }, 0.4 + i * 0.8));
      tl.to(handles, { autoAlpha: 1, duration: 0.3, stagger: 0.12 }, 0.6);
      // Select: handles go, the box is drawn, corners and the size chip appear.
      tl.to(handles, { autoAlpha: 0, duration: 0.3 }, 2.3);
      tl.to(cursor, { x: 300, y: 205, duration: 0.5, ease: "power2.inOut" }, 2.2);
      tl.to(select, { strokeDashoffset: 0, duration: 0.6, ease: "power2.inOut" }, 2.4);
      tl.to(corners, { scale: 1, duration: 0.3, ease: "back.out(3)", stagger: 0.06 }, 2.8);
      tl.to(chip, { autoAlpha: 1, y: 0, duration: 0.35 }, 3);
      return tl;
    };
    const revert = () => {
      tl?.kill();
      gsap.set([wrap, ...guides, ...handles, path, ...anchors, select, ...corners, chip, cursor], { clearProps: "all" });
    };
    return { el: wrap, play, revert };
  };

  // Small helper for the scenes below: a scene whose parts are reset by clearProps.
  const scene = (sel: string, build: (el: HTMLElement, q: (s: string) => HTMLElement[]) => gsap.core.Timeline): Scene | null => {
    const el = root.querySelector<HTMLElement>(sel);
    if (!el) return null;
    const q = (s: string) => Array.from(el.querySelectorAll<HTMLElement>(s));
    let tl: gsap.core.Timeline | undefined;
    return {
      el,
      play: () => {
        tl?.kill();
        tl = build(el, q);
        return tl;
      },
      revert: () => {
        tl?.kill();
        gsap.set([el, ...q("*")], { clearProps: "all" });
      },
    };
  };

  // Designer: an eyedropper samples the print's palette, swatch by swatch.
  const paletteScene = scene("[data-fx-palette]", (_el, q) => {
    const sw = q(".chip");
    const hex = q(".hex");
    const dropper = q(".dropper")[0];
    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
    tl.set(sw, { scale: 0 }).set(hex, { autoAlpha: 0 }).set(q(".cap"), { autoAlpha: 0, y: 8 });
    tl.set(dropper, { x: -40, y: 0, autoAlpha: 0 }).to(dropper, { autoAlpha: 1, duration: 0.2 });
    sw.forEach((c, i) => {
      const x = c.offsetLeft + c.offsetWidth / 2 - 4;
      tl.to(dropper, { x, duration: 0.35, ease: "power2.inOut" }, 0.2 + i * 0.45);
      tl.to(dropper, { y: 10, duration: 0.1, yoyo: true, repeat: 1 }, ">");
      tl.to(c, { scale: 1, duration: 0.45, ease: "back.out(2.5)" }, "<");
      tl.to(hex[i], { autoAlpha: 1, duration: 0.6, scrambleText: { text: hex[i].dataset.hex ?? "", chars: "0123456789ABCDEF", speed: 0.8 } }, "<");
    });
    tl.to(dropper, { autoAlpha: 0, y: -20, duration: 0.3 }, ">0.1");
    tl.to(q(".cap"), { autoAlpha: 1, y: 0, duration: 0.4 }, "<");
    return tl;
  });

  // Designer: a 12-column grid rises, blocks snap into it, the gutter is measured.
  const gridScene = scene("[data-fx-grid]", (_el, q) => {
    const cols = q(".col");
    const blks = q(".blk");
    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
    tl.fromTo(cols, { scaleY: 0, transformOrigin: "50% 100%" }, { scaleY: 1, duration: 0.5, stagger: { each: 0.04, from: "center" } });
    tl.fromTo(
      blks,
      { autoAlpha: 0, x: (i: number) => (i === 1 ? 60 : -60), y: (i: number) => (i === 2 ? 30 : -20), rotation: (i: number) => (i - 1) * 6 },
      { autoAlpha: 1, x: 0, y: 0, rotation: 0, duration: 0.7, ease: "back.out(1.6)", stagger: 0.25 },
      0.4,
    );
    tl.fromTo(q(".gap-tag"), { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.3 }, ">-0.1");
    return tl;
  });

  // Designer: a type specimen cycles through the site's faces on its guides.
  const FACES = [
    ["font-bluu", "Bluu Next"],
    ["font-young", "Young Serif"],
    ["font-instrument", "Instrument Sans"],
    ["font-terminal", "Terminal Grotesque"],
  ];
  const typeScene = scene("[data-fx-type]", (_el, q) => {
    const aa = q(".aa")[0];
    const name = q(".name")[0];
    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
    tl.fromTo(q(".line"), { scaleX: 0, transformOrigin: "0 50%" }, { scaleX: 1, duration: 0.6, stagger: 0.1 });
    FACES.forEach(([cls, label], i) => {
      const t = 0.3 + i * 0.75;
      tl.to(aa, { autoAlpha: 0, yPercent: -12, duration: 0.15, ease: "power2.in" }, t);
      tl.call(() => {
        aa.classList.remove(...FACES.map((f) => f[0]));
        aa.classList.add(cls);
        name.textContent = label;
      }, undefined, t + 0.15);
      tl.fromTo(aa, { autoAlpha: 0, yPercent: 12 }, { autoAlpha: 1, yPercent: 0, duration: 0.35 }, t + 0.15);
    });
    return tl;
  });

  // Developer · automation & AI: the workflow's nodes appear, its edges are drawn, then
  // a run flows through it: webhook → the AI agent thinks → CRM and email fire.
  const flowScene = scene("[data-fx-flow]", (_el, q) => {
    const edges = q(".edge") as unknown as SVGPathElement[];
    const nodes = q(".node");
    const pulses = q(".pulse");
    const lens = edges.map((e) => e.getTotalLength());
    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
    tl.set(pulses, { autoAlpha: 0 });
    tl.fromTo(nodes, { scale: 0.6, autoAlpha: 0, transformOrigin: "50% 50%" }, { scale: 1, autoAlpha: 1, duration: 0.4, ease: "back.out(2)", stagger: 0.12 });
    edges.forEach((e, k) => tl.fromTo(e, { strokeDasharray: lens[k], strokeDashoffset: lens[k] }, { strokeDashoffset: 0, duration: 0.45 }, 0.3 + k * 0.15));
    // Move a pulse along an edge.
    const travel = (k: number, at: number, dur = 0.6) => {
      const pr = { f: 0 };
      tl.set(pulses[k], { autoAlpha: 1 }, at);
      tl.to(pr, {
        f: 1,
        duration: dur,
        ease: "power1.inOut",
        onUpdate: () => {
          const pt = edges[k].getPointAtLength(lens[k] * pr.f);
          gsap.set(pulses[k], { attr: { cx: pt.x, cy: pt.y } });
        },
      }, at);
      tl.set(pulses[k], { autoAlpha: 0 }, at + dur);
    };
    const glow = (n: Element, at: number, color = "var(--fx-key)") =>
      tl.to(n.querySelector("rect"), { stroke: color, strokeWidth: 3, duration: 0.15, yoyo: true, repeat: 1 }, at);
    glow(nodes[0], 1.1);
    travel(0, 1.2);
    // The agent "thinks": its outline breathes while it classifies.
    tl.to(nodes[1], { scale: 1.06, duration: 0.25, yoyo: true, repeat: 3, ease: "sine.inOut" }, 1.8);
    travel(1, 2.8);
    travel(2, 2.8);
    glow(nodes[2], 3.4, "var(--fx-alt)");
    glow(nodes[3], 3.4, "var(--fx-alt)");
    tl.fromTo(q(".log"), { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.3 }, 3.6);
    return tl;
  });

  // Developer · website: the URL is typed, the page assembles as a skeleton, the
  // content fills in, the Lighthouse score lands.
  const webScene = scene("[data-fx-web]", (_el, q) => {
    const url = q(".url")[0];
    const full = url.dataset.url ?? "";
    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
    tl.call(() => (url.textContent = ""));
    tl.fromTo(q(".browser"), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.4 });
    const typed = { n: 0 };
    tl.to(typed, { n: full.length, duration: full.length * 0.045, ease: "none", onUpdate: () => (url.textContent = full.slice(0, Math.round(typed.n))) }, 0.3);
    const parts = [...q(".logo"), ...q(".links b"), ...q(".h1"), ...q(".h2"), ...q(".btn"), ...q(".cards span")];
    tl.fromTo(parts, { autoAlpha: 0, scaleX: 0.3, transformOrigin: "0 50%" }, { autoAlpha: 1, scaleX: 1, duration: 0.4, stagger: 0.07 }, ">0.1");
    tl.fromTo(q(".cards span"), { y: 10 }, { y: 0, duration: 0.4, ease: "back.out(2)", stagger: 0.1 }, "<0.3");
    tl.fromTo(q(".btn"), { scale: 1 }, { scale: 1.12, duration: 0.15, yoyo: true, repeat: 1, transformOrigin: "50% 50%" }, ">");
    tl.fromTo(q(".score"), { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.3 }, "<");
    return tl;
  });

  // Developer · e-commerce: "add to cart" is pressed, an item flies into the cart, the
  // badge counts up, checkout runs through its steps and the order is confirmed.
  const shopScene = scene("[data-fx-shop]", (_el, q) => {
    const add = q(".add")[0];
    const cart = q(".cart")[0];
    const badge = q(".badge")[0];
    const fly = q(".fly")[0];
    const steps = q(".steps span");
    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
    tl.call(() => {
      badge.textContent = "0";
      steps.forEach((st) => st.classList.remove("on"));
    });
    tl.set(q(".fill"), { scaleX: 0 }).set(q(".ok"), { autoAlpha: 0 });
    tl.fromTo(q(".product"), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.45 });
    tl.fromTo(cart, { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.35, ease: "back.out(2)" }, 0.2);
    for (let n = 1; n <= 2; n++) {
      const at = 0.6 + (n - 1) * 0.9;
      tl.to(add, { scale: 0.92, duration: 0.1, yoyo: true, repeat: 1 }, at);
      // The item arcs from the button into the cart.
      tl.call(() => {
        const from = { x: add.offsetLeft + add.offsetWidth / 2, y: add.offsetTop };
        const to = { x: cart.offsetLeft + cart.offsetWidth / 2, y: cart.offsetTop + cart.offsetHeight / 2 };
        gsap.set(fly, { x: from.x, y: from.y, autoAlpha: 1, scale: 1 });
        gsap.to(fly, { x: to.x, duration: 0.55, ease: "power1.in" });
        gsap.to(fly, { y: to.y, duration: 0.55, ease: "back.in(2.5)" });
        gsap.to(fly, { autoAlpha: 0, scale: 0.4, duration: 0.15, delay: 0.45 });
      }, undefined, at + 0.1);
      tl.call(() => (badge.textContent = String(n)), undefined, at + 0.65);
      tl.fromTo(badge, { scale: 1.6 }, { scale: 1, duration: 0.35, ease: "back.out(3)" }, at + 0.65);
    }
    tl.fromTo(q(".checkout"), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.3 }, ">0.1");
    steps.forEach((st, k) => {
      tl.call(() => st.classList.add("on"), undefined, `>${k ? 0.25 : 0}`);
      tl.to(q(".fill"), { scaleX: (k + 1) / steps.length, duration: 0.35, ease: "power2.inOut" }, "<");
    });
    tl.fromTo(q(".ok"), { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.3 }, ">0.1");
    return tl;
  });

  return {
    vector: makeDrawer(),
    palette: paletteScene,
    grid: gridScene,
    type: typeScene,
    flow: flowScene,
    web: webScene,
    shop: shopScene,
  };
}

/**
 * Board: a set of scenes laid out together in an area as a staggered collage (each
 * scene centred on its slot and scaled to the slot's width). `start(area)` lays them
 * out and plays them: they enter in a cascade, then each loops on its own with a
 * slightly different pause. `stop()` fades them out, `revert()` clears everything.
 */
const fit = new Map<Element, number>(); // scale given to each scene by its slot
/** Slot, relative to the board's area: the scene's centre (cx, cy) and its target
 *  width (w), as fractions of the area; `h` caps its height (default 0.6). */
export type Slot = { cx: number; cy: number; w: number; h?: number };
export type Area = { x: number; y: number; w: number; h: number };
const PAD = 28; // keep scenes this far inside the area, px
const placeInArea = (el: HTMLElement | SVGSVGElement, area: Area, slot: Slot) => {
  gsap.set(el, { scale: 1, x: 0, y: 0 });
  const b = el.getBoundingClientRect(); // hidden via visibility, still measurable
  const sc = Math.min((area.w * slot.w) / b.width, (area.h * (slot.h ?? 0.6)) / b.height);
  fit.set(el, sc);
  const sw = b.width * sc;
  const sh = b.height * sc;
  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
  const x = clamp(area.x + area.w * slot.cx - sw / 2, area.x + PAD, area.x + area.w - PAD - sw);
  const y = clamp(area.y + area.h * slot.cy - sh / 2, area.y, area.y + area.h - sh);
  gsap.set(el, { x, y, scale: sc, transformOrigin: "0 0" });
};
export const makeBoard = (list: [Scene | null, Slot][]) => {
  const items = list.filter((x): x is [Scene, Slot] => !!x[0]);
  const scenes = items.map(([sc]) => sc);
  const loops = new Map<Scene, gsap.core.Timeline>();
  const calls: gsap.core.Tween[] = [];
  const loop = (sc: Scene, delay: number) => {
    const sc0 = fit.get(sc.el) ?? 1;
    const tl = gsap.timeline({ delay, onComplete: () => loop(sc, 0.15) });
    tl.fromTo(sc.el, { autoAlpha: 0, scale: sc0 * 0.97 }, { autoAlpha: 1, scale: sc0, duration: 0.4, ease: "power2.out" });
    // The service keyword leads: Designer's rises in, Developer's decodes.
    const kw = sc.el.querySelector<HTMLElement>(".fx-kw .t");
    if (kw) {
      kw.dataset.text ??= kw.textContent ?? "";
      if (sc.el.classList.contains("fx-developer"))
        tl.to(kw, { duration: 0.8, scrambleText: { text: kw.dataset.text, chars: "01<>/[]{}#*=+-", speed: 0.6 } }, 0);
      else tl.fromTo(kw, { autoAlpha: 0, yPercent: 60 }, { autoAlpha: 1, yPercent: 0, duration: 0.6, ease: "power3.out" }, 0);
    }
    tl.add(sc.play(), 0.25);
    tl.to(sc.el, { autoAlpha: 0, duration: 0.35, ease: "power2.in" }, `>${gsap.utils.random(1.6, 2.8)}`);
    loops.set(sc, tl);
  };
  const stopAll = () => {
    calls.forEach((c) => c.kill());
    calls.length = 0;
    loops.forEach((tl) => tl.kill());
    loops.clear();
  };
  return {
    start: (area: Area) => {
      stopAll();
      items.forEach(([sc, slot]) => {
        gsap.set(sc.el, { autoAlpha: 0 });
        placeInArea(sc.el, area, slot);
      });
      scenes.forEach((sc, k) => calls.push(gsap.delayedCall(0.3 + k * 0.18, () => loop(sc, 0))));
    },
    stop: () => {
      stopAll();
      gsap.to(scenes.map((sc) => sc.el), { autoAlpha: 0, duration: 0.35, ease: "power2.out", overwrite: "auto" });
    },
    revert: () => {
      stopAll();
      scenes.forEach((sc) => sc.revert());
    },
  };
};
