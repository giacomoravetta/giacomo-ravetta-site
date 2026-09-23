<script lang="ts">
  /**
   * Scroll-driven Home hero for phones, tablets and touch devices.
   * The three Shijo Nawate panels sit side by side in a pinned, viewport-sized
   * stage; vertical scrolling slides them horizontally. Each panel washes from
   * grey into colour as it crosses the viewport and its label sweeps in
   * (left → right, right → left, bottom → top) while the panel is in view.
   * Reduced motion: a plain horizontal swipe strip, full colour, static labels.
   */
  import { onMount } from "svelte";
  import gsap from "gsap";
  import { ScrollTrigger } from "gsap/ScrollTrigger";

  export type MobilePanel = {
    key: "left" | "center" | "right";
    src: string;
    srcset: string;
    sizes: string;
    width: number;
    height: number;
    alt: string;
    label: string;
  };

  let { panels }: { panels: MobilePanel[] } = $props();

  let root: HTMLElement;
  let track: HTMLElement;
  // Drive state classes through Svelte so its scoped CSS keeps the selectors.
  let started = $state(false);
  let isStatic = $state(false);

  onMount(() => {
    gsap.registerPlugin(ScrollTrigger);
    // Mobile browsers resize the viewport when the address bar collapses; skip the
    // refresh those resizes would trigger so the pinned stage does not jump.
    ScrollTrigger.config({ ignoreMobileResize: true });
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const sections = Array.from(root.querySelectorAll<HTMLElement>("[data-mpanel]"));
      const n = sections.length;
      try {
        // Drive scrolling from JS instead of the browser: on most phones the address
        // bar then never collapses (no viewport resize, no jump), overscroll bounce is
        // gone and pin updates stay in sync with paint. Home page only (this component
        // is only rendered there); switched off again on teardown.
        ScrollTrigger.normalizeScroll(true);
        const teardown = setup(sections, n);
        return () => {
          teardown();
          ScrollTrigger.normalizeScroll(false);
        };
      } catch (err) {
        ScrollTrigger.normalizeScroll(false);
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
    // points (label fully in, image fixed) and scrolling snaps to them.
    const TEXT = 2;
    const SLIDE = 1;
    const PX_PER_UNIT = 0.75; // × viewport width of scroll per timeline unit
    const total = (n - 1) * (TEXT + SLIDE) + TEXT;
    // Rest points as timeline progress: the start, then "label fully in" for each panel.
    const restPoints = [0, ...Array.from({ length: n }, (_, i) => (i * (TEXT + SLIDE) + TEXT) / total)];

    const onStart = () => {
      if (started) return;
      started = true;
    };

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: root,
        pin: true,
        scrub: 0.6,
        anticipatePin: 1,
        end: () => "+=" + Math.round(window.innerWidth * PX_PER_UNIT * total),
        invalidateOnRefresh: true,
        // Never rest mid-way: settle on the nearest rest point (or the very start).
        snap: {
          snapTo: restPoints,
          directional: false,
          duration: { min: 0.25, max: 0.8 },
          delay: 0.05,
          ease: "power2.inOut",
        },
        onUpdate: (self) => {
          if (self.progress > 0.005) onStart();
        },
      },
    });
    tl.addLabel("start", 0);

    sections.forEach((section, i) => {
      const img = section.querySelector<HTMLElement>("[data-mimage]")!;
      const label = section.querySelector<HTMLElement>("[data-mlabel]")!;
      const key = section.dataset.mpanel;
      const from =
        key === "left" ? { xPercent: -120, yPercent: 0 } : key === "right" ? { xPercent: 120, yPercent: 0 } : { xPercent: 0, yPercent: 160 };
      const out = { xPercent: from.xPercent * 0.5, yPercent: from.yPercent * 0.5 };
      const t0 = i * (TEXT + SLIDE);

      // Initial state: label parked off, every image but the first grey and zoomed.
      gsap.set(label, { ...from, autoAlpha: 0 });
      if (i > 0) gsap.set(img, { filter: "grayscale(1) brightness(0.6)", scale: 1.08 });

      // Text phase: image fixed, label sweeps in with the scroll.
      tl.to(label, { xPercent: 0, yPercent: 0, autoAlpha: 1, duration: TEXT, ease: "power2.out" }, t0);
      tl.addLabel(`rest-${i}`, t0 + TEXT);

      // Slide phase: label leaves, stage moves on, next image washes into colour.
      if (i < n - 1) {
        const nextImg = sections[i + 1].querySelector<HTMLElement>("[data-mimage]")!;
        tl.to(label, { ...out, autoAlpha: 0, duration: SLIDE * 0.5, ease: "power2.in" }, t0 + TEXT);
        tl.to(track, { xPercent: (-100 * (i + 1)) / n, duration: SLIDE }, t0 + TEXT);
        tl.to(nextImg, { filter: "grayscale(0) brightness(1)", scale: 1, duration: SLIDE }, t0 + TEXT);
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
      <div class="mimage-wrap">
        <img
          class="mimage"
          src={p.src}
          srcset={p.srcset}
          sizes={p.sizes}
          width={p.width}
          height={p.height}
          alt={p.alt}
          loading={p.key === "left" ? "eager" : "lazy"}
          decoding="async"
          data-mimage
        />
      </div>
      {#if p.key === "center"}
        <h1 class="mlabel mlabel-center" data-mlabel>{p.label}</h1>
      {:else}
        <p class="mlabel mlabel-side mlabel-{p.key}" style="--chars: {p.label.length}" data-mlabel>
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
  .mimage {
    display: block;
    height: max(100svh, calc(100vw * 2145 / 1160));
    width: auto;
    max-width: none;
    will-change: transform, filter;
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
    font-size: calc(60svh / (var(--chars, 9) * 0.47));
    letter-spacing: -0.02em;
    line-height: 1;
  }
  .mlabel-side .mlabel-text {
    display: block;
    rotate: 180deg;
  }
  .mlabel-left {
    left: 1rem;
  }
  .mlabel-right {
    right: 1rem;
  }

  .mlabel-center {
    left: 0;
    right: 0;
    top: 50%;
    margin-top: -0.55em;
    width: fit-content;
    margin-inline: auto;
    white-space: nowrap;
    font-size: clamp(1.75rem, 9vw, 3rem);
    letter-spacing: -0.02em;
    line-height: 1.1;
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
    .mobile-triptych {
      overflow-x: auto;
      scroll-snap-type: x mandatory;
    }
    .mpanel {
      scroll-snap-align: start;
    }
    .mimage,
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
</style>
