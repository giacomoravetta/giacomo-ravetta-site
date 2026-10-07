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
- `src/components/Triptych.astro` — pointer Home hero for wide screens with a mouse (hidden under 1024px and on touch devices): three panels of *The Battle of Shijo Nawate* (`src/assets/shijo-nawate/`) scaled as one strip to cover the viewport, desaturated at rest, colour revealed through a speed-sensitive sumi-e brush that follows the pointer (wide and wet when slow, thin with dry-brush bristle streaks when fast, ink spatter on sharp turns); a resting pointer drops an ink-wash bloom — one pre-made sumi-ink blot texture (plus two smaller drops) scaled up into the stroke mask until the hovered panel is in full colour (a few drawImage calls per frame, no per-pixel JS) — while the other two panels dim. Side words: "designer" letters settle in from a blur (SplitText), "developer" decodes (ScrambleText), and while a panel is hovered the other two are covered by a solid, neutral ink black (`.tint`, `--fx-bg: #0e0d0c`, z-index 2 over the paint canvas). The side panels' hover effects are laid out together over them as a staggered collage (`makeBoard` + per-scene `Slot` {cx, cy, w} as fractions of the whole dimmed area: one large lead scene, smaller ones offset around it, no dividing lines), each scene headed by a numbered service keyword (`.fx-kw`, i18n keys `hero.fx.*`; Bluu Next for Designer rising in, Terminal Grotesque for Developer decoding); cascade entry, then each scene loops on its own with a random pause. Colours: the hovered side's key colour (`--fx-key`) plus its complement as second accent (`--fx-alt`) — `FX_COLORS`: Designer vermilion/teal, centre gold/indigo, Developer mint/magenta. Designer scenes: Brand identity (pen-tool vector), Color systems (eyedropper palette), Layout & UI (12-column grid), Typography (type specimen); Developer: Automation & AI (workflow webhook → AI agent → CRM/email with pulses), Websites (browser page assembling), E-commerce (add to cart, cart badge, checkout steps). Each scene is a root-level `.fx` element animated with transforms, opacity, dash offsets and ScrambleText only; hovering the centre panel instead reveals the whole work: its ink-wash bloom starts at once and covers all three panels (plus a drop in each side panel), with no dimming and no effects (`isWhole`/`bloomRect`). The centre panel carries only a screen-reader `h1` and links nowhere (side panels link to the Services subpages). Panels slide in from below (CSS) once images decode; the brush arms after that.
- `src/components/MobileTriptych.svelte` — stepped Home hero for phones, tablets and touch devices (`client:media="(max-width: 1023px), (hover: none), (pointer: coarse)"`, same query as `.scroll-hero` in global.css): a seven-step story — 0 designer panel, 1–2 Designer services, 3 the centre panel in colour (no link), 4 developer panel, 5–6 Developer services. The page is locked (`html.hero-locked`: overflow hidden + body `position: fixed` + `touch-action: none`, so the mobile address bar never hides/shows; verified `scrollY` stays 0) and GSAP Observer turns each swipe/wheel/arrow key into one step, `tl.tweenTo("rest-i")` on one paused timeline (input ignored while a step plays); progress dots above the fixed footer. Services steps cover the panel with ink black (`[data-mtint]`) and play the shared scenes via `makeBoard` (only the visible step runs). The scenes come from the page as a slot (`<MobileTriptych><HeroScenes /></MobileTriptych>`, rendered with `{@render children()}`). Shares image variants with the desktop version via `src/lib/triptych-images.ts`.
- `src/components/HeroScenes.astro` + `src/lib/hero-scenes.ts` — the service scenes shared by both heroes: markup and styles (each `.fx` hidden, positioned by its host) and their GSAP factories (`createHeroScenes`), the collage board (`makeBoard`, `Slot`, `Area`) and `FX_COLORS`.
- Svelte is used only for that component. `wrangler.jsonc` sets `nodejs_compat` because Svelte's server renderer imports `node:async_hooks`.

## Astro pitfalls

- Don't use a regex containing `<` or `>` in a component's frontmatter: the Astro compiler misparses it and the whole component fails to type-check ("no default export"). Use `replaceAll` with plain strings.

## GSAP notes

- All GSAP plugins are free (gsap ≥ 3.13); SplitText and ScrambleText are used.
- Never put a CSS `transition` on an element GSAP tweens with `autoAlpha`/`from`: the tween settles at opacity 0 and the element stays hidden.
- Kill in-flight tweens (`gsap.killTweensOf`) before staggered enter/leave tweens, otherwise late-starting staggered pieces are left behind.
- Wrap pointer effects in `gsap.matchMedia()` gated on `(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)` and return a cleanup function.
