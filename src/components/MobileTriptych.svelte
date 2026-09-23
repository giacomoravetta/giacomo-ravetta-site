<script lang="ts">
  /**
   * Scroll-driven Home hero for phones, tablets and touch devices.
   * The three Shijo Nawate panels sit side by side in a pinned, viewport-sized
   * stage; vertical scrolling slides them horizontally. Each panel washes from
   * grey into colour as it crosses the viewport and its side label sweeps in.
   * Scrolling is paged: every swipe or wheel gesture moves exactly one step
   * (rest point) forward or back; bursts in the same direction count as one.
   * Reduced motion: a plain horizontal swipe strip, full colour, static labels.
   */
  import { onMount } from "svelte";
  import gsap from "gsap";
  import { ScrollTrigger } from "gsap/ScrollTrigger";
  import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
  import { ScrollToPlugin } from "gsap/ScrollToPlugin";
  import { SplitText } from "gsap/SplitText";

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

  let { panels }: { panels: MobilePanel[] } = $props();

  let root: HTMLElement;
  let track: HTMLElement;
  // Drive state classes through Svelte so its scoped CSS keeps the selectors.
  let started = $state(false);
  let isStatic = $state(false);

  onMount(() => {
    gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin, ScrollToPlugin, SplitText);
    // Mobile browsers resize the viewport when the address bar collapses; skip the
    // refresh those resizes would trigger so the pinned stage does not jump.
    ScrollTrigger.config({ ignoreMobileResize: true });
    const mm = gsap.matchMedia();

    // Same split as the CSS/client:media query, so growing a window past the
    // breakpoint reverts everything here (pin, gesture observer) as the desktop hero
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

    return () => mm.revert();
  });

  function setup(sections: HTMLElement[], n: number) {
    // One scrubbed timeline. Per panel: the image holds still while scrolling
    // drives its label in (TEXT units), then the stage slides to the next image
    // (SLIDE units) while that image washes into colour. Labels mark the rest
    // points (label fully in, image fixed); gestures step between them.
    const TEXT = 2;
    const SLIDE = 1;
    const PX_PER_UNIT = 2.25; // × viewport width of scroll per timeline unit
    const total = (n - 1) * (TEXT + SLIDE) + TEXT;
    // Paging: one gesture = one step. Same-direction input is ignored while a step
    // runs, until the gesture that caused it has ended (no events for STOP_DELAY,
    // which also swallows trackpad/wheel inertia), and for COALESCE_MS afterwards.
    const STEP_DURATION = 0.9; // s
    const COALESCE_MS = 350;
    const TOLERANCE = 12; // px of movement before a gesture counts
    const STOP_DELAY = 0.15; // s of silence that ends a gesture
    // Rest points: the start, then "label fully in" for each panel.
    const steps = ["start", ...Array.from({ length: n }, (_, i) => `rest-${i}`)];

    // Gesture observer, created below once the step positions exist.
    let observer: Observer | undefined;

    const onStart = () => {
      if (started) return;
      started = true;
    };

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: root,
        pin: true,
        scrub: 0.25,
        anticipatePin: 1,
        end: () => "+=" + Math.round(window.innerWidth * PX_PER_UNIT * total),
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (self.progress > 0.005) onStart();
        },
        // Below the hero (footer) the page scrolls natively; coming back into the
        // pin hands control back to the gestures, landing on the last step.
        onLeave: () => observer?.disable(),
        onEnterBack: () => {
          observer?.enable();
          goTo(steps.length - 1);
        },
      },
    });
    tl.addLabel("start", 0);

    sections.forEach((section, i) => {
      const img = section.querySelector<HTMLElement>("[data-mimage]")!; // colour copy
      const wrap = section.querySelector<HTMLElement>("[data-mwrap]")!;
      // The centre panel has no visible label (screen-reader heading only).
      const label = section.querySelector<HTMLElement>("[data-mlabel]");
      const scrim = section.querySelector<HTMLElement>("[data-mscrim]");
      const key = section.dataset.mpanel;
      const from = key === "left" ? { xPercent: -120 } : { xPercent: 120 };
      const out = { xPercent: from.xPercent * 0.5 };
      const t0 = i * (TEXT + SLIDE);

      // Initial state: label and scrim hidden, every image but the first grey and zoomed.
      if (label) gsap.set(label, { ...from, autoAlpha: 0 });
      if (scrim) gsap.set(scrim, { autoAlpha: 0 });
      if (i > 0) {
        gsap.set(img, { autoAlpha: 0 });
        gsap.set(wrap, { scale: 1.08 });
      }

      // Text phase: image fixed, label sweeps in with the scroll over its darkening scrim.
      if (label) tl.to(label, { xPercent: 0, autoAlpha: 1, duration: TEXT, ease: "power2.out" }, t0);
      if (scrim) tl.to(scrim, { autoAlpha: 1, duration: TEXT * 0.6, ease: "power1.out" }, t0);
      const text = label?.querySelector<HTMLElement>(".mlabel-text");
      if (key === "left" && text) {
        // designer: letters rise into place one after another (transform + opacity only).
        const chars = SplitText.create(text, { type: "chars" }).chars as HTMLElement[];
        tl.fromTo(
          chars,
          { autoAlpha: 0, yPercent: 70, rotation: -8 },
          { autoAlpha: 1, yPercent: 0, rotation: 0, duration: TEXT * 0.45, ease: "power2.out", stagger: (TEXT * 0.5) / chars.length },
          t0 + TEXT * 0.1,
        );
      } else if (key === "right" && text) {
        // developer: the word decodes from scrambled glyphs.
        tl.to(text, { duration: TEXT * 0.9, scrambleText: { text: text.textContent ?? "", chars: "01<>/[]{}#*=+-", speed: 0.6 } }, t0 + TEXT * 0.05);
      }
      tl.addLabel(`rest-${i}`, t0 + TEXT);

      // Slide phase: label leaves, stage moves on, next image washes into colour.
      if (i < n - 1) {
        const nextImg = sections[i + 1].querySelector<HTMLElement>("[data-mimage]")!;
        const nextWrap = sections[i + 1].querySelector<HTMLElement>("[data-mwrap]")!;
        if (label) tl.to(label, { ...out, autoAlpha: 0, duration: SLIDE * 0.5, ease: "power2.in" }, t0 + TEXT);
        if (scrim) tl.to(scrim, { autoAlpha: 0, duration: SLIDE * 0.5, ease: "power1.in" }, t0 + TEXT);
        tl.to(track, { xPercent: (-100 * (i + 1)) / n, duration: SLIDE }, t0 + TEXT);
        tl.to(nextImg, { autoAlpha: 1, duration: SLIDE }, t0 + TEXT);
        tl.to(nextWrap, { scale: 1, duration: SLIDE }, t0 + TEXT);
      }
    });

    const st = tl.scrollTrigger!;
    const stepY = (i: number) => st.labelToScroll(steps[i]);
    // Nearest step to the current scroll position (robust to refreshes, reloads
    // mid-hero, or anything else that moved the page).
    const nearestStep = () => {
      const y = window.scrollY;
      let best = 0;
      steps.forEach((_, i) => {
        if (Math.abs(stepY(i) - y) < Math.abs(stepY(best) - y)) best = i;
      });
      return best;
    };

    let animating = false;
    let gestureOpen = false;
    let lastDir = 0;
    let lastStepAt = 0;

    const scrollToY = (y: number, onComplete?: () => void) => {
      animating = true;
      gsap.killTweensOf(window);
      gsap.to(window, {
        scrollTo: { y, autoKill: false },
        duration: STEP_DURATION,
        ease: "power2.inOut",
        onComplete: () => {
          animating = false;
          lastStepAt = performance.now();
          onComplete?.();
        },
      });
    };
    function goTo(i: number) {
      scrollToY(stepY(gsap.utils.clamp(0, steps.length - 1, i)));
    }

    const request = (dir: 1 | -1) => {
      if (animating) return;
      if (dir === lastDir && (gestureOpen || performance.now() - lastStepAt < COALESCE_MS)) return;
      gestureOpen = true;
      lastDir = dir;
      const current = nearestStep();
      const next = current + dir;
      if (next < 0) return; // already at the top of the page
      if (next >= steps.length) {
        // Past the last step: release the page and reveal what follows the hero.
        observer?.disable();
        scrollToY(ScrollTrigger.maxScroll(window));
        return;
      }
      goTo(next);
    };

    // wheelSpeed -1 makes "finger up" and "wheel down" both call onUp (= forward).
    // Created disabled: it's only enabled while the page is inside the pinned range.
    observer = ScrollTrigger.observe({
      target: window,
      type: "wheel,touch",
      wheelSpeed: -1,
      tolerance: TOLERANCE,
      preventDefault: true,
      onUp: () => request(1),
      onDown: () => request(-1),
      onStop: () => {
        gestureOpen = false;
      },
      onStopDelay: STOP_DELAY,
    });
    if (window.scrollY >= st.end) observer.disable();

    return () => {
      observer?.kill();
      observer = undefined;
      gsap.killTweensOf(window);
      tl.scrollTrigger?.kill();
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
        <a class="mpanel-link" href={p.href} aria-label={p.label}></a>
      {/if}
      {#if p.key === "center"}
        <!-- The centre image carries no visible text on mobile; the heading stays for screen readers. -->
        <h1 class="sr-only">{p.label}</h1>
      {:else}
        <div class="mscrim mscrim-{p.key}" style="--chars: {p.label.length}" aria-hidden="true" data-mscrim></div>
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
  <!-- Scroll hint: fades out on the first scroll. -->
  <div class="hint" aria-hidden="true">
    <span class="hint-arrow"></span>
  </div>
</section>

<style>
  /* Viewport-sized stage; ScrollTrigger pins it and slides the track sideways. */
  .mobile-triptych {
    position: relative;
    height: 100svh;
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

  /* Readability scrim behind each side word: a full-height band along the outer
     edge, 70% black at the edge fading to transparent, about twice the word's width.
     Earlier in the DOM than the label at the same z-index, so it sits under the word. */
  .mscrim {
    position: absolute;
    top: 0;
    bottom: 0;
    z-index: 1;
    width: calc(1rem + 2 * 60svh / (var(--chars, 9) * var(--adv, 0.47)));
    pointer-events: none;
  }
  .mscrim-left {
    --adv: 0.47;
    left: 0;
    background: linear-gradient(to right, rgb(0 0 0 / 0.7), rgb(0 0 0 / 0));
  }
  .mscrim-right {
    --adv: 0.416;
    right: 0;
    background: linear-gradient(to left, rgb(0 0 0 / 0.7), rgb(0 0 0 / 0));
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
    .hint {
      display: none;
    }
  }
  .is-static {
    overflow-x: auto;
    scroll-snap-type: x mandatory;
  }
  .is-static .mpanel {
    scroll-snap-align: start;
  }
  .is-static .mimage-color {
    opacity: 1 !important;
    visibility: visible !important;
  }
</style>
