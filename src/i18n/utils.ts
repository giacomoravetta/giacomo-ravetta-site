import { defaultLang, languages, routes, ui, type Lang, type RouteKey, type UiKey } from "./ui";

export function isLang(value: string | undefined): value is Lang {
  return value !== undefined && value in languages;
}

/** Reads the language from a URL. English has no prefix; Italian lives under /it/. */
export function getLangFromUrl(url: URL): Lang {
  const [, first] = url.pathname.split("/");
  return isLang(first) ? first : defaultLang;
}

/** Returns a translate function bound to a language, falling back to English. */
export function useTranslations(lang: Lang) {
  return function t(key: UiKey): string {
    return ui[lang][key] ?? ui[defaultLang][key];
  };
}

/** Builds the localized path for a route key, e.g. ("about", "it") → "/it/chi-sono/". */
export function localizedPath(route: RouteKey, lang: Lang): string {
  const slug = routes[route][lang];
  const prefix = lang === defaultLang ? "" : `/${lang}`;
  const path = `${prefix}/${slug}`.replace(/\/+/g, "/");
  return path.endsWith("/") ? path : `${path}/`;
}

/** Finds the route key for a URL so the language switcher can link to the same page. */
export function getRouteFromUrl(url: URL): RouteKey {
  const lang = getLangFromUrl(url);
  const segments = url.pathname.split("/").filter(Boolean);
  // Slugs may be nested (e.g. "services/designer"), so compare the whole path after the prefix.
  const slug = (lang === defaultLang ? segments : segments.slice(1)).join("/");
  const match = (Object.keys(routes) as RouteKey[]).find((key) => routes[key][lang] === slug);
  return match ?? "home";
}
