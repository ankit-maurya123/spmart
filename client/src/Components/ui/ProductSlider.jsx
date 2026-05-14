import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";

/**
 * Horizontal slider of product cards with prev/next arrow buttons.
 * - Snap-scroll on mobile (swipeable)
 * - Arrow buttons on desktop (hidden when at edge)
 *
 * props:
 *   title       — section heading
 *   subtitle    — optional sub-line
 *   products    — array of product objects
 *   seeAllTo    — optional link target for the "See all" CTA
 */
const ProductSlider = ({ title, subtitle, products = [], seeAllTo }) => {
  const scrollerRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

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
  }, [products.length]);

  const scrollBy = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector("[data-card]");
    const step = card
      ? card.getBoundingClientRect().width + 16
      : Math.max(280, Math.floor(el.clientWidth * 0.8));
    el.scrollBy({ left: dir * step * 2, behavior: "smooth" });
  };

  if (!products.length) return null;

  return (
    <section className="relative max-w-[1280px] mx-auto px-3 sm:px-4 my-8 sm:my-10">
      {/* Header — Zepto-style: big bold title, pink "See All →" */}
      <div className="flex items-end justify-between gap-3 mb-3 sm:mb-4">
        <div className="min-w-0">
          {title && (
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {seeAllTo && (
            <Link
              to={seeAllTo}
              className="inline-flex items-center gap-1 text-sm sm:text-base font-bold text-rose-500 hover:text-rose-600 transition-colors"
            >
              See All
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
          <div className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => scrollBy(-1)}
              aria-label="Scroll left"
              disabled={!canPrev}
              className={`w-9 h-9 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 transition-all ${
                canPrev
                  ? "hover:bg-rose-500 hover:text-white hover:border-rose-500"
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
                  ? "hover:bg-rose-500 hover:text-white hover:border-rose-500"
                  : "opacity-40 cursor-not-allowed"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.6}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable row — Zepto density: ~8 cards visible on desktop */}
      <div
        ref={scrollerRef}
        className="no-scrollbar flex gap-2.5 sm:gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-3 -mx-1 px-1"
      >
        {products.map((p) => (
          <div
            key={p._id || p.name}
            data-card
            className="snap-start flex-shrink-0 w-[150px] sm:w-[165px] md:w-[175px] lg:w-[185px]"
          >
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductSlider;
