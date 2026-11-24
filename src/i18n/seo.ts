import type { Lang, RouteKey } from "./ui";

/**
 * What each page shows in search results: the <title> (about 60 characters at most) and
 * the meta description (about 140–160), written for someone searching, with the place
 * where it helps (the audience is local: Saronno and nearby). `BaseLayout.astro` uses
 * these when present and falls back to "<page title> — <site name>" and the description
 * a page passes.
 */
export const seo: Record<Lang, Record<RouteKey, { title: string; description: string }>> = {
  en: {
    home: {
      title: "Giacomo Ravetta — Web design, AI & automation in Saronno",
      description:
        "Freelance web designer and developer in Saronno. I build fast websites, bring AI into the tools you use, automate repetitive work and make data readable.",
    },
    services: {
      title: "Services: websites, AI, automation & data — Saronno",
      description:
        "Four services for businesses in Saronno and nearby: web design and development, AI integration, automation and data visualization.",
    },
    web: {
      title: "Web design & development in Saronno — Giacomo Ravetta",
      description:
        "Websites designed and built by one person in Saronno: fast, accessible, easy to update and ready for Google, from the first layout to the code online.",
    },
    ai: {
      title: "AI integration for businesses in Saronno — Giacomo Ravetta",
      description:
        "AI assistants and language models built into the documents and tools your team already uses. Integration, setup and privacy, handled from Saronno.",
    },
    automation: {
      title: "Business automation in Saronno — Giacomo Ravetta",
      description:
        "Workflows that connect your forms, email, CRM and spreadsheets, so repetitive work runs on its own. Automation for small businesses, from Saronno.",
    },
    dataviz: {
      title: "Data visualization, charts & dashboards — Giacomo Ravetta",
      description:
        "Interactive charts, maps and dashboards that turn complex data into clear stories your audience can explore on any screen.",
    },
    work: {
      title: "Work: websites and data projects — Giacomo Ravetta",
      description:
        "Websites and data projects I designed and built: a cinema, a law firm, Milan's public libraries and a civic project site.",
    },
    about: {
      title: "About Giacomo Ravetta — freelance developer in Saronno",
      description:
        "Giacomo Ravetta, freelance developer in Saronno: from Philosophy and photography to web development, data visualization and AI.",
    },
    cv: {
      title: "Curriculum vitae — Giacomo Ravetta",
      description: "Curriculum vitae of Giacomo Ravetta: experience, education and the tools I work with.",
    },
  },
  it: {
    home: {
      title: "Giacomo Ravetta — Siti web, AI e automazione a Saronno",
      description:
        "Web designer e sviluppatore freelance a Saronno. Realizzo siti web veloci, porto l'AI negli strumenti che usi, automatizzo il lavoro ripetitivo e rendo leggibili i dati.",
    },
    services: {
      title: "Servizi: siti web, AI, automazione e dati — Saronno",
      description:
        "Quattro servizi per aziende di Saronno e dintorni: web design e sviluppo, integrazione AI, automazione e visualizzazione dati.",
    },
    web: {
      title: "Realizzazione siti web a Saronno — Giacomo Ravetta",
      description:
        "Siti web progettati e sviluppati da una sola persona a Saronno: veloci, accessibili, facili da aggiornare e pronti per Google, dal primo layout al codice online.",
    },
    ai: {
      title: "Integrazione AI per aziende a Saronno — Giacomo Ravetta",
      description:
        "Assistenti AI e modelli linguistici dentro i documenti e gli strumenti che il tuo team usa già. Integrazione, configurazione e riservatezza, da Saronno.",
    },
    automation: {
      title: "Automazione dei processi a Saronno — Giacomo Ravetta",
      description:
        "Flussi che collegano moduli, posta, CRM e fogli di calcolo, così il lavoro ripetitivo va avanti da solo. Automazione per piccole imprese, da Saronno.",
    },
    dataviz: {
      title: "Visualizzazione dati, grafici e dashboard — Giacomo Ravetta",
      description:
        "Grafici, mappe e dashboard interattivi che trasformano dati complessi in storie chiare, esplorabili su qualsiasi schermo.",
    },
    work: {
      title: "Lavori: siti web e progetti dati — Giacomo Ravetta",
      description:
        "Siti web e progetti dati che ho progettato e sviluppato: un cinema, uno studio legale, le biblioteche di Milano e un sito per un progetto civico.",
    },
    about: {
      title: "Chi sono — Giacomo Ravetta, sviluppatore a Saronno",
      description:
        "Giacomo Ravetta, sviluppatore freelance a Saronno: dalla Filosofia e dalla fotografia allo sviluppo web, alla visualizzazione dati e all'AI.",
    },
    cv: {
      title: "Curriculum vitae — Giacomo Ravetta",
      description: "Curriculum vitae di Giacomo Ravetta: esperienze, formazione e strumenti con cui lavoro.",
    },
  },
};
