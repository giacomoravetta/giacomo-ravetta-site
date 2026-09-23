import { getImage } from "astro:assets";
import leftSrc from "../assets/shijo-nawate/left.webp";
import centerSrc from "../assets/shijo-nawate/center.webp";
import rightSrc from "../assets/shijo-nawate/right.webp";

export type PanelKey = "left" | "center" | "right";

/** Responsive variants of the three Shijo Nawate panels, shared by the head preloads and the Triptych. */
export async function getTriptychImages() {
  const widths = [640, 960, 1280, 1600];
  // Mobile/touch (same query as .scroll-hero): each panel fills the viewport height, so
  // its width is aspect × 100svh. Desktop: the strip covers the viewport
  // (max(100%, 100svh × 3802/2145)), so each panel is its share of that width.
  const mobile = "(max-width: 1023px), (hover: none), (pointer: coarse)";
  const sizesFor = (m: string, d: string) =>
    mobile.split(", ").map((q) => `${q} ${m}`).join(", ") + `, ${d}`;
  const defs: { key: PanelKey; src: ImageMetadata; sizes: string }[] = [
    { key: "left", src: leftSrc, sizes: sizesFor("55.2svh", "max(31vw, 54.3svh)") },
    { key: "center", src: centerSrc, sizes: sizesFor("68.9svh", "max(39vw, 68.9svh)") },
    { key: "right", src: rightSrc, sizes: sizesFor("54.7svh", "max(30vw, 54.1svh)") },
  ];
  return Promise.all(
    defs.map(async (d) => {
      const img = await getImage({ src: d.src, widths, sizes: d.sizes, format: "webp" });
      return { key: d.key, sizes: d.sizes, img };
    }),
  );
}

export type TriptychImages = Awaited<ReturnType<typeof getTriptychImages>>;
