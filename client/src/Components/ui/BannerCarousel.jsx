import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

/**
 * Auto-rotating hero banner carousel — image-based slides.
 *
 * Each banner is a full-bleed image (served from /banners/*) wrapped in a Link
 * that takes the user to the relevant store/category page.
 *
 * props:
 *   banners    — override list of { src, alt, to }
 *   intervalMs — auto-advance interval (default 5000)
 */
const DEFAULT_BANNERS = [
  {
    src: "/banners/soap-fest.webp",
    alt: "Soap Fest — Up to 50% off",
    to: "/store?category=Essentials",
  },
  {
    src: "/banners/world-baking-day.webp",
    alt: "Celebrate World Baking Day — Up to 50% off",
    to: "/store?category=Flour",
  },
  {
    src: "/banners/low-price-guarantee.png",
    alt: "Low Price Guarantee on your favourite items",
    to: "/store",
  },
];

const BannerCarousel = ({
  banners = DEFAULT_BANNERS,
  intervalMs = 5000,
}) => {
  const [index, setIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (banners.length < 2 || isHovering) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % banners.length);
    }, intervalMs);
    return () => clearInterval(timerRef.current);
  }, [banners.length, isHovering, intervalMs]);

  if (!banners.length) return null;

  return (
    <section
      className="max-w-[1280px] mx-auto px-3 sm:px-4 mt-4 sm:mt-6"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gray-100">
        {/* Slides track */}
        <div
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {banners.map((b, i) => (
            <Link
              key={i}
              to={b.to || "/store"}
              className="relative flex-shrink-0 w-full block"
              aria-label={b.alt}
            >
              <img
                src={b.src}
                alt={b.alt}
                loading={i === 0 ? "eager" : "lazy"}
                className="w-full h-auto object-cover aspect-[1920/520] sm:aspect-[1920/480] md:aspect-[1920/440]"
              />
            </Link>
          ))}
        </div>

        {/* Pagination dots */}
        {banners.length > 1 && (
          <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5">
            {banners.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Go to banner ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-6 bg-white" : "w-1.5 bg-white/60 hover:bg-white/90"
                }`}
              />
            ))}
          </div>
        )}

        {/* Prev/Next — hidden on mobile, visible on md+ */}
        {banners.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setIndex((i) => (i - 1 + banners.length) % banners.length)}
              aria-label="Previous banner"
              className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-md items-center justify-center text-violet-900 hover:bg-white transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setIndex((i) => (i + 1) % banners.length)}
              aria-label="Next banner"
              className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-md items-center justify-center text-violet-900 hover:bg-white transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>
    </section>
  );
};

export default BannerCarousel;
