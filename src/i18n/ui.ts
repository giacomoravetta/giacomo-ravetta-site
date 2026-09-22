export const languages = {
  en: "English",
  it: "Italiano",
} as const;

export type Lang = keyof typeof languages;
export const defaultLang: Lang = "en";

/**
 * Route keys map to a path segment per language, so Italian pages can have
 * Italian slugs. Add a key here and a page under src/pages (and src/pages/it).
 */
export const routes = {
  home: { en: "", it: "" },
  work: { en: "work", it: "lavori" },
  about: { en: "about", it: "chi-sono" },
  services: { en: "services", it: "servizi" },
} as const;

export type RouteKey = keyof typeof routes;

export const ui = {
  en: {
    "site.name": "Giacomo Ravetta",
    "site.tagline": "Designer & developer",
    "site.description": "Giacomo Ravetta — designer and developer building thoughtful digital products.",

    "nav.home": "Home",
    "nav.about": "About me",
    "nav.services": "Services",
    "nav.work": "Work",
    "nav.language": "Language",
    "nav.skip": "Skip to content",

    "home.title": "Home",
    "home.heading": "Designer & developer.",
    "home.intro":
      "I design and build digital products, from brand and interface to the code that ships them.",
    "home.cta.services": "See what I do",
    "home.cta.about": "More about me",
    "hero.left": "designer",
    "hero.center": "Giacomo Ravetta",
    "hero.right": "developer",
    "hero.alt.left": "The Battle of Shijo Nawate, left panel",
    "hero.alt.center": "The Battle of Shijo Nawate, center panel",
    "hero.alt.right": "The Battle of Shijo Nawate, right panel",

    "work.title": "Work",
    "work.heading": "Work",
    "work.intro": "A selection of projects I've designed, built or visualized.",
    "work.cinemaSaronno.title": "Cinema Saronno",
    "work.cinemaSaronno.body": "Website design and development for a local cinema.",
    "work.studioAlbanese.title": "Studio Albanese",
    "work.studioAlbanese.body": "Website design and development for an architecture studio.",
    "work.librariesOfMilan.title": "Libraries of Milan",
    "work.librariesOfMilan.body": "A data visualization project mapping Milan's public libraries.",
    "work.giustoDiRendere.title": "Giusto Di Rendere",
    "work.giustoDiRendere.body": "A civic and political project site.",

    "about.title": "About me",
    "about.heading": "About me",
    "about.intro":
      "I am Giacomo, a designer and developer working at the intersection of visual design and engineering.",
    "about.body":
      "I care about details, clear communication and products that feel considered. I work with startups, studios and independent clients.",
    "about.photo.alt": "Portrait of Giacomo Ravetta",

    "services.title": "Services",
    "services.heading": "Services",
    "services.intro": "How I can help, from first sketch to production.",
    "services.design.title": "Design",
    "services.design.body": "Brand identity, interface design and design systems that scale.",
    "services.development.title": "Development",
    "services.development.body": "Fast, accessible websites and web apps built with modern tooling.",
    "services.consulting.title": "Consulting",
    "services.consulting.body": "Product strategy, audits and hands-on support for your team.",
    "services.cta": "Get in touch",

    "footer.rights": "All rights reserved.",
  },
  it: {
    "site.name": "Giacomo Ravetta",
    "site.tagline": "Designer & sviluppatore",
    "site.description": "Giacomo Ravetta — designer e sviluppatore di prodotti digitali curati.",

    "nav.home": "Home",
    "nav.about": "Chi sono",
    "nav.services": "Servizi",
    "nav.work": "Lavori",
    "nav.language": "Lingua",
    "nav.skip": "Vai al contenuto",

    "home.title": "Home",
    "home.heading": "Designer & sviluppatore.",
    "home.intro":
      "Progetto e sviluppo prodotti digitali, dal brand e dall'interfaccia fino al codice che li porta online.",
    "home.cta.services": "Scopri cosa faccio",
    "home.cta.about": "Chi sono",
    "hero.left": "designer",
    "hero.center": "Giacomo Ravetta",
    "hero.right": "sviluppatore",
    "hero.alt.left": "La battaglia di Shijo Nawate, pannello sinistro",
    "hero.alt.center": "La battaglia di Shijo Nawate, pannello centrale",
    "hero.alt.right": "La battaglia di Shijo Nawate, pannello destro",

    "work.title": "Lavori",
    "work.heading": "Lavori",
    "work.intro": "Una selezione di progetti che ho progettato, sviluppato o visualizzato.",
    "work.cinemaSaronno.title": "Cinema Saronno",
    "work.cinemaSaronno.body": "Design e sviluppo del sito per un cinema locale.",
    "work.studioAlbanese.title": "Studio Albanese",
    "work.studioAlbanese.body": "Design e sviluppo del sito per uno studio di architettura.",
    "work.librariesOfMilan.title": "Libraries of Milan",
    "work.librariesOfMilan.body": "Un progetto di data visualization sulle biblioteche pubbliche di Milano.",
    "work.giustoDiRendere.title": "Giusto Di Rendere",
    "work.giustoDiRendere.body": "Un sito per un progetto civico e politico.",

    "about.title": "Chi sono",
    "about.heading": "Chi sono",
    "about.intro":
      "Sono Giacomo, designer e sviluppatore. Lavoro dove il design visivo incontra l'ingegneria.",
    "about.body":
      "Mi interessano i dettagli, la comunicazione chiara e i prodotti che sembrano pensati con cura. Lavoro con startup, studi e clienti indipendenti.",
    "about.photo.alt": "Ritratto di Giacomo Ravetta",

    "services.title": "Servizi",
    "services.heading": "Servizi",
    "services.intro": "Come posso aiutarti, dal primo schizzo alla produzione.",
    "services.design.title": "Design",
    "services.design.body": "Identità visiva, design di interfacce e design system che crescono con te.",
    "services.development.title": "Sviluppo",
    "services.development.body": "Siti e web app veloci e accessibili, costruiti con strumenti moderni.",
    "services.consulting.title": "Consulenza",
    "services.consulting.body": "Strategia di prodotto, audit e supporto concreto al tuo team.",
    "services.cta": "Contattami",

    "footer.rights": "Tutti i diritti riservati.",
  },
} as const satisfies Record<Lang, Record<string, string>>;

export type UiKey = keyof (typeof ui)[typeof defaultLang];

/**
 * Home intro split into segments so the hero can decode the emphasised words
 * with ScrambleText. Keep `home.intro` above in sync; it is used for plain text.
 */
export type IntroSegment = { text: string; scramble?: boolean };
export const homeIntro: Record<Lang, IntroSegment[]> = {
  en: [
    { text: "I design and build digital products, from " },
    { text: "brand", scramble: true },
    { text: " and " },
    { text: "interface", scramble: true },
    { text: " to the " },
    { text: "code", scramble: true },
    { text: " that ships them." },
  ],
  it: [
    { text: "Progetto e sviluppo prodotti digitali, dal " },
    { text: "brand", scramble: true },
    { text: " e dall'" },
    { text: "interfaccia", scramble: true },
    { text: " fino al " },
    { text: "codice", scramble: true },
    { text: " che li porta online." },
  ],
};
