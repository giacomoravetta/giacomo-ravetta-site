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
  web: { en: "services/web-design-development", it: "servizi/web-design-sviluppo" },
  ai: { en: "services/ai-integration", it: "servizi/integrazione-ai" },
  automation: { en: "services/automation", it: "servizi/automazione" },
  dataviz: { en: "services/data-visualization", it: "servizi/visualizzazione-dati" },
  cv: { en: "cv", it: "cv" },
} as const;

export type RouteKey = keyof typeof routes;

export const ui = {
  en: {
    "site.name": "Giacomo Ravetta",
    "site.tagline": "Web design, AI, automation & data visualization",
    "site.description":
      "Giacomo Ravetta — web design and development, AI integration, automation and data visualization.",

    "nav.home": "Home",
    "nav.about": "About me",
    "nav.services": "Services",
    "nav.work": "Work",
    "nav.language": "Language",
    "nav.skip": "Skip to content",
    "nav.menu.open": "Open menu",
    "nav.menu.close": "Close menu",

    "home.title": "Home",
    "home.heading": "You bring the idea. I bring it into focus.",
    "home.intro":
      "I design and build websites, bring AI into the tools you already use, automate the work that repeats itself and make data readable.",
    "home.services": "Services",

    "work.title": "Work",
    "work.heading": "Work",
    "work.intro": "A selection of projects I've designed, built or visualized.",
    "work.filter": "Filter by theme",
    "work.filter.all": "All",
    "work.filter.empty": "No projects with this theme yet.",
    "work.tags": "Themes",
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
      "Mine is an atypical path into tech: from Philosophy and photography to freelance development across web, data visualization and AI.",
    "about.body":
      "What I bring to a project is the combination that shaped me: a philosopher's habit of asking what a problem really is, a photographer's eye for how things should look and feel, and a developer's toolkit for actually making them. I like work that lives at the intersection of technology and creativity — and I'm always open to conversations about what to build next.",
    "about.photo.alt": "Portrait of Giacomo Ravetta",
    "about.cv.heading": "Curriculum vitae",
    "about.cv.body": "Experience at Accurat and Setflow, a degree in Philosophy, and the tools I work with.",
    "about.cv.link": "Read the full CV",
    "cv.title": "Curriculum vitae",
    "cv.subtitle": "Freelance developer · web, data visualization & AI",
    "cv.story": "My story",
    "cv.experience": "Experience",
    "cv.education": "Education",
    "cv.skills": "Skills",
    "cv.languages": "Languages",
    "cv.contacts": "Contacts",
    "cv.download": "Download PDF",

    "services.title": "Services",
    "services.heading": "Services",
    "services.benefits": "What it brings",
    "services.includes": "What it includes",
    "services.more": "See the service",
    "services.back": "All services",
    "services.cta": "Get in touch",

    "footer.rights": "All rights reserved.",
  },
  it: {
    "site.name": "Giacomo Ravetta",
    "site.tagline": "Web design, AI, automazione e visualizzazione dati",
    "site.description":
      "Giacomo Ravetta — web design e sviluppo, integrazione AI, automazione e visualizzazione dati.",

    "nav.home": "Home",
    "nav.about": "Chi sono",
    "nav.services": "Servizi",
    "nav.work": "Lavori",
    "nav.language": "Lingua",
    "nav.skip": "Vai al contenuto",
    "nav.menu.open": "Apri il menu",
    "nav.menu.close": "Chiudi il menu",

    "home.title": "Home",
    "home.heading": "Tu porti l'idea. Io la metto a fuoco.",
    "home.intro":
      "Progetto e sviluppo siti web, porto l'AI negli strumenti che usi già, automatizzo il lavoro che si ripete e rendo leggibili i dati.",
    "home.services": "Servizi",

    "work.title": "Lavori",
    "work.heading": "Lavori",
    "work.intro":
      "Una selezione di progetti che ho progettato, sviluppato o visualizzato.",
    "work.filter": "Filtra per tema",
    "work.filter.all": "Tutti",
    "work.filter.empty": "Nessun progetto con questo tema, per ora.",
    "work.tags": "Temi",
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
      "Il mio è un percorso atipico verso la tecnologia: dalla Filosofia e dalla fotografia allo sviluppo freelance tra web, visualizzazione dati e AI.",
    "about.body":
      "Quello che porto in un progetto è la combinazione che mi ha formato: l'abitudine del filosofo a chiedersi quale sia davvero il problema, l'occhio del fotografo per come le cose dovrebbero apparire e trasmettere, e gli strumenti dello sviluppatore per realizzarle davvero. Mi piace il lavoro che vive all'incrocio tra tecnologia e creatività, e sono sempre aperto a conversazioni su cosa costruire.",
    "about.photo.alt": "Ritratto di Giacomo Ravetta",
    "about.cv.heading": "Curriculum vitae",
    "about.cv.body": "Esperienze in Accurat e Setflow, una laurea in Filosofia e gli strumenti con cui lavoro.",
    "about.cv.link": "Leggi il CV completo",
    "cv.title": "Curriculum vitae",
    "cv.subtitle": "Sviluppatore freelance · web, data visualization e AI",
    "cv.story": "La mia storia",
    "cv.experience": "Esperienza",
    "cv.education": "Istruzione",
    "cv.skills": "Competenze",
    "cv.languages": "Lingue",
    "cv.contacts": "Contatti",
    "cv.download": "Scarica PDF",

    "services.title": "Servizi",
    "services.heading": "Servizi",
    "services.benefits": "Cosa porta",
    "services.includes": "Cosa comprende",
    "services.more": "Vedi il servizio",
    "services.back": "Tutti i servizi",
    "services.cta": "Contattami",

    "footer.rights": "Tutti i diritti riservati.",
  },
} as const satisfies Record<Lang, Record<string, string>>;

export type UiKey = keyof (typeof ui)[typeof defaultLang];
