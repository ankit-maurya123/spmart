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
 * Resolves the best image source for a product.
 * Priority: local import (product.img) -> imageKey map -> URL string -> placeholder
 */
export function resolveProductImage(product) {
  // Home page products have .img set to a Vite-imported asset
  if (product.img) return product.img;

  // DB products have imageKey
  if (product.imageKey && imageMap[product.imageKey]) {
    return imageMap[product.imageKey];
  }

  // Fallback to the image URL string from DB
  if (product.image) return product.image;

  // Last resort placeholder
  return "https://placehold.co/400x400?text=No+Image";
}

export default imageMap;
