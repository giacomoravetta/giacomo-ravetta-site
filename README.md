# giacomoravetta.com

Personal portfolio site of Giacomo Ravetta — a single-page bento-style layout with animated cards.

## Tech stack

- [Astro](https://astro.build) with the [Cloudflare adapter](https://docs.astro.build/en/guides/integrations-guide/cloudflare/)
- [Tailwind CSS v4](https://tailwindcss.com) (via `@tailwindcss/vite`)
- [GSAP](https://gsap.com) and [Motion](https://motion.dev) for animations
- Deployed on [Cloudflare](https://workers.cloudflare.com)

## Commands

| Command             | Action                                            |
| :------------------ | :------------------------------------------------ |
| `npm install`       | Install dependencies                              |
| `npm run dev`       | Start the dev server at `localhost:4321`          |
| `npm run build`     | Type-check (`astro check`) and build to `./dist/` |
| `npm run preview`   | Preview the production build locally              |
| `npx wrangler deploy` | Deploy `dist/client` to Cloudflare              |
