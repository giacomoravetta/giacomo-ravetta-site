import type { ImageMetadata } from "astro";
import type { Lang } from "./ui";
import cinemaSaronno from "../assets/work/cinemaSaronno.webp";
import studioAlbanese from "../assets/work/studioAlbanese.webp";
import librariesOfMilan from "../assets/work/librariesOfMilan.webp";
import giustoDireNordio from "../assets/work/giustoDireNordio.webp";

/**
 * Projects on the Work page and their thematic tags, shown as plain labels on each card;
 * every tag used by a project must exist in `tags`.
 * Titles and descriptions stay in ui.ts (`work.<key>.title` / `.body`).
 * `shot` is a screenshot of the site's home page (1440x850 viewport, saved 1200 px wide
 * in src/assets/work/<key>.webp).
 */
export const tags = {
  culture: { en: "Culture", it: "Cultura" },
  law: { en: "Law", it: "Diritto" },
  civic: { en: "Civic & politics", it: "Civico e politica" },
  "data-viz": { en: "Data visualization", it: "Visualizzazione dati" },
  "web-design": { en: "Web design", it: "Web design" },
  "web-dev": { en: "Web development", it: "Sviluppo web" },
} satisfies Record<string, Record<Lang, string>>;

export type TagId = keyof typeof tags;

export type Project = {
  key: "cinemaSaronno" | "studioAlbanese" | "librariesOfMilan" | "giustoDireNordio";
  url: string;
  shot: ImageMetadata;
  tags: TagId[];
};

export const projects: Project[] = [
  { key: "cinemaSaronno", url: "https://www.cinemasaronno.it/", shot: cinemaSaronno, tags: ["culture", "web-design", "web-dev"] },
  { key: "studioAlbanese", url: "https://www.studio-albanese.com/", shot: studioAlbanese, tags: ["law", "web-design", "web-dev"] },
  { key: "librariesOfMilan", url: "https://www.librariesofmilan.com/", shot: librariesOfMilan, tags: ["culture", "data-viz"] },
  { key: "giustoDireNordio", url: "https://giustodirenordio.giacomoravetta.com/", shot: giustoDireNordio, tags: ["civic", "web-dev"] },
];
