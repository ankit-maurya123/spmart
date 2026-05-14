import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { resolveProductImage } from "../../lib/imageMap";

/**
 * "Top Brands" horizontal slider — Zepto-style.
 *
 * Aggregates unique brands from the catalog, picks a representative product
 * image for each, and shows a scrollable row of brand cards. Each card links
 * to a search-filtered store page.
 *
 * props:
 *   products — full product list (must include `brand` field)
 *   title    — section heading
 */
const BRAND_BG = [
  "from-violet-100 to-fuchsia-100",
  "from-amber-100 to-orange-100",
  "from-emerald-100 to-teal-100",
  "from-sky-100 to-indigo-100",
  "from-rose-100 to-pink-100",
  "from-yellow-100 to-amber-100",
  "from-cyan-100 to-blue-100",
  "from-lime-100 to-green-100",
];

const TopBrands = ({ products = [], title = "Top Brands" }) => {
  const scrollerRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  // Group products by brand → { name, count, sample, topRated }
  const brands = useMemo(() => {
    const map = new Map();
    for (const p of products) {
      if (!p.brand) continue;
      const entry = map.get(p.brand) || { name: p.brand, count: 0, sample: p, topRated: p };
      entry.count += 1;
      // pick the highest-rated product as the brand's sample
      if ((p.rating || 0) > (entry.topRated.rating || 0)) {
        entry.topRated = p;
        entry.sample = p;
      }
      map.set(p.brand, entry);
    }
    return [...map.values()].sort((a, b) => b.count - a.count);
  }, [products]);

  const updateButtons = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateButtons();
    el.addEventListener("scroll", updateButtons, { passive: true });
    window.addEventListener("resize", updateButtons);
    return () => {
      el.removeEventListener("scroll", updateButtons);
      window.removeEventListener("resize", updateButtons);
    };
  }, [brands.length]);

  const scrollBy = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector("[data-brand]");
    const step = card
      ? card.getBoundingClientRect().width + 12
      : Math.max(220, Math.floor(el.clientWidth * 0.7));
    el.scrollBy({ left: dir * step * 2, behavior: "smooth" });
  };

  if (!brands.length) return null;

  return (
    <section className="max-w-[1280px] mx-auto px-3 sm:px-4 my-8 sm:my-10">
      {/* Header */}
      <div className="flex items-end justify-between gap-3 mb-3 sm:mb-4">
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold text-gray-900">
            {title.split(" ")[0]}{" "}
            <span className="text-violet-600">{title.split(" ").slice(1).join(" ")}</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Shop your favourite trusted brands
          </p>
        </div>

        <div className="hidden md:flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => scrollBy(-1)}
            aria-label="Scroll left"
            disabled={!canPrev}
            className={`w-9 h-9 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 transition-all ${
              canPrev
                ? "hover:bg-violet-600 hover:text-white hover:border-violet-600"
                : "opacity-40 cursor-not-allowed"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.6}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => scrollBy(1)}
            aria-label="Scroll right"
            disabled={!canNext}
            className={`w-9 h-9 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 transition-all ${
              canNext
                ? "hover:bg-violet-600 hover:text-white hover:border-violet-600"
                : "opacity-40 cursor-not-allowed"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.6}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Scrollable row of brand cards */}
      <div
        ref={scrollerRef}
        className="no-scrollbar flex gap-3 sm:gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 -mx-1 px-1"
      >
        {brands.map((b, i) => (
          <Link
            key={b.name}
            data-brand
            to={`/store?search=${encodeURIComponent(b.name)}`}
            className="snap-start flex-shrink-0 w-[150px] sm:w-[180px] md:w-[200px] group"
            aria-label={`Shop ${b.name} products`}
          >
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md hover:border-violet-300 hover:-translate-y-0.5 transition-all">
              {/* Image area with brand-coloured backdrop */}
              <div
                className={`relative aspect-[4/3] bg-gradient-to-br ${BRAND_BG[i % BRAND_BG.length]} overflow-hidden flex items-center justify-center p-3`}
              >
                <img
                  src={resolveProductImage(b.sample)}
                  alt={b.name}
                  loading="lazy"
                  className="max-w-[78%] max-h-[78%] object-contain group-hover:scale-110 transition-transform duration-500"
                  style={{ filter: "drop-shadow(0 8px 12px rgba(0,0,0,0.10))" }}
                />
                {/* count pill */}
                <span className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-violet-700 text-[10px] sm:text-[11px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
                  {b.count} {b.count === 1 ? "item" : "items"}
                </span>
              </div>

              {/* Brand name + CTA */}
              <div className="p-2.5 sm:p-3 flex items-center justify-between gap-2">
                <h3 className="text-xs sm:text-sm font-extrabold text-gray-900 truncate">
                  {b.name}
                </h3>
                <span className="inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-colors flex-shrink-0">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default TopBrands;
