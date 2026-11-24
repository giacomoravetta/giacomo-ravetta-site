/**
 * sitemap.xml, built at build time from the route table: every page in every language,
 * each with its hreflang alternates (and x-default = the default language), as Google
 * asks for multilingual sites. No package needed for a site this size.
 */
import type { APIRoute } from "astro";
import { defaultLang, languages, routes, type Lang, type RouteKey } from "../i18n/ui";
import { localizedPath } from "../i18n/utils";

export const GET: APIRoute = ({ site }) => {
  const origin = site ?? new URL("http://localhost:4321");
  const langs = Object.keys(languages) as Lang[];
  const abs = (route: RouteKey, lang: Lang) => new URL(localizedPath(route, lang), origin).href;
  const urls = (Object.keys(routes) as RouteKey[]).flatMap((route) =>
    langs.map((lang) =>
      [
        "  <url>",
        `    <loc>${abs(route, lang)}</loc>`,
        ...langs.map((alt) => `    <xhtml:link rel="alternate" hreflang="${alt}" href="${abs(route, alt)}"/>`),
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${abs(route, defaultLang)}"/>`,
        "  </url>",
      ].join("\n"),
    ),
  );
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urls,
    "</urlset>",
    "",
  ].join("\n");
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
