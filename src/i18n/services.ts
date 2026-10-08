import type { Lang } from "./ui";

/**
 * The services listed on the Designer and Developer pages (and named on the Services
 * split page). Same order and names as the Home hero scenes (`hero.fx.*` in ui.ts).
 * Each service: a short description and the concrete benefits it brings.
 */
export type Service = {
  id: string;
  name: string;
  summary: string;
  benefits: string[];
};

export type ServiceArea = "designer" | "developer";

export const services: Record<ServiceArea, Record<Lang, Service[]>> = {
  designer: {
    en: [
      {
        id: "brand-identity",
        name: "Brand identity",
        summary:
          "Logo, visual language and guidelines that make a business recognisable at a glance and consistent everywhere it shows up.",
        benefits: [
          "Stand out from competitors with a distinctive, memorable mark",
          "Look established and trustworthy from the first contact",
          "One clear set of guidelines, so every touchpoint stays on brand",
        ],
      },
      {
        id: "color-systems",
        name: "Color systems",
        summary:
          "A palette built as a system: brand colours, neutrals and states, tested for contrast and ready to use on screen and in print.",
        benefits: [
          "Accessible contrast that meets WCAG, for every reader",
          "Colour tokens that keep design and code in sync",
          "A consistent mood across website, product and social",
        ],
      },
      {
        id: "layout-ui",
        name: "Layout & UI",
        summary:
          "Interfaces and page layouts for websites and apps, designed around what people need to find and do, from wireframe to polished screens.",
        benefits: [
          "Clear paths to what matters, so more visitors become customers",
          "A reusable component system that speeds up every new page",
          "Responsive layouts that work as well on a phone as on a desktop",
        ],
      },
      {
        id: "typography",
        name: "Typography",
        summary:
          "Typefaces, scales and hierarchy chosen to give a voice to the brand and make every text easy to read.",
        benefits: [
          "Content that is read, not skimmed past",
          "A recognisable tone of voice before a word is read",
          "A type scale that stays consistent as the site grows",
        ],
      },
    ],
    it: [
      {
        id: "brand-identity",
        name: "Identità visiva",
        summary:
          "Logo, linguaggio visivo e linee guida che rendono un'attività riconoscibile a colpo d'occhio e coerente ovunque compaia.",
        benefits: [
          "Distinguersi dai concorrenti con un segno originale e memorabile",
          "Apparire solidi e affidabili fin dal primo contatto",
          "Linee guida chiare, perché ogni canale resti coerente con il brand",
        ],
      },
      {
        id: "color-systems",
        name: "Sistemi colore",
        summary:
          "Una palette pensata come sistema: colori del brand, neutri e stati, verificati per il contrasto e pronti per schermo e stampa.",
        benefits: [
          "Contrasto accessibile secondo le WCAG, per tutti i lettori",
          "Token di colore che tengono allineati design e codice",
          "Un'atmosfera coerente tra sito, prodotto e social",
        ],
      },
      {
        id: "layout-ui",
        name: "Layout e UI",
        summary:
          "Interfacce e impaginazioni per siti e app, progettate su ciò che le persone devono trovare e fare, dal wireframe alle schermate finali.",
        benefits: [
          "Percorsi chiari verso ciò che conta, così più visitatori diventano clienti",
          "Un sistema di componenti riutilizzabili che velocizza ogni nuova pagina",
          "Layout responsive che funzionano su telefono come su desktop",
        ],
      },
      {
        id: "typography",
        name: "Tipografia",
        summary:
          "Caratteri, scale e gerarchie scelti per dare una voce al brand e rendere ogni testo facile da leggere.",
        benefits: [
          "Contenuti che vengono letti, non saltati",
          "Un tono riconoscibile ancora prima di leggere una parola",
          "Una scala tipografica che resta coerente mentre il sito cresce",
        ],
      },
    ],
  },
  developer: {
    en: [
      {
        id: "automation-ai",
        name: "Automation & AI",
        summary:
          "Workflows that connect the tools you already use, with AI agents that read, sort and answer, so repetitive work runs on its own.",
        benefits: [
          "Hours of manual work saved every week",
          "Fewer errors from copying data between tools",
          "Leads and requests handled in minutes, even outside office hours",
        ],
      },
      {
        id: "websites",
        name: "Websites",
        summary:
          "Fast, accessible websites built with modern tools (Astro, Svelte, GSAP), easy to update and ready for search engines.",
        benefits: [
          "Pages that load in under a second, so fewer visitors leave",
          "Better visibility on Google thanks to solid technical SEO",
          "Content you can update yourself, without calling a developer",
        ],
      },
      {
        id: "e-commerce",
        name: "E-commerce",
        summary:
          "Online shops from catalogue to checkout, connected to payments, shipping and stock, designed to sell.",
        benefits: [
          "A smooth checkout that loses fewer carts",
          "Orders, stock and payments managed in one place",
          "A shop that grows with you, from the first product to the full catalogue",
        ],
      },
    ],
    it: [
      {
        id: "automation-ai",
        name: "Automazione e AI",
        summary:
          "Flussi che collegano gli strumenti che usi già, con agenti AI che leggono, smistano e rispondono, così il lavoro ripetitivo va avanti da solo.",
        benefits: [
          "Ore di lavoro manuale risparmiate ogni settimana",
          "Meno errori nel copiare dati da uno strumento all'altro",
          "Contatti e richieste gestiti in pochi minuti, anche fuori orario",
        ],
      },
      {
        id: "websites",
        name: "Siti web",
        summary:
          "Siti veloci e accessibili, costruiti con strumenti moderni (Astro, Svelte, GSAP), facili da aggiornare e pronti per i motori di ricerca.",
        benefits: [
          "Pagine che si caricano in meno di un secondo, così meno visitatori se ne vanno",
          "Più visibilità su Google grazie a una SEO tecnica solida",
          "Contenuti che puoi aggiornare da solo, senza chiamare uno sviluppatore",
        ],
      },
      {
        id: "e-commerce",
        name: "E-commerce",
        summary:
          "Negozi online dal catalogo al checkout, collegati a pagamenti, spedizioni e magazzino, pensati per vendere.",
        benefits: [
          "Un checkout fluido che fa perdere meno carrelli",
          "Ordini, magazzino e pagamenti gestiti in un unico posto",
          "Un negozio che cresce con te, dal primo prodotto al catalogo completo",
        ],
      },
    ],
  },
};
