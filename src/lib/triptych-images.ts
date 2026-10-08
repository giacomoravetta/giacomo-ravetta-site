import { getImage } from "astro:assets";
import leftSrc from "../assets/shijo-nawate/left.webp";
import centerSrc from "../assets/shijo-nawate/center.webp";
import rightSrc from "../assets/shijo-nawate/right.webp";

export type PanelKey = "left" | "center" | "right";

/** Same split as `.scroll-hero` in global.css and the client:media in pages/index.astro. */
export const MOBILE_QUERY = "(max-width: 1023px), (hover: none), (pointer: coarse)";
export const DESKTOP_QUERY = "(min-width: 1024px) and (hover: hover) and (pointer: fine)";

/**
 * Responsive variants of the three Shijo Nawate panels for the head preloads, the desktop
 * Triptych and the mobile hero: AVIF (q60, about a third lighter, paper grain kept) with a
 * WebP fallback (q75), served through <picture>.
 * Desktop gets widths up to the source size; mobile gets its own set capped at 960px:
 * a panel there is ~55svh wide, so 960px already covers 2.6× on a large phone, and the
 * cap keeps 3× phones from fetching (and decoding) the 1.2–1.5k files.
 */
export async function getTriptychImages() {
  const widths = [640, 960, 1280, 1600];
  const mobileWidths = [480, 640, 960];
  // Mobile/touch: each panel fills the viewport height, so its width is aspect × 100svh.
  // Desktop: the strip covers the viewport (max(100%, 100svh × 3802/2145)), so each
  // panel is its share of that width.
  const sizesFor = (m: string, d: string) =>
    MOBILE_QUERY.split(", ").map((q) => `${q} ${m}`).join(", ") + `, ${d}`;
  const defs: { key: PanelKey; src: ImageMetadata; sizes: string }[] = [
    { key: "left", src: leftSrc, sizes: sizesFor("55.2svh", "max(31vw, 54.3svh)") },
    { key: "center", src: centerSrc, sizes: sizesFor("68.9svh", "max(39vw, 68.9svh)") },
    { key: "right", src: rightSrc, sizes: sizesFor("54.7svh", "max(30vw, 54.1svh)") },
  ];
  return Promise.all(
    defs.map(async (d) => {
      const [avif, img, mobileAvif, mobileImg] = await Promise.all([
        getImage({ src: d.src, widths, sizes: d.sizes, format: "avif", quality: 60 }),
        getImage({ src: d.src, widths, sizes: d.sizes, format: "webp", quality: 75 }),
        getImage({ src: d.src, widths: mobileWidths, sizes: d.sizes, format: "avif", quality: 60 }),
        getImage({ src: d.src, widths: mobileWidths, sizes: d.sizes, format: "webp", quality: 75 }),
      ]);
      return { key: d.key, sizes: d.sizes, avif, img, mobileAvif, mobileImg };
    }),
  );
}

export type TriptychImages = Awaited<ReturnType<typeof getTriptychImages>>;
