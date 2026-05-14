// Maps imageKey strings (from DB) to Vite-imported local image assets
import img1 from "../assets/images/images (5).jpg";
import img2 from "../assets/images/images (9).jpg";
import img3 from "../assets/images/images (7).jpg";
import img4 from "../assets/images/images (8).jpg";
import img5 from "../assets/images/images (9).jpg";
import img6 from "../assets/images/images (13).jpg";
import img7 from "../assets/images/images (12).jpg";
import img8 from "../assets/images/images (14).jpg";
import img9 from "../assets/img/amul-pure-ghee.webp";
import img10 from "../assets/img/aashirvaad-shudh-chakki-atta-5-kg.webp";
import img11 from "../assets/img/everest-tikhalal-chilli-powder.webp";
import img12 from "../assets/img/fortune-premium-kachi-ghani-pure-mustard-oil-1-l-product-images-o490000525-p490000525-0-202303181434.webp";
import img13 from "../assets/img/fortune-refined-soyabean.webp";
import img14 from "../assets/img/fortune-suji-semolina-500.webp";
import img15 from "../assets/img/good-life-sugar.jpg";
import img16 from "../assets/img/tata-iodised-salt.webp";
import img17 from "../assets/images/images (1).jpg";
import img18 from "../assets/images/images (2).jpg";
import img19 from "../assets/images/images (3).jpg";
import img20 from "../assets/images/images (4).jpg";
import img21 from "../assets/images/images (6).jpg";
import img22 from "../assets/images/images (10).jpg";
import img23 from "../assets/images/images (11).jpg";
import img24 from "../assets/images/images (15).jpg";

const imageMap = {
  product1: img1,
  product2: img2,
  product3: img3,
  product4: img4,
  product5: img5,
  product6: img6,
  product7: img7,
  product8: img8,
  product9: img9,
  product10: img10,
  product11: img11,
  product12: img12,
  product13: img13,
  product14: img14,
  product15: img15,
  product16: img16,
  product17: img17,
  product18: img18,
  product19: img19,
  product20: img20,
  product21: img21,
  product22: img22,
  product23: img23,
  product24: img24,
};

/**
 * Resolves a single image entry. An "entry" can be:
 *   - an imageKey string ("product1") → mapped to a bundled asset
 *   - a URL string ("/uploads/abc.png" or "https://...") → returned as-is
 *   - falsy → null
 */
function resolveOne(entry) {
  if (!entry) return null;
  if (typeof entry !== "string") return null;
  if (imageMap[entry]) return imageMap[entry];          // imageKey
  return entry;                                         // URL or path
}

/**
 * Resolves the best primary image source for a product.
 * Priority: local import (product.img) -> images[0] -> imageKey -> image URL -> placeholder
 */
export function resolveProductImage(product) {
  if (!product) return "https://placehold.co/400x400?text=No+Image";

  if (product.img) return product.img;

  if (Array.isArray(product.images) && product.images.length) {
    const first = resolveOne(product.images[0]);
    if (first) return first;
  }

  if (product.imageKey && imageMap[product.imageKey]) {
    return imageMap[product.imageKey];
  }

  if (product.image) return product.image;

  return "https://placehold.co/400x400?text=No+Image";
}

/**
 * Resolves the full multi-image gallery for a product → array of asset URLs.
 * Uses product.images[] when available, otherwise falls back to a single-image array.
 * De-duplicates and filters out unresolvable entries.
 *
 * @param {object} product
 * @param {number} minCount - optional minimum number of images. If the resolved
 *   list is shorter, the helper pads it with sibling assets from imageMap so
 *   UI like the circular orbit gallery always has enough thumbnails to fill.
 */
export function resolveProductImages(product, minCount = 1) {
  if (!product) return [];

  const out = [];
  const push = (src) => { if (src && !out.includes(src)) out.push(src); };

  if (Array.isArray(product.images)) {
    for (const entry of product.images) push(resolveOne(entry));
  }

  // Always include the resolved primary at index 0
  push(resolveProductImage(product));

  // Move primary to front so consumers see it first
  const primary = resolveProductImage(product);
  if (primary && out.indexOf(primary) > 0) {
    out.splice(out.indexOf(primary), 1);
    out.unshift(primary);
  }

  // Pad with sibling assets up to minCount (deterministic — same product → same pad order)
  if (out.length < minCount) {
    const allAssets = Object.values(imageMap);
    const id = product._id || product.imageKey || product.name || "x";
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;

    for (let k = 0; k < allAssets.length && out.length < minCount; k++) {
      const candidate = allAssets[(h + k) % allAssets.length];
      if (candidate) push(candidate);
    }
  }

  return out.length ? out : [resolveProductImage(product)];
}

/**
 * Build a gallery list of N images using ONLY this product's own images.
 * If the product has fewer unique images than `count`, the list is filled
 * by cycling its own images (never pulled from sibling products).
 *
 * Useful for the PDP image gallery where every thumbnail must belong to
 * the active product (no padding from unrelated catalog assets).
 */
export function resolveGalleryImages(product, count = 6) {
  const unique = resolveProductImages(product, 1); // dedup'd, no sibling padding
  if (!unique.length) return [];

  const out = [];
  for (let i = 0; i < count; i++) {
    out.push(unique[i % unique.length]);
  }
  return out;
}

export default imageMap;
