<script lang="ts">
  /**
   * Scroll-driven Home hero for phones, tablets and touch devices.
   * The three Shijo Nawate panels sit side by side in a pinned, viewport-sized
   * stage; vertical scrolling slides them horizontally. Each panel washes from
   * grey into colour as it crosses the viewport and its side label sweeps in.
   * Scrolling stays native (no hijacking, momentum kept); once the finger or wheel
   * lets go, ScrollTrigger snaps to the nearest rest point in the scroll direction.
   * Reduced motion: a plain horizontal swipe strip, full colour, static labels.
   */
  import { onMount } from "svelte";
  import gsap from "gsap";
  import { ScrollTrigger } from "gsap/ScrollTrigger";
  import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
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
    /** Centre only: visible caption ("About me"), letters rise like the desktop one. */
    caption?: string;
  };

  let { panels }: { panels: MobilePanel[] } = $props();

  let root: HTMLElement;
  let track: HTMLElement;
  // Drive state classes through Svelte so its scoped CSS keeps the selectors.
  let started = $state(false);
  let isStatic = $state(false);

  onMount(() => {
    gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin, SplitText);
    gsap.config({ force3D: true }); // keep scrubbed elements on compositor layers
    // Mobile browsers resize the viewport when the address bar collapses; skip the
    // refresh those resizes would trigger so the pinned stage does not jump.
    ScrollTrigger.config({ ignoreMobileResize: true });
    const mm = gsap.matchMedia();

    // Same split as the CSS/client:media query, so growing a window past the
    // breakpoint reverts everything here (pin, snapping) as the desktop hero
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
    // One scrubbed timeline. Per panel: the image holds still while scrolling
    // drives its label in (TEXT units), then the stage slides to the next image
    // (SLIDE units) while that image washes into colour. Labels mark the rest
    // points (label fully in, image fixed) that the scroll snaps to.
    const TEXT = 2;
    const SLIDE = 1;
    // Scroll distance per timeline unit, as a share of the viewport height: about
    // one screen per panel, so a normal flick moves one step and the hero never
    // feels like a wall to scroll through.
    const VH_PER_UNIT = 0.35;
    const total = (n - 1) * (TEXT + SLIDE) + TEXT;

    const onStart = () => {
      if (started) return;
      started = true;
    };

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: root,
        pin: true,
        scrub: 0.3,
        anticipatePin: 1,
        end: () => "+=" + Math.round(window.innerHeight * VH_PER_UNIT * total),
        invalidateOnRefresh: true,
        // Settle on the next rest point in the scroll direction after the gesture
        // ends; the duration scales with the distance left to travel.
        snap: {
          snapTo: "labelsDirectional",
          duration: { min: 0.25, max: 0.7 },
          delay: 0.08,
          ease: "power2.inOut",
          inertia: false, // velocity would fling past the centre; always the next rest point
        },
        onUpdate: (self) => {
          if (self.progress > 0.005) onStart();
        },
      },
    });
    tl.addLabel("start", 0);

    sections.forEach((section, i) => {
      const img = section.querySelector<HTMLElement>("[data-mimage]")!; // colour copy
      const wrap = section.querySelector<HTMLElement>("[data-mwrap]")!;
      // The centre panel has no side label; its caption is animated in CSS instead.
      const label = section.querySelector<HTMLElement>("[data-mlabel]");
      const key = section.dataset.mpanel;
      const from = key === "left" ? { xPercent: -120 } : { xPercent: 120 };
      const out = { xPercent: from.xPercent * 0.5 };
      const t0 = i * (TEXT + SLIDE);

      // Initial state: label hidden, every image but the first grey and zoomed.
      if (label) gsap.set(label, { ...from, autoAlpha: 0 });
      if (i > 0) {
        gsap.set(img, { autoAlpha: 0 });
        gsap.set(wrap, { scale: 1.08 });
      }

      // Text phase: image fixed, label sweeps in with the scroll.
      if (label) tl.to(label, { xPercent: 0, autoAlpha: 1, duration: TEXT, ease: "power2.out" }, t0);
      // Centre: flip [data-hero-center] on <html> (same as desktop) so the caption's
      // CSS letters-rise plays and the footer steps aside, in both scroll directions.
      if (key === "center") {
        const set = (v: string) => () => (document.documentElement.dataset.heroCenter = v);
        tl.to({}, { duration: TEXT * 0.4, onStart: set("in"), onReverseComplete: set("out") }, t0 + TEXT * 0.3);
        if (i < n - 1) tl.to({}, { duration: SLIDE * 0.3, onStart: set("out"), onReverseComplete: set("in") }, t0 + TEXT);
      }
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
        tl.to(track, { xPercent: (-100 * (i + 1)) / n, duration: SLIDE }, t0 + TEXT);
        tl.to(nextImg, { autoAlpha: 1, duration: SLIDE }, t0 + TEXT);
        tl.to(nextWrap, { scale: 1, duration: SLIDE }, t0 + TEXT);
      }
    });

    return () => {
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
        <h1 class="sr-only">{p.label}</h1>
        {#if p.caption}
          <!-- Same markup as SplitWord.astro, so the global letters-rise CSS applies. -->
          <p class="mcaption font-young uppercase" aria-hidden="true">
            <span class="split-word">
              {#each [...p.caption] as c, i}
                <span class="ch" style="--i: {i}">{c === " " ? "\u00a0" : c}</span>
              {/each}
            </span>
          </p>
        {/if}
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

  /* Centre caption: letters wait below their line until [data-hero-center="in"]. */
  .mcaption {
    position: absolute;
    left: 0;
    right: 0;
    bottom: calc(1.5rem + env(safe-area-inset-bottom));
    z-index: 1;
    margin: 0;
    text-align: center;
    font-size: clamp(2.5rem, 12vw, 5rem);
    font-weight: 700;
    line-height: 1;
    letter-spacing: 0.01em;
    color: var(--color-foreground);
    text-shadow: 0 2px 24px rgb(0 0 0 / 0.6);
    pointer-events: none;
  }
  .mcaption :global(.ch) {
    translate: 0 115%;
  }
  :global(:root[data-hero-center="in"]) .mcaption :global(.ch) {
    animation: letter-in 0.9s cubic-bezier(0.22, 1, 0.36, 1) calc(var(--i) * 45ms) both;
  }
  :global(:root[data-hero-center="out"]) .mcaption :global(.ch) {
    animation: letter-out 0.45s cubic-bezier(0.55, 0, 0.75, 0) calc(var(--i) * 25ms) both;
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
    .mcaption :global(.ch) {
      translate: none;
    }
  }
  .is-static {
    overflow-x: auto;
    scroll-snap-type: x mandatory;
  }
  .is-static .mpanel {
    scroll-snap-align: start;
  }
  .is-static .mcaption :global(.ch) {
    translate: none;
  }
  .is-static .mimage-color {
    opacity: 1 !important;
    visibility: visible !important;
  }
</style>
