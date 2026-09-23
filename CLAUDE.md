# giacomo-ravetta-site

Personal site of Giacomo Ravetta. Astro 7 + Tailwind 4 + GSAP, fully static, deployed to Cloudflare via `@astrojs/cloudflare`. Bilingual (English at `/`, Italian at `/it/`) through Astro's built-in i18n and the dictionary in `src/i18n/ui.ts`.

## Working rules

- **Do not use MCP servers unless the task actually requires them.** Prefer local tools (file reads, grep, the shell, `npm run build`). Only reach for an MCP server (Playwright, Sanity, docs, etc.) when the task cannot be completed or verified without it, e.g. a visual check the user explicitly asks for.
- Don't commit or push unless asked.
- Keep the site static and dependency-light. Ask before adding packages.

## Commands

- `npm run dev` — dev server on http://localhost:4321 (Astro daemonises it; `npx astro dev stop` to stop).
- `npm run build` — `astro check` + production build. Run this to validate changes. The build uses its own Vite cache dir (`node_modules/.vite-build`) so it no longer breaks a running dev server.

## Structure

- `src/pages/*.astro` English pages; `src/pages/it/*.astro` thin wrappers with Italian slugs. Add a route key in `src/i18n/ui.ts` (`routes`) for each new page; slugs may be nested (`services/designer` ↔ `servizi/designer`, `services/developer` ↔ `servizi/sviluppatore`).
- Fonts (self-hosted in `public/fonts`, all OFL): Instrument Sans variable (`font-instrument`) for text; Bluu Next Bold (`font-bluu`) for everything "Designer"; Terminal Grotesque (`font-terminal`) for everything "Developer"; Young Serif Bold (`font-young`, Open Foundry, Latin subset) for everything "About me", split into letters by `SplitWord.astro` for the letters-rise CSS animation. The hero side words use per-face advance factors (`--adv`) to keep equal length.
- `src/layouts/BaseLayout.astro` — head, header, footer. `fullBleed` prop drops the content container.
- `src/components/Header.astro` — desktop: floating frosted-glass sticky bar (70dvw, `glass` utility in global.css, shared with the footer, a content-width tab with square bottom corners), flow height `--header-h` in `src/styles/global.css` (keep in sync). Phones: compact full-width bar fixed over the content plus a full-screen menu (`[data-menu]`, toggled by `[data-menu-toggle]`); container pages add `max-md:pt-24` to clear it.
- `src/components/Triptych.astro` — pointer Home hero for wide screens with a mouse (hidden under 1024px and on touch devices): three panels of *The Battle of Shijo Nawate* (`src/assets/shijo-nawate/`) scaled as one strip to cover the viewport, desaturated at rest, colour revealed through a canvas brush stroke that follows the pointer; a resting pointer sets the hovered panel alight — colour burns out from the pointer and a few stray sparks behind an ember edge, while the other two panels dim. Side words: "designer" letters settle in from a blur (SplitText), "developer" decodes (ScrambleText). The centre panel carries only a screen-reader `h1`. Panels slide in from below (CSS) once images decode; the brush arms after that.
- `src/components/MobileTriptych.svelte` — scroll-driven Home hero for phones, tablets and touch devices: a pinned stage where vertical scroll slides the panels horizontally, paged by a GSAP Observer (each swipe/wheel gesture scrolls one rest point via ScrollToPlugin; same-direction bursts coalesce; released to native scroll past the last step) (`client:media="(max-width: 1023px), (hover: none), (pointer: coarse)"`, same query as `.scroll-hero` in global.css): the panels stacked full-height, GSAP ScrollTrigger scrubs grey → colour as each scrolls in and sweeps its label in/out. Shares image variants with the desktop version via `src/lib/triptych-images.ts`.
- Svelte is used only for that component. `wrangler.jsonc` sets `nodejs_compat` because Svelte's server renderer imports `node:async_hooks`.

## GSAP notes

- All GSAP plugins are free (gsap ≥ 3.13); SplitText and ScrambleText are used.
- Never put a CSS `transition` on an element GSAP tweens with `autoAlpha`/`from`: the tween settles at opacity 0 and the element stays hidden.
- Kill in-flight tweens (`gsap.killTweensOf`) before staggered enter/leave tweens, otherwise late-starting staggered pieces are left behind.
- Wrap pointer effects in `gsap.matchMedia()` gated on `(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)` and return a cleanup function.
