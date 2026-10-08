import type { Lang } from "./ui";

/**
 * Projects on the Work page and their thematic tags. Tags are filterable on the page
 * (`?tag=<id>` in the URL); every tag used by a project must exist in `tags`.
 * Titles and descriptions stay in ui.ts (`work.<key>.title` / `.body`).
 */
export const tags = {
  culture: { en: "Culture", it: "Cultura" },
  architecture: { en: "Architecture", it: "Architettura" },
  civic: { en: "Civic & politics", it: "Civico e politica" },
  "data-viz": { en: "Data visualization", it: "Visualizzazione dati" },
  "web-design": { en: "Web design", it: "Web design" },
  "web-dev": { en: "Web development", it: "Sviluppo web" },
} satisfies Record<string, Record<Lang, string>>;

export type TagId = keyof typeof tags;

export type Project = {
  key: "cinemaSaronno" | "studioAlbanese" | "librariesOfMilan" | "giustoDiRendere";
  url: string;
  tags: TagId[];
};

export const projects: Project[] = [
  { key: "cinemaSaronno", url: "https://www.cinemasaronno.it/", tags: ["culture", "web-design", "web-dev"] },
  { key: "studioAlbanese", url: "https://www.studio-albanese.com/", tags: ["architecture", "web-design", "web-dev"] },
  { key: "librariesOfMilan", url: "https://www.librariesofmilan.com/", tags: ["culture", "data-viz"] },
  { key: "giustoDiRendere", url: "https://giustodirenordio.giacomoravetta.com/", tags: ["civic", "web-dev"] },
];
