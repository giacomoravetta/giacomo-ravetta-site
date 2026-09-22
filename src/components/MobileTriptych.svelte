<script lang="ts">
  /**
   * Mobile Home hero: the three Shijo Nawate panels stacked full-height.
   * Scroll drives the reveal: each panel starts desaturated and slightly
   * zoomed and washes into colour as it scrolls through the viewport; its
   * label sweeps in (left → right, right → left, bottom → top) when the panel
   * is well in view, and sweeps back out when it leaves.
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

  onMount(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const sections = Array.from(root.querySelectorAll<HTMLElement>("[data-mpanel]"));

      const triggers = sections.map((section) => {
        const img = section.querySelector<HTMLElement>("[data-mimage]")!;
        const label = section.querySelector<HTMLElement>("[data-mlabel]")!;
        const key = section.dataset.mpanel;
        const from =
          key === "left" ? { xPercent: -120, yPercent: 0 } : key === "right" ? { xPercent: 120, yPercent: 0 } : { xPercent: 0, yPercent: 160 };

        // Colour + zoom scrubbed with scroll: grey at the bottom edge, full colour by the middle.
        const wash = gsap.fromTo(
          img,
          { filter: "grayscale(1) brightness(0.6)", scale: 1.08 },
          {
            filter: "grayscale(0) brightness(1)",
            scale: 1,
            ease: "none",
            scrollTrigger: { trigger: section, start: "top 85%", end: "top 25%", scrub: 0.6 },
          },
        );

        // Label: sweeps in once the panel is mostly in view, sweeps out on the way back.
        gsap.set(label, { ...from, autoAlpha: 0 });
        const reveal = ScrollTrigger.create({
          trigger: section,
          start: "top 60%",
          end: "bottom 40%",
          onEnter: () => gsap.to(label, { xPercent: 0, yPercent: 0, autoAlpha: 1, duration: 0.9, ease: "power3.out", overwrite: true }),
          onLeave: () => gsap.to(label, { ...from, autoAlpha: 0, duration: 0.5, ease: "power2.in", overwrite: true }),
          onEnterBack: () => gsap.to(label, { xPercent: 0, yPercent: 0, autoAlpha: 1, duration: 0.9, ease: "power3.out", overwrite: true }),
          onLeaveBack: () => gsap.to(label, { ...from, autoAlpha: 0, duration: 0.5, ease: "power2.in", overwrite: true }),
        });

        return () => {
          wash.scrollTrigger?.kill();
          wash.kill();
          reveal.kill();
        };
      });

      return () => triggers.forEach((fn) => fn());
    });

    return () => mm.revert();
  });
</script>

<section class="mobile-triptych" bind:this={root} aria-label="Giacomo Ravetta">
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
</section>

<style>
  .mobile-triptych {
    background: var(--color-background);
  }

  .mpanel {
    position: relative;
    height: 100svh;
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

  @media (prefers-reduced-motion: reduce) {
    .mimage {
      will-change: auto;
    }
  }
</style>
