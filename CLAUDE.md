# giacomo-ravetta-site

Personal site of Giacomo Ravetta. Astro 7 + Tailwind 4 + GSAP, deployed to Cloudflare via `@astrojs/cloudflare`. Bilingual (English at `/`, Italian at `/it/`) through Astro's built-in i18n and the dictionary in `src/i18n/ui.ts`.

## Working rules

- **Do not use MCP servers unless the task actually requires them.** Prefer local tools (file reads, grep, the shell, `npm run build`). Only reach for an MCP server (Playwright, Sanity, docs, etc.) when the task cannot be completed or verified without it, e.g. a visual check the user explicitly asks for.
- Don't commit or push unless asked.
- Keep the site static and dependency-light. Ask before adding packages.

## Commands

- `npm run dev` — dev server on http://localhost:4321 (Astro daemonises it; `npx astro dev stop` to stop).
- `npm run build` — `astro check` + production build. Run this to validate changes. Note: the build clears `node_modules/.vite`, which breaks an already running dev server (every page 500s) — restart it after building.

## Structure

- `src/pages/*.astro` English pages; `src/pages/it/*.astro` thin wrappers with Italian slugs. Add a route key in `src/i18n/ui.ts` (`routes`) for each new page.
- `src/layouts/BaseLayout.astro` — head, header, footer. `fullBleed` prop drops the content container.
- `src/components/Header.astro` — floating frosted-glass sticky header (70dvw). Its flow height is `--header-h` in `src/styles/global.css`; keep them in sync.
- `src/components/Triptych.astro` — Home hero: three viewport-filling panels (cover-cropped, centred) of *The Battle of Shijo Nawate* (`src/assets/shijo-nawate/`), desaturated at rest, colour revealed through a canvas brush stroke that follows the pointer and fills the hovered panel when the pointer is nearly still. Labels are frosted pills. Touch / reduced-motion fall back to full colour with static labels via CSS only.
- `src/components/Hero.astro` — intro paragraph with ScrambleText and magnetic CTAs, rendered below the triptych.

## GSAP notes

- All GSAP plugins are free (gsap ≥ 3.13); SplitText and ScrambleText are used.
- Never put a CSS `transition` on an element GSAP tweens with `autoAlpha`/`from`: the tween settles at opacity 0 and the element stays hidden.
- Kill in-flight tweens (`gsap.killTweensOf`) before staggered enter/leave tweens, otherwise late-starting staggered pieces are left behind.
- Wrap pointer effects in `gsap.matchMedia()` gated on `(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)` and return a cleanup function.
