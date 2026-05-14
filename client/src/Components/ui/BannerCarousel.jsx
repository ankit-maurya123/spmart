import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { resolveProductImage } from "../../lib/imageMap";

/**
 * Auto-rotating hero banner carousel — Zepto-style.
 *
 * props:
 *   banners — array of { headline, sub, cta, ctaTo, gradient, accent, productNames? }
 *   products — full catalog (used to dress banners with real product packshots if `productNames` matches)
 *   intervalMs — auto-advance interval (default 5000)
 */
const DEFAULT_BANNERS = [
  {
    headline: "Daily Groceries",
    highlight: "Delivered in 10 min",
    sub: "Fresh produce, premium oils & everyday essentials.",
    cta: "Shop Now",
    ctaTo: "/store",
    gradient: "linear-gradient(110deg, #4c1d95 0%, #7c3aed 50%, #ec4899 100%)",
    accent: "#FCD34D",
    productNames: ["Amul Pure Ghee", "Aashirvaad Atta", "Fortune Mustard Oil"],
  },
  {
    headline: "Snacks & Munchies",
    highlight: "Up to 50% off",
    sub: "Crispies, biscuits & chocolates — handpicked for cravings.",
    cta: "Explore Snacks",
    ctaTo: "/store?category=Snacks",
    gradient: "linear-gradient(110deg, #be123c 0%, #f97316 50%, #f59e0b 100%)",
    accent: "#FFFFFF",
    productNames: ["Parle-G Biscuits", "Mast Makhana", "Roasted Makhana"],
  },
  {
    headline: "Pantry Essentials",
    highlight: "₹0 Delivery Fee",
    sub: "Stock up on rice, dal, atta & spices at lowest prices.",
    cta: "Stock Up",
    ctaTo: "/store?category=Essentials",
    gradient: "linear-gradient(110deg, #064e3b 0%, #059669 55%, #14b8a6 100%)",
    accent: "#FEF3C7",
    productNames: ["Basmati Rice Premium", "Moong Dal", "Tata Iodised Salt"],
  },
];

const BannerCarousel = ({
  banners = DEFAULT_BANNERS,
  products = [],
  intervalMs = 5000,
}) => {
  const [index, setIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const timerRef = useRef(null);

  // Auto-advance
  useEffect(() => {
    if (banners.length < 2 || isHovering) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % banners.length);
    }, intervalMs);
    return () => clearInterval(timerRef.current);
  }, [banners.length, isHovering, intervalMs]);

  if (!banners.length) return null;

  const findProduct = (name) => products.find((p) => p.name === name);

  return (
    <section
      className="max-w-[1280px] mx-auto px-3 sm:px-4 mt-4 sm:mt-6"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden">
        {/* Slides track */}
        <div
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {banners.map((b, i) => {
            const banProducts = (b.productNames || [])
              .map(findProduct)
              .filter(Boolean);
            return (
              <Link
                key={i}
                to={b.ctaTo || "/store"}
                className="relative flex-shrink-0 w-full p-5 sm:p-7 md:p-10 min-h-[230px] sm:min-h-[280px] md:min-h-[320px] flex items-center"
                style={{ background: b.gradient }}
                aria-label={`${b.headline} — ${b.cta}`}
              >
                {/* spotlight glow */}
                <div className="absolute inset-0 pointer-events-none">
                  <div
                    className="absolute top-0 left-1/3 w-72 h-72 rounded-full blur-3xl"
                    style={{ background: `${b.accent}40` }}
                  />
                  <div className="absolute bottom-0 right-1/4 w-44 h-44 rounded-full bg-white/15 blur-2xl" />
                </div>
                {/* dotted texture */}
                <div
                  className="absolute inset-0 opacity-15 pointer-events-none"
                  style={{
                    backgroundImage:
                      "radial-gradient(rgba(255,255,255,0.55) 1px, transparent 1px)",
                    backgroundSize: "18px 18px",
                  }}
                />

                <div className="relative z-10 flex-1 max-w-[60%] sm:max-w-[55%]">
                  <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-white leading-[1.05] tracking-tight">
                    {b.headline}
                    <br />
                    <span style={{ color: b.accent }}>{b.highlight}</span>
                  </h2>
                  <p className="mt-2 sm:mt-3 text-[11px] sm:text-sm md:text-base text-white/85 max-w-md leading-snug">
                    {b.sub}
                  </p>
                  <span className="mt-4 sm:mt-5 inline-flex items-center gap-1.5 sm:gap-2 bg-white text-violet-900 font-extrabold text-xs sm:text-sm rounded-full px-4 sm:px-5 py-2 sm:py-2.5 shadow-lg group-hover:scale-105 transition-transform">
                    {b.cta}
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </div>

                {/* Product packshots on the right */}
                {banProducts.length > 0 && (
                  <div className="hidden sm:flex absolute right-4 md:right-8 bottom-2 md:bottom-4 items-end gap-2 md:gap-4 pointer-events-none">
                    {banProducts.slice(0, 3).map((p, j) => (
                      <div
                        key={p._id || j}
                        className={`relative ${
                          j === 1
                            ? "w-24 h-24 md:w-36 md:h-36"
                            : "w-20 h-20 md:w-28 md:h-28"
                        }`}
                        style={{ animation: `floatY ${5 + j * 0.5}s ease-in-out infinite ${j * 0.3}s` }}
                      >
                        <div className="absolute inset-[-15%] rounded-full bg-white/15 blur-2xl" />
                        <img
                          src={resolveProductImage(p)}
                          alt={p.name}
                          className="relative w-full h-full object-contain"
                          style={{
                            filter:
                              "drop-shadow(0 16px 24px rgba(0,0,0,0.35)) drop-shadow(0 4px 8px rgba(255,255,255,0.18))",
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </Link>
            );
          })}
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
                  i === index ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
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
