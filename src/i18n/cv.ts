import type { Lang } from "./ui";

/**
 * Curriculum vitae shown on the CV page. Story from Giacomo's LinkedIn About (English,
 * translated to Italian); the rest from his PDF CV (Italian, translated to English). Phone number deliberately left out of the site.
 */
/** Story paragraphs are trusted HTML (rendered with set:html) so they can hold links. */
type Entry = { period: string; title: string; role?: string; body?: string };

export const cv: Record<
  Lang,
  {
    story: string[];
    experience: Entry[];
    education: Entry[];
    skills: string[];
    languages: { name: string; level?: string }[];
  }
> = {
  en: {
    story: [
      "Mine is an atypical path into tech. I started with a degree in Philosophy and two years of Photography training at Bauer, and my first job was in post-production at a busy photographic studio. Juggling multiple deliverables a day, I quickly saw that automation wasn't a luxury — it was the only way to keep up. I started teaching myself how to streamline repetitive tasks, and that curiosity opened a door I hadn't expected.",
      "That spark led me to complete Google's Automation with Python course, which gave me a solid technical foundation, and then to an internship as a web developer at Accurat, a data visualization design agency. There I learned JavaScript, fell into React, and discovered how much I enjoyed building things at the intersection of design and code.",
      "Today I work as a freelance developer across web, data visualization, and AI-driven projects — currently collaborating with a legal studio to bring AI into their practice, where I help turn the potential of language models into tools that actually fit how lawyers work.",
      "What I bring to a project is the combination that shaped me: a philosopher's habit of asking what a problem really is, a photographer's eye for how things should look and feel, and a developer's toolkit for actually making them. I like work that lives at the intersection of technology and creativity — and I'm always open to conversations about what to build next.",
      "Away from the screen I'm an avid chess player — you can <a href=\"https://lichess.org/@/ChessPropaganda\" target=\"_blank\" rel=\"noopener noreferrer\">challenge me on Lichess</a> — and I like to play the ukulele.",
    ],
    experience: [
      {
        period: "Feb 2024 – Jul 2024",
        title: "Accurat",
        role: "Front-end developer (internship)",
        body: "At Accurat, a leading data-visualization studio, I sharpened my front-end skills in HTML, CSS and JavaScript and worked with React, Astro and Tailwind CSS. I built interactive, responsive data visualizations that turn complex datasets into intuitive stories. Working with talented designers and developers, and on the collaboration with Pentagram, deepened my understanding of where design and technology meet in data visualization.",
      },
      { period: "Jul 2023 – Feb 2024", title: "Setflow", role: "Post Production Lead / Automations Specialist" },
      { period: "Mar 2023 – Feb 2024", title: "Setflow On Demand", role: "Junior Post Production" },
    ],
    education: [
      { period: "", title: "Università degli Studi di Milano", role: "Bachelor's degree, Philosophy", body: "110 cum laude" },
      { period: "", title: "CFP Bauer", role: "Graphic design and photography (two years)" },
    ],
    skills: ["HTML", "CSS", "JavaScript", "React", "Astro", "Tailwind CSS", "Python", "Figma", "Adobe Illustrator", "Adobe Photoshop", "Affinity", "Canva"],
    languages: [{ name: "Italian", level: "Native" }, { name: "English", level: "B2" }],
  },
  it: {
    story: [
      "Il mio è un percorso atipico verso la tecnologia. Ho iniziato con una laurea in Filosofia e due anni di formazione in fotografia al Bauer, e il mio primo lavoro è stato nella post-produzione di uno studio fotografico molto attivo. Dovendo gestire più consegne al giorno, ho capito presto che l'automazione non era un lusso: era l'unico modo per stare al passo. Ho iniziato a imparare da solo come snellire le attività ripetitive, e quella curiosità mi ha aperto una porta che non mi aspettavo.",
      "Quella scintilla mi ha portato a completare il corso Automation with Python di Google, che mi ha dato solide basi tecniche, e poi a un internship come sviluppatore web in Accurat, un'agenzia di design per la visualizzazione dei dati. Lì ho imparato JavaScript, mi sono appassionato a React e ho scoperto quanto mi piace costruire cose all'incrocio tra design e codice.",
      "Oggi lavoro come sviluppatore freelance su progetti web, di visualizzazione dati e di intelligenza artificiale. Al momento collaboro con uno studio legale per portare l'AI nel loro lavoro, aiutando a trasformare il potenziale dei modelli linguistici in strumenti che si adattano davvero al modo in cui lavorano gli avvocati.",
      "Quello che porto in un progetto è la combinazione che mi ha formato: l'abitudine del filosofo a chiedersi quale sia davvero il problema, l'occhio del fotografo per come le cose dovrebbero apparire e trasmettere, e gli strumenti dello sviluppatore per realizzarle davvero. Mi piace il lavoro che vive all'incrocio tra tecnologia e creatività, e sono sempre aperto a conversazioni su cosa costruire.",
      "Lontano dallo schermo sono un appassionato giocatore di scacchi (puoi <a href=\"https://lichess.org/@/ChessPropaganda\" target=\"_blank\" rel=\"noopener noreferrer\">sfidarmi su Lichess</a>) e mi piace suonare l'ukulele.",
    ],
    experience: [
      {
        period: "Feb 2024 – Lug 2024",
        title: "Accurat",
        role: "Sviluppatore front-end (internship)",
        body: "Nella mia internship presso Accurat, uno studio leader nella visualizzazione dei dati, ho perfezionato le mie competenze front-end in HTML, CSS e JavaScript, acquisendo esperienza anche con React, Astro e Tailwind CSS. Ho realizzato visualizzazioni dati interattive e responsive, trasformando set di dati complessi in narrazioni intuitive. Collaborando con talentuosi designer e sviluppatori, e avvalendomi dell'esperienza maturata nella collaborazione con Pentagram, ho approfondito la comprensione dell'intersezione tra design e tecnologia nella visualizzazione dei dati.",
      },
      { period: "Lug 2023 – Feb 2024", title: "Setflow", role: "Post Production Lead / Automations Specialist" },
      { period: "Mar 2023 – Feb 2024", title: "Setflow On Demand", role: "Junior Post Production" },
    ],
    education: [
      { period: "", title: "Università degli Studi di Milano", role: "Laurea triennale in Filosofia", body: "110 e lode" },
      { period: "", title: "CFP Bauer", role: "Grafica e fotografia (due anni)" },
    ],
    skills: ["HTML", "CSS", "JavaScript", "React", "Astro", "Tailwind CSS", "Python", "Figma", "Adobe Illustrator", "Adobe Photoshop", "Affinity", "Canva"],
    languages: [{ name: "Italiano", level: "Madrelingua" }, { name: "Inglese", level: "B2" }],
  },
};
