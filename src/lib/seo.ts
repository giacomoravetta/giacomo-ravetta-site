/**
 * Structured data (JSON-LD) for every page, as one linked graph: who I am (Person), the
 * business (ProfessionalService with the four services as its catalogue), the site, the
 * page itself, its breadcrumb trail and, where they apply, the Service of a service
 * subpage and the list of projects on Work. Built from the same data the pages use.
 *
 * The place is Saronno, town only: no street address, phone number or email is published
 * here (Giacomo asked for no phone number).
 */
import { languages, type Lang, type RouteKey } from "../i18n/ui";
import { localizedPath, useTranslations } from "../i18n/utils";
import { serviceIds, services } from "../i18n/services";
import { projects } from "../i18n/work";

const JOB_TITLE: Record<Lang, string> = {
  en: "Web designer and developer",
  it: "Web designer e sviluppatore",
};
/** My public profiles, so search engines can tie them to this site. */
const PROFILES = ["https://github.com/giacomoravetta", "https://www.linkedin.com/in/giacomo-ravetta-2876631a7"];
/** Where I am based (town only; no street address or phone number is published). */
const PLACE = {
  "@type": "PostalAddress",
  addressLocality: "Saronno",
  addressRegion: "VA",
  postalCode: "21047",
  addressCountry: "IT",
};
const AREA = { "@type": "City", name: "Saronno" };

type Input = {
  lang: Lang;
  route: RouteKey;
  /** Site origin, e.g. the production domain. */
  site: URL;
  title: string;
  description: string;
  /** Root-relative URL of the portrait. */
  portrait: string;
};

export function structuredData({ lang, route, site, title, description, portrait }: Input): string {
  const t = useTranslations(lang);
  const abs = (path: string) => new URL(path, site).href;
  const url = abs(localizedPath(route, lang));
  const home = abs(localizedPath("home", lang));
  const person = `${site.origin}/#person`;
  const business = `${site.origin}/#business`;
  const website = `${site.origin}/#website`;
  const isService = (serviceIds as readonly string[]).includes(route);

  const crumbs: { name: string; item: string }[] = [{ name: t("home.title"), item: home }];
  if (isService) crumbs.push({ name: t("services.title"), item: abs(localizedPath("services", lang)) });
  if (route !== "home") crumbs.push({ name: title, item: url });

  const graph: Record<string, unknown>[] = [
    {
      "@type": "Person",
      "@id": person,
      name: t("site.name"),
      url: abs("/"),
      image: abs(portrait),
      jobTitle: JOB_TITLE[lang],
      knowsLanguage: Object.keys(languages),
      sameAs: PROFILES,
      address: PLACE,
    },
    {
      "@type": "ProfessionalService",
      "@id": business,
      name: t("site.name"),
      description: t("site.description"),
      url: abs("/"),
      image: abs(`/og-${lang}.png`),
      founder: { "@id": person },
      knowsLanguage: Object.keys(languages),
      sameAs: PROFILES,
      address: PLACE,
      areaServed: AREA,
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: t("services.title"),
        itemListElement: serviceIds.map((id) => ({
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: services[id][lang].name, url: abs(localizedPath(id, lang)) },
        })),
      },
    },
    {
      "@type": "WebSite",
      "@id": website,
      url: abs("/"),
      name: t("site.name"),
      inLanguage: Object.keys(languages),
      publisher: { "@id": person },
    },
    {
      "@type": route === "about" ? "ProfilePage" : "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: title,
      description,
      inLanguage: lang,
      isPartOf: { "@id": website },
      about: { "@id": route === "about" || route === "cv" ? person : business },
      ...(route === "about" ? { mainEntity: { "@id": person } } : {}),
    },
  ];

  if (crumbs.length > 1) {
    graph.push({
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: crumbs.map((crumb, i) => ({ "@type": "ListItem", position: i + 1, ...crumb })),
    });
  }
  if (isService) {
    const service = services[route as (typeof serviceIds)[number]][lang];
    graph.push({
      "@type": "Service",
      "@id": `${url}#service`,
      name: service.name,
      description: service.summary,
      url,
      provider: { "@id": business },
      areaServed: AREA,
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: service.name,
        itemListElement: service.items.map((item) => ({
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: item.name, description: item.summary },
        })),
      },
    });
  }
  if (route === "work") {
    graph.push({
      "@type": "ItemList",
      "@id": `${url}#projects`,
      itemListElement: projects.map((project, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "CreativeWork",
          name: t(`work.${project.key}.title`),
          description: t(`work.${project.key}.body`),
          url: project.url,
          creator: { "@id": person },
        },
      })),
    });
  }
  // "<" is escaped so the JSON can never close the script element it is printed in.
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replaceAll("<", "\\u003c");
}
