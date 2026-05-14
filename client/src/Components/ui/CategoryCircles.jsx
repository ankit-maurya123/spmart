import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

/**
 * Horizontal-scrolling row of round category thumbnails (Zepto-style).
 *
 * props:
 *   categories: [{ name, icon (emoji), to, bg (optional tailwind bg class) }]
 *   title: optional heading
 */
const DEFAULT_BG = "bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-400/15 dark:to-orange-500/15";

const CategoryCircles = ({ categories = [], title }) => {
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
  }, [categories.length]);

  const scrollBy = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    const step = Math.max(240, Math.floor(el.clientWidth * 0.7));
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  if (!categories.length) return null;

  return (
    <section className="relative max-w-[1280px] mx-auto px-3 sm:px-4 my-6 sm:my-8">
      {title && (
        <h2 className="text-base sm:text-lg md:text-xl font-extrabold text-gray-900 dark:text-white mb-3 sm:mb-4">
          {title}
        </h2>
      )}

      <div className="relative group/slider">
        {/* Prev button */}
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          aria-label="Scroll left"
          className={`absolute left-1 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white dark:bg-[#11141d] border border-gray-200 dark:border-white/10 shadow-lg flex items-center justify-center text-gray-700 dark:text-white/80 hover:bg-violet-50 dark:hover:bg-violet-500/10 hover:text-violet-600 transition-all ${
            canPrev ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Next button */}
        <button
          type="button"
          onClick={() => scrollBy(1)}
          aria-label="Scroll right"
          className={`absolute right-1 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white dark:bg-[#11141d] border border-gray-200 dark:border-white/10 shadow-lg flex items-center justify-center text-gray-700 dark:text-white/80 hover:bg-violet-50 dark:hover:bg-violet-500/10 hover:text-violet-600 transition-all ${
            canNext ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Scrollable row */}
        <div
          ref={scrollerRef}
          className="no-scrollbar flex items-start gap-3 sm:gap-4 overflow-x-auto scroll-smooth py-2 px-1 snap-x snap-mandatory"
        >
          {categories.map((c, i) => (
            <Link
              key={`${c.name}-${i}`}
              to={c.to || "/store"}
              aria-label={`Shop ${c.name}`}
              className="snap-start flex-shrink-0 flex flex-col items-center gap-2 w-[88px] sm:w-[112px] md:w-[128px] group/cat"
            >
              <div
                className={`w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] md:w-[112px] md:h-[112px] rounded-2xl flex items-center justify-center overflow-hidden shadow-sm border border-gray-200/70 dark:border-white/[0.08] transition-all group-hover/cat:scale-[1.04] group-hover/cat:shadow-lg group-hover/cat:border-violet-300 dark:group-hover/cat:border-violet-500/40 ${c.bg || DEFAULT_BG}`}
              >
                {c.image ? (
                  <img
                    src={c.image}
                    alt={c.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl sm:text-4xl md:text-5xl">{c.icon || "📦"}</span>
                )}
              </div>
              <span className="text-[11px] sm:text-xs md:text-sm font-bold text-gray-800 dark:text-white text-center leading-tight px-1 line-clamp-2">
                {c.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryCircles;
