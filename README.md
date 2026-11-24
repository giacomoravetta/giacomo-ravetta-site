# giacomoravetta.com

Personal portfolio site of Giacomo Ravetta. This branch is the 2026 redesign, currently a minimal Astro scaffold.

## Tech stack

- [Astro](https://astro.build) with the [Cloudflare adapter](https://docs.astro.build/en/guides/integrations-guide/cloudflare/)
- [Tailwind CSS v4](https://tailwindcss.com) (via `@tailwindcss/vite`)
- Deployed on [Cloudflare](https://workers.cloudflare.com)

## Commands

| Command             | Action                                            |
| :------------------ | :------------------------------------------------ |
| `npm install`       | Install dependencies                              |
| `npm run dev`       | Start the dev server at `localhost:4321`          |
| `npm run build`     | Type-check (`astro check`) and build to `./dist/` |
| `npm run preview`   | Preview the production build locally              |
| `npx wrangler deploy` | Deploy `dist/client` to Cloudflare              |
