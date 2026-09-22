// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";
import svelte from "@astrojs/svelte";

// https://astro.build/config
export default defineConfig({
  site: "https://giacomoravetta.com",
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
  },
  adapter: cloudflare({
    // Resize images at build time with sharp; the worker runtime cannot.
    imageService: "compile",
  }),
});
