<svelte:options runes={true} />

<div class="hero-🦸‍♂️ h-[600dvh]">
  <div
    class="wrapper-slice sticky top-0 h-[90dvh] w-full flex flex-col justify-center items-center"
  >
    <div
      class="creative-developer p-5 h-full w-full flex flex-col justify-between sticky top-0"
    >
      <div class="header-wrapper w-full relative">
        <div
          class="home-🏠 font-[Ojuju] text-5xl text-[var(--color-secondary)]"
        >
          &ltGIAC🧿M🧿/ &gt
        </div>
      </div>
      <div class="creative-developer-wrapper w-full h-full flex justify-center">
        <div
          class="creative-developer-text-wrapper flex flex-col justify-center items-center"
        >
          <div class="creative-🎨 relative">
            <h1
              class="relative z-2 font-[Ojuju] text-[12dvw] text-[var(--color-main)] leading-none"
            >
              CREATIVE
            </h1>
          </div>
          <div class="developer-👨‍💻 relative">
            <h1
              class="developer font-[Ojuju] text-[12dvw] text-[var(--color-main)] leading-none"
            >
              DEVELOPER
            </h1>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  @keyframes animateVariable {
    0% {
      font-variation-settings: "wght" 500;
    }
    20% {
      font-variation-settings: "wght" 600;
    }
    50% {
      font-variation-settings: "wght" 800;
    }
    80% {
      font-variation-settings: "wght" 600;
    }
    100% {
      font-variation-settings: "wght" 500;
    }
  }

  @supports (animation-timeline: scroll()) {
    .creative-🎨,
    .developer-👨‍💻 {
      text-shadow: 0.2dvw 0.4dvw #1c448e;
      font-variation-settings: "wght" 500;
      animation: animateVariable 6s ease-in-out 1 forwards;
      animation-timeline: scroll();
      -webkit-text-stroke: 1px #1c448e;
    }

    .home-🏠 {
      font-variation-settings: "wght" 500;
      animation: animateVariable 6s ease-in-out 1 forwards;
      animation-timeline: scroll();
    }
  }

  @supports not (animation-timeline: scroll()) {
    .creative-🎨,
    .developer-👨‍💻 {
      text-shadow: 0.2dvw 0.4dvw #1c448e;
      font-variation-settings: "wght" 500;
      animation: animateVariable 6s ease-in-out 1 forwards;
      -webkit-text-stroke: 1px #1c448e;
    }

    .home-🏠 {
      font-variation-settings: "wght" 500;
      animation: animateVariable 6s ease-in-out 1 forwards;
    }
  }
</style>
