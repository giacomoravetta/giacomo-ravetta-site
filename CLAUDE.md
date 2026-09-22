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

- `src/pages/*.astro` English pages; `src/pages/it/*.astro` thin wrappers with Italian slugs. Add a route key in `src/i18n/ui.ts` (`routes`) for each new page.
- `src/layouts/BaseLayout.astro` — head, header, footer. `fullBleed` prop drops the content container.
- `src/components/Header.astro` — floating frosted-glass sticky header (70dvw). Its flow height is `--header-h` in `src/styles/global.css`; keep them in sync.
- `src/components/Triptych.astro` — desktop Home hero (hidden under 768px): three panels of *The Battle of Shijo Nawate* (`src/assets/shijo-nawate/`) scaled as one strip to cover the viewport, desaturated at rest, colour revealed through a canvas brush stroke that follows the pointer; a resting pointer blooms ink over the hovered panel. Panels slide in from below (CSS) once images decode; the brush arms after that.
- `src/components/MobileTriptych.svelte` — phone Home hero (`client:media="(max-width: 767px)"`): the panels stacked full-height, GSAP ScrollTrigger scrubs grey → colour as each scrolls in and sweeps its label in/out. Shares image variants with the desktop version via `src/lib/triptych-images.ts`.
- Svelte is used only for that component. `wrangler.jsonc` sets `nodejs_compat` because Svelte's server renderer imports `node:async_hooks`.

## GSAP notes

- All GSAP plugins are free (gsap ≥ 3.13); SplitText and ScrambleText are used.
- Never put a CSS `transition` on an element GSAP tweens with `autoAlpha`/`from`: the tween settles at opacity 0 and the element stays hidden.
- Kill in-flight tweens (`gsap.killTweensOf`) before staggered enter/leave tweens, otherwise late-starting staggered pieces are left behind.
- Wrap pointer effects in `gsap.matchMedia()` gated on `(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)` and return a cleanup function.
