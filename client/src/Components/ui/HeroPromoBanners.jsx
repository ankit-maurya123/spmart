import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

/**
 * Promo banner slider — smooth, infinite-loop, multi-item carousel.
 *
 * The infinite-loop trick: append `visible` cloned items to the end of the
 * track. The slider advances normally through real + cloned items; once it
 * lands on the cloned section, we briefly disable the CSS transition and
 * snap the index back to 0 — visually identical, so the loop is seamless.
 *
 * Visible cards: 1 (mobile) / 2 (sm) / 3 (md+).
 */
const DEFAULT_BANNERS = [
  {
    src: "/banners/low-price-guarantee.png",
    alt: "Low Price Guarantee on your favourite items",
    to: "/store",
  },
  {
    src: "/banners/world-baking-day.webp",
    alt: "Celebrate World Baking Day — Up to 50% off",
    to: "/store?category=Flour",
  },
  {
    src: "/banners/soap-fest.webp",
    alt: "Soap Fest — Up to 50% off",
    to: "/store?category=Essentials",
  },
  {
    src: "/banners/onion-at-5.png",
    alt: "Onion 1 Kg at ₹5 — Limited time deal",
    to: "/store?category=Vegetables",
  },
];

const useVisibleCount = () => {
  const [count, setCount] = useState(3);
  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      if (w >= 768) return 3;
      if (w >= 640) return 2;
      return 1;
    };
    const apply = () => setCount(compute());
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);
  return count;
};

const HeroPromoBanners = ({ banners = DEFAULT_BANNERS, intervalMs = 4000 }) => {
  const visible = useVisibleCount();
  const total = banners.length;
  // Track contains the real banners followed by `visible` clones of the first banners.
  const track = total > visible ? [...banners, ...banners.slice(0, visible)] : banners;
  const canLoop = total > visible;

  const [index, setIndex] = useState(0);
  const [withTransition, setWithTransition] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const snappingRef = useRef(false);

  // Reset position whenever the visible-count (breakpoint) changes
  useEffect(() => {
    setWithTransition(false);
    setIndex(0);
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => setWithTransition(true))
    );
    return () => cancelAnimationFrame(id);
  }, [visible]);

  const goNext = useCallback(() => {
    if (snappingRef.current) return;
    setWithTransition(true);
    setIndex((i) => i + 1);
  }, []);

  const goPrev = useCallback(() => {
    if (snappingRef.current) return;
    if (index <= 0 && canLoop) {
      // Snap (no transition) to the cloned-end position, then animate one step back
      snappingRef.current = true;
      setWithTransition(false);
      setIndex(total);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setWithTransition(true);
          setIndex(total - 1);
          snappingRef.current = false;
        });
      });
    } else {
      setWithTransition(true);
      setIndex((i) => i - 1);
    }
  }, [index, total, canLoop]);

  // When the forward animation lands on the cloned section, silently snap to 0
  const handleTransitionEnd = () => {
    if (!canLoop) return;
    if (index >= total) {
      snappingRef.current = true;
      setWithTransition(false);
      setIndex(0);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setWithTransition(true);
          snappingRef.current = false;
        });
      });
    }
  };

  // Auto-rotate
  useEffect(() => {
    if (!canLoop || isPaused) return;
    const id = setInterval(() => {
      if (!snappingRef.current) {
        setWithTransition(true);
        setIndex((i) => i + 1);
      }
    }, intervalMs);
    return () => clearInterval(id);
  }, [canLoop, isPaused, intervalMs]);

  if (!banners.length) return null;

  const itemWidthPct = 100 / visible;
  const translatePct = index * itemWidthPct;
  const activeDot = ((index % total) + total) % total;

  const jumpToPage = (target) => {
    if (snappingRef.current) return;
    setWithTransition(true);
    setIndex(target);
  };

  return (
    <section
      className="max-w-[1280px] mx-auto px-3 sm:px-4 mt-4 sm:mt-5 md:mt-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      <div className="relative group">
        {/* Slides viewport */}
        <div className="overflow-hidden">
          <div
            className="flex will-change-transform"
            style={{
              transform: `translateX(-${translatePct}%)`,
              transition: withTransition
                ? "transform 700ms cubic-bezier(0.22, 1, 0.36, 1)"
                : "none",
            }}
            onTransitionEnd={handleTransitionEnd}
          >
            {track.map((b, i) => (
              <div
                key={i}
                className="flex-shrink-0 px-1.5 sm:px-2"
                style={{ width: `${itemWidthPct}%` }}
              >
                <Link
                  to={b.to || "/store"}
                  aria-label={b.alt}
                  aria-hidden={i >= total ? "true" : undefined}
                  tabIndex={i >= total ? -1 : 0}
                  className="relative block rounded-2xl overflow-hidden bg-gray-100 shadow-sm hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-violet-500 transition-shadow duration-300"
                >
                  <img
                    src={b.src}
                    alt={b.alt}
                    loading={i < visible ? "eager" : "lazy"}
                    className="w-full h-full object-cover aspect-[2/1] transform transition-transform duration-700 ease-out hover:scale-[1.04]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/0 via-transparent to-white/0 hover:from-black/10 hover:to-white/10 transition-colors duration-500" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Prev/Next arrows */}
        {canLoop && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous banner"
              className="hidden md:flex absolute left-1 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm shadow-md items-center justify-center text-violet-900 hover:bg-white hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next banner"
              className="hidden md:flex absolute right-1 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm shadow-md items-center justify-center text-violet-900 hover:bg-white hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Pagination dots */}
        {canLoop && (
          <div className="flex items-center justify-center gap-1.5 mt-3">
            {Array.from({ length: total }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => jumpToPage(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === activeDot ? "w-6 bg-violet-600" : "w-1.5 bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroPromoBanners;
