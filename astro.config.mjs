// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";
import svelte from "@astrojs/svelte";

// https://astro.build/config
export default defineConfig({
  site: "https://giacomoravetta.com",
  // Every page is prerendered and nothing uses sessions, so the Cloudflare adapter
  // must not add its SESSION KV binding (the deploy fails without a namespace id).
  output: "static",
  session: false,
  integrations: [svelte()],
  // Prefetch every internal link on hover/focus (Astro falls back to "tap" on slow connections or data-saver).
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "hover",
  },
  i18n: {
    defaultLocale: "en",
    locales: ["en", "it"],
    routing: {
      // English lives at "/", Italian at "/it/".
      prefixDefaultLocale: false,
    },
  },
  vite: {
    plugins: [tailwindcss()],
    // Keep the production build's dependency cache apart from the dev server's:
    // sharing one made `astro build` invalidate a running `astro dev` (500 on every page).
    cacheDir: process.env.NODE_ENV === "production" ? "node_modules/.vite-build" : "node_modules/.vite",
  },
  adapter: cloudflare({
    // Resize images at build time with sharp; the worker runtime cannot.
    imageService: "compile",
  }),
});
