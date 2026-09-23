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
  designer: { en: "services/designer", it: "servizi/designer" },
  developer: { en: "services/developer", it: "servizi/sviluppatore" },
} as const;

export type RouteKey = keyof typeof routes;

export const ui = {
  en: {
    "site.name": "Giacomo Ravetta",
    "site.tagline": "Designer & developer",
    "site.description":
      "Giacomo Ravetta — designer and developer building thoughtful digital products.",

    "nav.home": "Home",
    "nav.about": "About me",
    "nav.services": "Services",
    "nav.work": "Work",
    "nav.language": "Language",
    "nav.skip": "Skip to content",
    "nav.menu.open": "Open menu",
    "nav.menu.close": "Close menu",

    "home.title": "Home",
    "home.heading": "Designer & developer.",
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
    "work.cinemaSaronno.body":
      "Website design and development for a local cinema.",
    "work.studioAlbanese.title": "Studio Albanese",
    "work.studioAlbanese.body":
      "Website design and development for an architecture studio.",
    "work.librariesOfMilan.title": "Libraries of Milan",
    "work.librariesOfMilan.body":
      "A data visualization project mapping Milan's public libraries.",
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
    "services.intro": "Two sides of the same practice.",
    "services.designer.title": "Designer",
    "services.designer.body":
      "Brand identity, interfaces and design systems. Considered, legible work that holds up from the first sketch to the last pixel.",
    "services.developer.title": "Developer",
    "services.developer.body":
      "Fast, accessible websites and web apps built with modern tooling, with the craft to match the design.",
    "services.soon": "Individual services will be listed here soon.",
    "services.more": "Read more",
    "services.back": "All services",
    "services.cta": "Get in touch",
    "designer.title": "Designer",
    "designer.heading": "Designer",
    "designer.intro":
      "Brand identity, interfaces and design systems. Considered, legible work that holds up from the first sketch to the last pixel.",
    "developer.title": "Developer",
    "developer.heading": "Developer",
    "developer.intro":
      "Fast, accessible websites and web apps built with modern tooling, with the craft to match the design.",

    "footer.rights": "All rights reserved.",
  },
  it: {
    "site.name": "Giacomo Ravetta",
    "site.tagline": "Designer & sviluppatore",
    "site.description":
      "Giacomo Ravetta — designer e sviluppatore di prodotti digitali curati.",

    "nav.home": "Home",
    "nav.about": "Chi sono",
    "nav.services": "Servizi",
    "nav.work": "Lavori",
    "nav.language": "Lingua",
    "nav.skip": "Vai al contenuto",
    "nav.menu.open": "Apri il menu",
    "nav.menu.close": "Chiudi il menu",

    "home.title": "Home",
    "home.heading": "Designer & sviluppatore.",
    "hero.left": "designer",
    "hero.center": "Giacomo Ravetta",
    "hero.right": "sviluppatore",
    "hero.alt.left": "La battaglia di Shijo Nawate, pannello sinistro",
    "hero.alt.center": "La battaglia di Shijo Nawate, pannello centrale",
    "hero.alt.right": "La battaglia di Shijo Nawate, pannello destro",

    "work.title": "Lavori",
    "work.heading": "Lavori",
    "work.intro":
      "Una selezione di progetti che ho progettato, sviluppato o visualizzato.",
    "work.cinemaSaronno.title": "Cinema Saronno",
    "work.cinemaSaronno.body":
      "Design e sviluppo del sito per un cinema locale.",
    "work.studioAlbanese.title": "Studio Albanese",
    "work.studioAlbanese.body":
      "Design e sviluppo del sito per uno studio di architettura.",
    "work.librariesOfMilan.title": "Libraries of Milan",
    "work.librariesOfMilan.body":
      "Un progetto di data visualization sulle biblioteche pubbliche di Milano.",
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
    "services.intro": "Due facce dello stesso mestiere.",
    "services.designer.title": "Designer",
    "services.designer.body":
      "Identità visiva, interfacce e design system. Un lavoro curato e leggibile, dal primo schizzo all'ultimo pixel.",
    "services.developer.title": "Sviluppatore",
    "services.developer.body":
      "Siti e web app veloci e accessibili, costruiti con strumenti moderni e con la stessa cura del design.",
    "services.soon": "I singoli servizi saranno elencati qui a breve.",
    "services.more": "Scopri di più",
    "services.back": "Tutti i servizi",
    "services.cta": "Contattami",
    "designer.title": "Designer",
    "designer.heading": "Designer",
    "designer.intro":
      "Identità visiva, interfacce e design system. Un lavoro curato e leggibile, dal primo schizzo all'ultimo pixel.",
    "developer.title": "Sviluppatore",
    "developer.heading": "Sviluppatore",
    "developer.intro":
      "Siti e web app veloci e accessibili, costruiti con strumenti moderni e con la stessa cura del design.",

    "footer.rights": "Tutti i diritti riservati.",
  },
} as const satisfies Record<Lang, Record<string, string>>;

export type UiKey = keyof (typeof ui)[typeof defaultLang];
