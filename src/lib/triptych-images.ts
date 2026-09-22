import { getImage } from "astro:assets";
import leftSrc from "../assets/shijo-nawate/left.webp";
import centerSrc from "../assets/shijo-nawate/center.webp";
import rightSrc from "../assets/shijo-nawate/right.webp";

export type PanelKey = "left" | "center" | "right";

/** Responsive variants of the three Shijo Nawate panels, shared by the head preloads and the Triptych. */
export async function getTriptychImages() {
  const widths = [640, 960, 1280, 1600];
  const defs: { key: PanelKey; src: ImageMetadata; sizes: string }[] = [
    { key: "left", src: leftSrc, sizes: "(max-width: 767px) 100vw, 31vw" },
    { key: "center", src: centerSrc, sizes: "(max-width: 767px) 100vw, 39vw" },
    { key: "right", src: rightSrc, sizes: "(max-width: 767px) 100vw, 30vw" },
  ];
  return Promise.all(
    defs.map(async (d) => {
      const img = await getImage({ src: d.src, widths, sizes: d.sizes, format: "webp" });
      return { key: d.key, sizes: d.sizes, img };
    }),
  );
}

export type TriptychImages = Awaited<ReturnType<typeof getTriptychImages>>;
