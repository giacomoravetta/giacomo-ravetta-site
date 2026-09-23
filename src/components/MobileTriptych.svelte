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

  onMount(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const sections = Array.from(root.querySelectorAll<HTMLElement>("[data-mpanel]"));
      const n = sections.length;

      // Pin the stage and scrub the track sideways: one viewport of scroll per panel.
      const slide = gsap.to(track, {
        xPercent: -100 * ((n - 1) / n),
        ease: "none",
        scrollTrigger: {
          trigger: root,
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          end: () => "+=" + window.innerWidth * (n - 1),
          invalidateOnRefresh: true,
        },
      });

      const cleanups = sections.map((section) => {
        const img = section.querySelector<HTMLElement>("[data-mimage]")!;
        const label = section.querySelector<HTMLElement>("[data-mlabel]")!;
        const key = section.dataset.mpanel;
        const from =
          key === "left" ? { xPercent: -120, yPercent: 0 } : key === "right" ? { xPercent: 120, yPercent: 0 } : { xPercent: 0, yPercent: 160 };

        // Colour + zoom scrubbed against the horizontal motion: grey at the right
        // edge of the viewport, full colour once the panel is fully in view.
        const wash = gsap.fromTo(
          img,
          { filter: "grayscale(1) brightness(0.6)", scale: 1.08 },
          {
            filter: "grayscale(0) brightness(1)",
            scale: 1,
            ease: "none",
            immediateRender: true,
            scrollTrigger: {
              trigger: section,
              containerAnimation: slide,
              start: "left 90%",
              end: "left 10%",
              scrub: 0.6,
            },
          },
        );

        // Label: sweeps in when most of the panel is on screen, out when it leaves.
        gsap.set(label, { ...from, autoAlpha: 0 });
        const show = () => gsap.to(label, { xPercent: 0, yPercent: 0, autoAlpha: 1, duration: 0.9, ease: "power3.out", overwrite: true });
        const hide = () => gsap.to(label, { ...from, autoAlpha: 0, duration: 0.5, ease: "power2.in", overwrite: true });
        const reveal = ScrollTrigger.create({
          trigger: section,
          containerAnimation: slide,
          start: "left 60%",
          end: "right 40%",
          onEnter: show,
          onEnterBack: show,
          onLeave: hide,
          onLeaveBack: hide,
        });
        // The first panel is already in view at the top of the page.
        if (key === "left") show();

        return () => {
          wash.scrollTrigger?.kill();
          wash.kill();
          reveal.kill();
        };
      });

      return () => {
        cleanups.forEach((fn) => fn());
        slide.scrollTrigger?.kill();
        slide.kill();
      };
    });

    return () => mm.revert();
  });
</script>

<section class="mobile-triptych" bind:this={root} aria-label="Giacomo Ravetta">
  <div class="track" bind:this={track}>
  {#each panels as p (p.key)}
    <figure class="mpanel" data-mpanel={p.key}>
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
</section>

<style>
  /* Viewport-sized stage; ScrollTrigger pins it and slides the track sideways. */
  .mobile-triptych {
    position: relative;
    height: 100svh;
    overflow: hidden;
    background: var(--color-background);
  }

  .track {
    display: flex;
    height: 100%;
    width: max-content;
    will-change: transform;
  }

  .mpanel {
    position: relative;
    flex: 0 0 100vw;
    height: 100%;
    margin: 0;
    overflow: hidden;
  }

  .mimage {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
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

  /* Reduced motion: no pin, no scrub; a native horizontal swipe strip instead. */
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
  }
</style>
