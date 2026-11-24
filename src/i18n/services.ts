import type { Lang, RouteKey } from "./ui";

/**
 * The four services: Web design & development, AI integration, Automation,
 * Data visualization.
 * Used by the Home hero (names, colours), the Services page (one panel each, listing
 * the `items` names) and the three subpages (`ServiceList.astro`: every item with its
 * description, then the benefits). `id` is also the route key in ui.ts.
 */
export type ServiceId = "web" | "ai" | "automation" | "dataviz";

export type Service = {
  name: string;
  summary: string;
  /** What the service is made of. */
  items: { name: string; summary: string }[];
  /** What it brings to the client. */
  benefits: string[];
};

export const serviceIds = ["web", "ai", "automation", "dataviz"] as const satisfies readonly (ServiceId & RouteKey)[];

/** Key colour of each service plus a second accent, and the face of its titles. */
export const serviceStyle: Record<ServiceId, { key: string; alt: string; font: string }> = {
  // Yellow + black redesign: every key is the ink colour for now (the old key colours
  // were picked for a dark page). Services are told apart by figure and typeface.
  web: { key: "#0b0b0b", alt: "#0b0b0b", font: "font-bluu" },
  ai: { key: "#0b0b0b", alt: "#0b0b0b", font: "font-young" },
  automation: { key: "#0b0b0b", alt: "#0b0b0b", font: "font-terminal" },
  dataviz: { key: "#0b0b0b", alt: "#0b0b0b", font: "font-instrument font-bold font-stretch-condensed" },
};

export const services: Record<ServiceId, Record<Lang, Service>> = {
  web: {
    en: {
      name: "Web design & development",
      summary:
        "Websites designed and built by the same person, from the first layout to the code that goes online: fast, accessible and easy to update.",
      items: [
        {
          name: "Design",
          summary:
            "Structure, layout, typography and colour designed around what your visitors need to find and do, on a phone as well as on a desktop.",
        },
        {
          name: "Development",
          summary:
            "Built with modern tools (Astro, Svelte, GSAP), so pages load fast, work for everyone and move with care.",
        },
        {
          name: "Editable content",
          summary: "A simple editor behind the site, so you can update texts, images and pages yourself.",
        },
        {
          name: "Performance & SEO",
          summary: "Solid technical foundations that search engines can read and that keep the site quick as it grows.",
        },
      ],
      benefits: [
        "Clear paths to what matters, so more visitors become customers",
        "Pages that load in under a second, so fewer visitors leave",
        "Better visibility on Google thanks to solid technical SEO",
        "One person from design to code, so nothing gets lost in between",
      ],
    },
    it: {
      name: "Web design e sviluppo",
      summary:
        "Siti progettati e sviluppati dalla stessa persona, dal primo layout al codice che va online: veloci, accessibili e facili da aggiornare.",
      items: [
        {
          name: "Design",
          summary:
            "Struttura, layout, tipografia e colore progettati su ciò che i visitatori devono trovare e fare, su telefono come su desktop.",
        },
        {
          name: "Sviluppo",
          summary:
            "Costruito con strumenti moderni (Astro, Svelte, GSAP): pagine che si caricano in fretta, funzionano per tutti e si muovono con cura.",
        },
        {
          name: "Contenuti modificabili",
          summary: "Un editor semplice dietro al sito, per aggiornare da solo testi, immagini e pagine.",
        },
        {
          name: "Prestazioni e SEO",
          summary: "Basi tecniche solide, leggibili dai motori di ricerca, che tengono il sito veloce mentre cresce.",
        },
      ],
      benefits: [
        "Percorsi chiari verso ciò che conta, così più visitatori diventano clienti",
        "Pagine che si caricano in meno di un secondo, così meno visitatori se ne vanno",
        "Più visibilità su Google grazie a una SEO tecnica solida",
        "Una sola persona dal design al codice, così niente si perde per strada",
      ],
    },
  },
  ai: {
    en: {
      name: "AI integration",
      summary:
        "Language models brought into the documents and tools you already work with, as assistants shaped around how your team actually works.",
      items: [
        {
          name: "Assistants on your documents",
          summary: "Assistants that answer from your own documents and knowledge, showing the sources so you can check them.",
        },
        {
          name: "AI inside your tools",
          summary:
            "Summaries, first drafts, classification and data extraction added to the software you already use, from email to the website.",
        },
        {
          name: "AI agents",
          summary: "Agents that read, sort and answer incoming requests, and hand over to a person when it is needed.",
        },
        {
          name: "Model and setup",
          summary: "The right model for the job, set up with attention to costs and to the privacy of your data.",
        },
      ],
      benefits: [
        "Answers in seconds instead of searching through folders",
        "First drafts ready to review, not to write from scratch",
        "Tools that fit the way your team works, not the other way round",
      ],
    },
    it: {
      name: "Integrazione AI",
      summary:
        "I modelli linguistici portati nei documenti e negli strumenti con cui lavori già, come assistenti costruiti su come lavora davvero il tuo team.",
      items: [
        {
          name: "Assistenti sui tuoi documenti",
          summary: "Assistenti che rispondono a partire dai tuoi documenti e dalle tue conoscenze, indicando le fonti da verificare.",
        },
        {
          name: "AI dentro i tuoi strumenti",
          summary:
            "Riassunti, prime bozze, classificazione ed estrazione di dati aggiunti ai software che usi già, dalla posta al sito.",
        },
        {
          name: "Agenti AI",
          summary: "Agenti che leggono, smistano e rispondono alle richieste in arrivo, e passano la mano a una persona quando serve.",
        },
        {
          name: "Modello e configurazione",
          summary: "Il modello giusto per il compito, configurato con attenzione ai costi e alla riservatezza dei tuoi dati.",
        },
      ],
      benefits: [
        "Risposte in pochi secondi invece di cercare tra le cartelle",
        "Prime bozze pronte da rivedere, non da scrivere da zero",
        "Strumenti che si adattano a come lavora il team, non il contrario",
      ],
    },
  },
  automation: {
    en: {
      name: "Automation",
      summary: "Workflows that connect the tools you already use, so repetitive work runs on its own.",
      items: [
        {
          name: "Connected tools",
          summary: "Forms, email, CRM, spreadsheets and calendars that talk to each other, with no more copy and paste.",
        },
        {
          name: "Automatic workflows",
          summary: "From the trigger to the result: a request comes in and is sorted, recorded and answered without anyone lifting a finger.",
        },
        {
          name: "Reports & notifications",
          summary: "Data collected and delivered where it is needed, on a schedule or as soon as something happens.",
        },
      ],
      benefits: [
        "Hours of manual work saved every week",
        "Fewer errors from copying data between tools",
        "Leads and requests handled in minutes, even outside office hours",
      ],
    },
    it: {
      name: "Automazione",
      summary: "Flussi che collegano gli strumenti che usi già, così il lavoro ripetitivo va avanti da solo.",
      items: [
        {
          name: "Strumenti collegati",
          summary: "Moduli, posta, CRM, fogli di calcolo e calendari che si parlano tra loro, senza più copia e incolla.",
        },
        {
          name: "Flussi automatici",
          summary: "Dall'innesco al risultato: una richiesta arriva e viene smistata, registrata e gestita senza che nessuno muova un dito.",
        },
        {
          name: "Report e notifiche",
          summary: "Dati raccolti e consegnati dove servono, a orari fissi o appena succede qualcosa.",
        },
      ],
      benefits: [
        "Ore di lavoro manuale risparmiate ogni settimana",
        "Meno errori nel copiare dati da uno strumento all'altro",
        "Contatti e richieste gestiti in pochi minuti, anche fuori orario",
      ],
    },
  },
  dataviz: {
    en: {
      name: "Data visualization",
      summary:
        "Interactive charts, maps and dashboards that turn complex data into clear, explorable stories, built with the craft I learned at Accurat.",
      items: [
        {
          name: "Interactive charts & maps",
          summary: "Custom visuals designed for your data, that readers can explore, filter and compare on any screen.",
        },
        {
          name: "Dashboards",
          summary: "The numbers that matter in one place, updated and readable at a glance.",
        },
        {
          name: "Data stories",
          summary: "Pages that walk the reader through the data step by step, from the question to the answer.",
        },
      ],
      benefits: [
        "Patterns and insights your audience grasps at a glance",
        "Interactive, responsive visuals that work on any screen",
        "Reports and dashboards your team actually uses to decide",
      ],
    },
    it: {
      name: "Visualizzazione dati",
      summary:
        "Grafici, mappe e dashboard interattivi che trasformano dati complessi in storie chiare ed esplorabili, con il mestiere imparato in Accurat.",
      items: [
        {
          name: "Grafici e mappe interattivi",
          summary: "Visualizzazioni su misura per i tuoi dati, che il lettore può esplorare, filtrare e confrontare su qualsiasi schermo.",
        },
        {
          name: "Dashboard",
          summary: "I numeri che contano in un unico posto, aggiornati e leggibili a colpo d'occhio.",
        },
        {
          name: "Storie di dati",
          summary: "Pagine che accompagnano il lettore dentro i dati un passo alla volta, dalla domanda alla risposta.",
        },
      ],
      benefits: [
        "Andamenti e insight che il pubblico coglie a colpo d'occhio",
        "Visualizzazioni interattive e responsive, su qualsiasi schermo",
        "Report e dashboard che il team usa davvero per decidere",
      ],
    },
  },
};
