<script lang="ts">
  /**
   * Stepped Home hero for phones, tablets and touch devices: a seven-step story.
   *   0 designer panel · 1–2 Designer services · 3 the whole work (About me)
   *   4 developer panel · 5–6 Developer services
   * The document never scrolls (so the mobile address bar never hides/shows): the page
   * is locked and GSAP Observer turns each swipe, wheel or arrow key into one step,
   * tweening one paused timeline to the next or previous rest label. On a services
   * step the panel goes ink black and its scenes (shared with the desktop hero, see
   * HeroScenes.astro / src/lib/hero-scenes.ts) play as a small collage; only the
   * visible step's scenes run.
   * Reduced motion: a plain horizontal swipe strip, full colour, static labels.
   */
  import { onMount, type Snippet } from "svelte";
  import gsap from "gsap";
  import { Observer } from "gsap/Observer";
  import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
  import { SplitText } from "gsap/SplitText";
  import { createHeroScenes, makeBoard, FX_COLORS, type Area } from "../lib/hero-scenes";

  export type MobilePanel = {
    key: "left" | "center" | "right";
    src: string;
    srcset: string;
    sizes: string;
    width: number;
    height: number;
    alt: string;
    label: string;
    href?: string;
  };

  // children: the service scenes (HeroScenes.astro), passed from the page as a slot.
  let { panels, children }: { panels: MobilePanel[]; children?: Snippet } = $props();
  const center = panels.find((p) => p.key === "center");
  const STEPS = 7;

  let root: HTMLElement;
  let track: HTMLElement;
  // Drive state classes through Svelte so its scoped CSS keeps the selectors.
  let started = $state(false);
  let isStatic = $state(false);
  let step = $state(-1); // current rest step, for the progress dots

  onMount(() => {
    gsap.registerPlugin(Observer, ScrambleTextPlugin, SplitText);
    gsap.config({ force3D: true }); // keep scrubbed elements on compositor layers
    const mm = gsap.matchMedia();

    // Same split as the CSS/client:media query, so growing a window past the
    // breakpoint reverts everything here (page lock, input) as the desktop hero
    // takes over, and shrinking it back re-initialises.
    mm.add("(prefers-reduced-motion: no-preference) and ((max-width: 1023px) or (hover: none) or (pointer: coarse))", () => {
      const sections = Array.from(root.querySelectorAll<HTMLElement>("[data-mpanel]"));
      const n = sections.length;
      try {
        return setup(sections, n);
      } catch (err) {
        // Anything unexpected (very old engine, pinning failure…): show the plain,
        // full-colour horizontal swipe strip instead of a broken animation.
        console.warn("[MobileTriptych] scroll animation unavailable, using static strip", err);
        isStatic = true;
        return () => {
          isStatic = false;
        };
      }
    });

    return () => {
      mm.revert();
      document.documentElement.removeAttribute("data-hero-center");
    };
  });

  function setup(sections: HTMLElement[], n: number) {
    const [L, C, R] = sections;
    const parts = (sec: HTMLElement) => ({
      img: sec.querySelector<HTMLElement>("[data-mimage]")!, // colour copy
      wrap: sec.querySelector<HTMLElement>("[data-mwrap]")!,
      label: sec.querySelector<HTMLElement>("[data-mlabel]"),
    });
    const l = parts(L);
    const c = parts(C);
    const r = parts(R);
    const tint = root.querySelector<HTMLElement>("[data-mtint]")!;
    const whole = root.querySelector<HTMLElement>("[data-mwhole]")!;
    const html = document.documentElement;
    const setCenter = (v: string) => () => (html.dataset.heroCenter = v);

    // Initial state: labels off to their side, the centre and right images grey and
    // zoomed, no black, the whole-work view small and hidden.
    if (l.label) gsap.set(l.label, { xPercent: -120, autoAlpha: 0 });
    if (r.label) gsap.set(r.label, { xPercent: 120, autoAlpha: 0 });
    gsap.set([c.img, r.img], { autoAlpha: 0 });
    gsap.set([c.wrap, r.wrap], { scale: 1.08 });
    gsap.set(tint, { autoAlpha: 0 });
    gsap.set(whole, { autoAlpha: 0, scale: 1.3 });

    const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });
    tl.addLabel("start", 0);

    // 0 · designer: the word sweeps in, letters rising one after another.
    if (l.label) {
      tl.to(l.label, { xPercent: 0, autoAlpha: 1, duration: 2, ease: "power2.out" }, 0);
      const text = l.label.querySelector<HTMLElement>(".mlabel-text");
      if (text) {
        const chars = SplitText.create(text, { type: "chars" }).chars as HTMLElement[];
        tl.fromTo(
          chars,
          { autoAlpha: 0, yPercent: 70, rotation: -8 },
          { autoAlpha: 1, yPercent: 0, rotation: 0, duration: 0.9, ease: "power2.out", stagger: 1 / chars.length },
          0.2,
        );
      }
    }
    tl.addLabel("rest-0", 2);

    // 1–2 · Designer services: the word leaves, the panel goes ink black.
    if (l.label) tl.to(l.label, { xPercent: -60, autoAlpha: 0, duration: 0.5, ease: "power2.in" }, 2);
    tl.to(tint, { autoAlpha: 1, duration: 1 }, 2);
    tl.addLabel("rest-1", 3);
    tl.to({}, { duration: 0.6 }, 3); // the scenes change, the stage holds
    tl.addLabel("rest-2", 3.6);

    // 3 · the whole work: slide to the centre in colour, then step back to see all
    // three panels together over the black.
    tl.to(tint, { autoAlpha: 0, duration: 0.8 }, 3.6);
    tl.to(track, { xPercent: -100 / n, duration: 1 }, 3.6);
    tl.to(c.img, { autoAlpha: 1, duration: 1 }, 3.6);
    tl.to(c.wrap, { scale: 1, duration: 1 }, 3.6);
    tl.to(tint, { autoAlpha: 1, duration: 0.8 }, 4.6);
    tl.to(whole, { autoAlpha: 1, scale: 1, duration: 1, ease: "power2.out" }, 4.6);
    tl.to({}, { duration: 0.4, onStart: setCenter("in"), onReverseComplete: setCenter("out") }, 5);
    tl.addLabel("rest-3", 5.6);

    // 4 · developer: the whole view folds away, slide on to the right panel, the word
    // decodes from scrambled glyphs.
    tl.to({}, { duration: 0.2, onStart: setCenter("out"), onReverseComplete: setCenter("in") }, 5.6);
    tl.to(whole, { autoAlpha: 0, scale: 0.92, duration: 0.6, ease: "power2.in" }, 5.6);
    tl.to(tint, { autoAlpha: 0, duration: 0.8 }, 5.8);
    tl.to(track, { xPercent: (-100 * 2) / n, duration: 1 }, 5.8);
    tl.to(r.img, { autoAlpha: 1, duration: 1 }, 5.8);
    tl.to(r.wrap, { scale: 1, duration: 1 }, 5.8);
    if (r.label) {
      tl.to(r.label, { xPercent: 0, autoAlpha: 1, duration: 2, ease: "power2.out" }, 6.8);
      const text = r.label.querySelector<HTMLElement>(".mlabel-text");
      if (text) tl.to(text, { duration: 1.8, scrambleText: { text: text.textContent ?? "", chars: "01<>/[]{}#*=+-", speed: 0.6 } }, 6.9);
    }
    tl.addLabel("rest-4", 8.8);

    // 5–6 · Developer services.
    if (r.label) tl.to(r.label, { xPercent: 60, autoAlpha: 0, duration: 0.5, ease: "power2.in" }, 8.8);
    tl.to(tint, { autoAlpha: 1, duration: 1 }, 8.8);
    tl.addLabel("rest-5", 9.8);
    tl.to({}, { duration: 0.6 }, 9.8);
    tl.addLabel("rest-6", 10.4);

    // Service scenes per step: two at most on a phone, stacked and offset.
    const fxs = createHeroScenes(root);
    const boards: Record<number, ReturnType<typeof makeBoard>> = {
      1: makeBoard([
        [fxs.vector, { cx: 0.5, cy: 0.27, w: 0.86, h: 0.46 }],
        [fxs.palette, { cx: 0.5, cy: 0.8, w: 0.8, h: 0.34 }],
      ]),
      2: makeBoard([
        [fxs.type, { cx: 0.42, cy: 0.2, w: 0.72, h: 0.34 }],
        [fxs.grid, { cx: 0.55, cy: 0.7, w: 0.88, h: 0.5 }],
      ]),
      5: makeBoard([[fxs.flow, { cx: 0.5, cy: 0.42, w: 0.84, h: 0.7 }]]),
      6: makeBoard([
        [fxs.web, { cx: 0.45, cy: 0.28, w: 0.82, h: 0.48 }],
        [fxs.shop, { cx: 0.56, cy: 0.78, w: 0.66, h: 0.42 }],
      ]),
    };
    const sideOf = (k: number) => (k <= 2 ? "left" : k === 3 ? "center" : "right");
    // Between the compact header and the progress dots.
    const area = (): Area => ({ x: 0, y: root.clientHeight * 0.12, w: root.clientWidth, h: root.clientHeight * 0.72 });

    // Step through the rest points: one gesture = one step, input ignored while a
    // step plays so a long flick never skips a panel.
    let index = -1; // -1: before the first label (hint showing)
    let busy = false;
    const go = (to: number) => {
      to = Math.max(0, Math.min(STEPS - 1, to));
      if (busy || to === index) return;
      busy = true;
      if (!started) started = true;
      boards[index]?.stop();
      const fx = FX_COLORS[sideOf(to)];
      root.style.setProperty("--fx-key", fx.key);
      root.style.setProperty("--fx-alt", fx.alt);
      index = to;
      step = to;
      // Steps between two scene sets only swap the scenes: keep that move short.
      const span = Math.abs(tl.labels[`rest-${to}`] - tl.time());
      tl.tweenTo(`rest-${to}`, {
        duration: gsap.utils.clamp(0.5, 1.6, span * 0.45),
        ease: "power2.inOut",
        onComplete: () => {
          boards[to]?.start(area());
          // Short cooldown swallows the tail of a trackpad/wheel momentum burst.
          gsap.delayedCall(0.15, () => (busy = false));
        },
      });
    };
    const next = () => go(index + 1);
    const prev = () => go(index - 1);

    // Lock the page: nothing scrolls, so the browser chrome stays put.
    html.classList.add("hero-locked");

    const obs = Observer.create({
      target: window,
      type: "wheel,touch,pointer",
      wheelSpeed: -1, // wheel down = forward, like a swipe up
      tolerance: 12,
      dragMinimum: 6,
      lockAxis: true,
      preventDefault: true,
      onUp: next,
      onDown: prev,
      onLeft: next,
      onRight: prev,
    });

    const onKey = (e: KeyboardEvent) => {
      if (["ArrowDown", "ArrowRight", "PageDown", " "].includes(e.key)) next();
      else if (["ArrowUp", "ArrowLeft", "PageUp"].includes(e.key)) prev();
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      obs.kill();
      window.removeEventListener("keydown", onKey);
      html.classList.remove("hero-locked");
      Object.values(boards).forEach((b) => b.revert());
      root.style.removeProperty("--fx-key");
      root.style.removeProperty("--fx-alt");
      step = -1;
      tl.kill();
    };
  }
</script>

<section class="mobile-triptych" class:is-started={started} class:is-static={isStatic} bind:this={root} aria-label="Giacomo Ravetta">
  <div class="track" style="--panels: {panels.length}" bind:this={track}>
  {#each panels as p (p.key)}
    <figure class="mpanel" data-mpanel={p.key}>
      <!-- Grey copy underneath, colour copy on top: the reveal scrubs only the colour
           copy's opacity (compositor-only) instead of re-rasterising a filter each frame. -->
      <div class="mimage-wrap" data-mwrap>
        <img
          class="mimage mimage-grey"
          src={p.src}
          srcset={p.srcset}
          sizes={p.sizes}
          width={p.width}
          height={p.height}
          alt={p.alt}
          loading={p.key === "left" ? "eager" : "lazy"}
          decoding="async"
          draggable="false"
        />
        <img
          class="mimage mimage-color"
          src={p.src}
          srcset={p.srcset}
          sizes={p.sizes}
          width={p.width}
          height={p.height}
          alt=""
          loading={p.key === "left" ? "eager" : "lazy"}
          decoding="async"
          draggable="false"
          data-mimage
        />
      </div>
      {#if p.href}
        <!-- No hover on touch: prefetch once the panel slides into view. -->
        <a class="mpanel-link" href={p.href} aria-label={p.label} data-astro-prefetch="viewport"></a>
      {/if}
      {#if p.key === "center"}
        <h1 class="sr-only">{p.label}</h1>
      {:else}
        <p
          class="mlabel mlabel-side mlabel-{p.key} {p.key === 'left' ? 'font-bluu' : 'font-terminal'}"
          style="--chars: {p.label.length}"
          data-mlabel
        >
          <span class="mlabel-text">{p.label}</span>
        </p>
      {/if}
    </figure>
  {/each}
  </div>
  <!-- Ink black over the current panel on the services steps (taps go through to the
       panel link underneath). -->
  <div class="mtint" aria-hidden="true" data-mtint></div>
  <!-- Step 3: the whole work, the three panels side by side; links to About me. -->
  {#if center?.href}
    <a class="mwhole" href={center.href} aria-label={center.label} data-mwhole>
      {#each panels as p (p.key)}
        <img src={p.src} srcset={p.srcset} sizes="34vw" width={p.width} height={p.height} alt="" loading="lazy" decoding="async" draggable="false" />
      {/each}
    </a>
  {/if}
  <!-- Service scenes (HeroScenes.astro, from the page), placed by the script. -->
  <div class="mfx">
    {@render children?.()}
  </div>
  <!-- Progress: one dot per step. -->
  <div class="mdots" aria-hidden="true">
    {#each Array.from({ length: STEPS }) as _, i}
      <span class:on={i === step}></span>
    {/each}
  </div>
  <!-- Scroll hint: fades out on the first scroll. -->
  <div class="hint" aria-hidden="true">
    <span class="hint-arrow"></span>
  </div>
</section>

<style>
  /* Viewport-sized stage; the page is locked and the timeline slides the track sideways. */
  .mobile-triptych {
    position: relative;
    height: 100svh;
    touch-action: none; /* swipes go to Observer, not to page panning */
    overflow: hidden;
    background: var(--color-background);
  }

  /* Explicit width: Firefox resolves max-content to 0 for a flex row whose items
     only carry a flex-basis, and GSAP's xPercent is relative to this width. */
  .track {
    display: flex;
    height: 100%;
    width: calc(var(--panels, 3) * 100vw);
    will-change: transform;
  }

  .mpanel {
    position: relative;
    flex: 0 0 100vw;
    width: 100vw;
    height: 100%;
    margin: 0;
    overflow: hidden;
  }

  /* One shared scale for all three prints so the triptych stays vertically aligned:
     every image is as tall as the taller of (viewport height) and (the height at
     which the narrowest print, 1160px wide, fills the viewport width). Wider prints
     then overflow sideways and are centred; all three share the same vertical crop. */
  .mimage-wrap {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    overflow: hidden;
  }
  .mimage-wrap {
    will-change: transform; /* the zoom lives on the wrapper */
  }
  .mimage {
    grid-area: 1 / 1;
    display: block;
    -webkit-user-drag: none;
    user-select: none;
    height: max(100svh, calc(100vw * 2145 / 1160));
    width: auto;
    max-width: none;
  }
  /* The centre print is the widest, so it crops the most: centre it in its panel.
     The wrapper's implicit grid column grows to the image width and starts at the
     left edge, so place-items alone would crop only its right side. */
  [data-mpanel="center"] .mimage {
    position: absolute;
    left: 50%;
    top: 50%;
    translate: -50% -50%;
  }
  .mimage-grey {
    filter: grayscale(1) brightness(0.6); /* static: rasterised once */
  }
  .mimage-color {
    will-change: opacity;
  }

  .mpanel-link {
    position: absolute;
    inset: 0;
    z-index: 2;
  }

  .mlabel {
    position: absolute;
    z-index: 1;
    margin: 0;
    font-weight: 600;
    color: var(--color-foreground);
    text-shadow: 0 2px 24px rgb(0 0 0 / 0.6);
    will-change: transform, opacity;
    pointer-events: none;
  }

  /* Side words: vertical, bottom → top, ~60% of the viewport height. */
  .mlabel-side {
    top: 50%;
    margin-top: -30svh;
    writing-mode: vertical-rl;
    white-space: nowrap;
    font-size: calc(60svh / (var(--chars, 9) * var(--adv, 0.47)));
    letter-spacing: -0.02em;
    line-height: 1;
  }
  .mlabel-side .mlabel-text {
    display: block;
    rotate: 180deg;
  }
  .mlabel-left {
    --adv: 0.47;
    left: 1rem;
  }
  .mlabel-right {
    --adv: 0.416;
    right: 1rem;
  }

  /* Services steps and the whole-work step sit on ink black; the scenes take their
     colours from --fx-key / --fx-alt (set per step by the script). */
  .mobile-triptych {
    --fx-key: #ff6a3d;
    --fx-alt: #19c3c9;
  }
  .mtint {
    position: absolute;
    inset: 0;
    z-index: 3;
    background: #0e0d0c;
    pointer-events: none;
    opacity: 0;
    visibility: hidden;
  }
  .mwhole {
    position: absolute;
    left: 4vw;
    right: 4vw;
    top: 50%;
    z-index: 4;
    display: grid;
    grid-template-columns: 1164fr 1478fr 1160fr; /* the three prints' widths */
    translate: 0 -60%;
    box-shadow: 0 20px 60px rgb(0 0 0 / 0.6);
    opacity: 0;
    visibility: hidden;
  }
  .mwhole img {
    display: block;
    width: 100%;
    height: auto;
  }
  .mfx {
    position: absolute;
    inset: 0;
    z-index: 5;
    pointer-events: none;
  }
  .mdots {
    position: absolute;
    left: 0;
    right: 0;
    bottom: calc(5.25rem + env(safe-area-inset-bottom)); /* above the fixed footer */
    z-index: 6;
    display: flex;
    justify-content: center;
    gap: 0.45rem;
    pointer-events: none;
  }
  .mdots span {
    width: 0.4rem;
    height: 0.4rem;
    border-radius: 99px;
    background: rgb(255 255 255 / 0.4);
    transition:
      width 0.3s ease,
      background-color 0.3s ease;
  }
  .mdots span.on {
    width: 1.2rem;
    background: var(--fx-key);
  }

  /* While the stepped hero runs the document never scrolls, so mobile browsers
     keep their address bar still (no collapse/expand, no pull-to-refresh). */
  :global(html.hero-locked),
  :global(html.hero-locked body) {
    overflow: hidden;
    overscroll-behavior: none;
    height: 100%;
  }
  /* iOS Safari can still drag an overflow-hidden body (and collapse its toolbars on the
     way); pinning the body and refusing touch panning on the page closes that gap. */
  :global(html.hero-locked body) {
    position: fixed;
    inset: 0;
    width: 100%;
    touch-action: none;
  }

  /* Scroll hint: a small chevron bobbing at the bottom until the first scroll. */
  .hint {
    position: absolute;
    left: 50%;
    bottom: 3.25rem;
    z-index: 2;
    width: 2.75rem;
    height: 2.75rem;
    margin-left: -1.375rem;
    border-radius: 999px;
    border: 1.5px solid rgb(255 255 255 / 0.7);
    background: rgb(0 0 0 / 0.45);
    box-shadow: 0 4px 16px rgb(0 0 0 / 0.4);
    pointer-events: none;
    animation: hint-bob 1.6s ease-in-out infinite;
    transition: opacity 0.4s ease;
  }
  .hint-arrow {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 0.7rem;
    height: 0.7rem;
    margin: -0.55rem 0 0 -0.35rem;
    border-right: 2px solid var(--color-foreground);
    border-bottom: 2px solid var(--color-foreground);
    transform: rotate(45deg);
  }
  .is-started .hint,
  .is-static .hint {
    opacity: 0;
    animation: none;
  }
  @keyframes hint-bob {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(8px);
    }
  }

  /* Reduced motion, or the fallback when the scroll animation cannot run:
     no pin, no scrub; a native horizontal swipe strip, full colour, labels shown. */
  @media (prefers-reduced-motion: reduce) {
    .mimage-color {
      opacity: 1 !important;
      visibility: visible !important;
    }
    .mobile-triptych {
      touch-action: pan-x;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
    }
    .mpanel {
      scroll-snap-align: start;
    }
    .mimage-wrap,
    .mimage-color,
    .track {
      will-change: auto;
    }
    .hint,
    .mtint,
    .mwhole,
    .mfx,
    .mdots {
      display: none;
    }
  }
  .is-static {
    touch-action: pan-x;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
  }
  .is-static .mpanel {
    scroll-snap-align: start;
  }
  .is-static .mtint,
  .is-static .mwhole,
  .is-static .mfx,
  .is-static .mdots {
    display: none;
  }
  .is-static .mimage-color {
    opacity: 1 !important;
    visibility: visible !important;
  }
</style>
