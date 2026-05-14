import React, { useEffect, useState } from "react";

/**
 * Circular orbit gallery — main image in the center, up to 8 thumbnail
 * circles arranged in orbit around it. Click a thumbnail to swap it into
 * the center.
 *
 * The `images` array passed in MUST be only this product's own images
 * (use `resolveGalleryImages(product, 8)` from lib/imageMap to build it).
 *
 * props:
 *   images        — array of image URLs (recommend 8 for a full orbit)
 *   alt           — alt text base
 *   topLeftBadge  — optional { label, color: "rose" | "violet" | "amber" }
 *   topRightBadge — optional { label, color: "emerald" | "violet" | "amber" }
 */
const BADGE_COLORS = {
  rose:    { bg: "bg-rose-500",    dot: "bg-rose-200" },
  violet:  { bg: "bg-violet-600",  dot: "bg-violet-200" },
  emerald: { bg: "bg-emerald-500", dot: "bg-emerald-200" },
  amber:   { bg: "bg-amber-500",   dot: "bg-amber-200" },
};

const CircularImageGallery = ({
  images = [],
  alt = "Product",
  topLeftBadge,
  topRightBadge,
}) => {
  const [activeIdx, setActiveIdx] = useState(0);

  // Reset when the parent passes a new image set (different product)
  useEffect(() => { setActiveIdx(0); }, [images.join("|")]);

  if (!images.length) return null;

  // Up to 8 thumbnails on the orbit
  const thumbs = images.slice(0, 8);
  const active = images[activeIdx] || images[0];

  return (
    <div className="relative w-full aspect-square select-none">
      {/* Backdrop: subtle radial glow + dotted orbit ring */}
      <div className="absolute inset-0 rounded-full pointer-events-none">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(124, 58, 237, 0.10) 0%, rgba(244, 63, 94, 0.06) 45%, transparent 75%)",
          }}
        />
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          aria-hidden
        >
          {/* Outer dotted orbit */}
          <circle
            cx="50" cy="50" r="44"
            fill="none"
            stroke="rgba(124, 58, 237, 0.30)"
            strokeWidth="0.4"
            strokeDasharray="0.6 1.4"
          />
          {/* Inner subtle orbit */}
          <circle
            cx="50" cy="50" r="32"
            fill="none"
            stroke="rgba(244, 63, 94, 0.20)"
            strokeWidth="0.3"
            strokeDasharray="0.4 1.0"
          />
        </svg>
      </div>

      {/* Top-left badge (e.g. "X% OFF" or "NEW") */}
      {topLeftBadge && (
        <span
          className={`absolute top-2 sm:top-3 left-2 sm:left-3 z-30 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-extrabold text-white shadow-lg ${
            BADGE_COLORS[topLeftBadge.color || "rose"].bg
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${BADGE_COLORS[topLeftBadge.color || "rose"].dot} animate-pulse`}
          />
          {topLeftBadge.label}
        </span>
      )}

      {/* Top-right badge (e.g. "VERIFIED" or "BESTSELLER") */}
      {topRightBadge && (
        <span
          className={`absolute top-2 sm:top-3 right-2 sm:right-3 z-30 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-extrabold text-white shadow-lg ${
            BADGE_COLORS[topRightBadge.color || "emerald"].bg
          }`}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          {topRightBadge.label}
        </span>
      )}

      {/* ── Center main image (circular, golden ring) ── */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[55%] aspect-square z-20">
        {/* outer halo */}
        <div className="absolute inset-[-6%] rounded-full bg-gradient-to-br from-amber-300/40 via-rose-300/30 to-violet-400/40 blur-xl" />
        {/* gold ring */}
        <div className="relative w-full h-full rounded-full overflow-hidden border-[3px] sm:border-4 border-amber-400 shadow-[0_20px_60px_-15px_rgba(245,158,11,0.5)] bg-white">
          <img
            key={activeIdx}
            src={active}
            alt={alt}
            className="w-full h-full object-contain p-3 sm:p-5 animate-[fadeIn_0.4s_ease-out]"
            draggable={false}
          />
        </div>
      </div>

      {/* ── Orbiting thumbnails ── */}
      {thumbs.map((src, i) => {
        // Distribute around 360°, starting at top (12 o'clock)
        const angle = (i / thumbs.length) * 360 - 90;
        const rad = (angle * Math.PI) / 180;
        const radius = 42; // % from center
        const x = 50 + radius * Math.cos(rad);
        const y = 50 + radius * Math.sin(rad);
        const isActive = i === activeIdx;

        return (
          <button
            key={i}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setActiveIdx(i);
            }}
            onMouseEnter={() => setActiveIdx(i)}
            aria-label={`View image ${i + 1}`}
            className={`absolute z-10 w-[16%] aspect-square rounded-full overflow-hidden transition-all duration-300 hover:scale-110 ${
              isActive
                ? "ring-[3px] ring-amber-400 ring-offset-2 ring-offset-white/60 scale-110 shadow-xl"
                : "ring-2 ring-white/80 shadow-md hover:ring-violet-400"
            } bg-white`}
            style={{
              top: `${y}%`,
              left: `${x}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <img
              src={src}
              alt={`${alt} ${i + 1}`}
              className="w-full h-full object-contain p-1"
              loading="lazy"
              draggable={false}
            />
          </button>
        );
      })}
    </div>
  );
};

export default CircularImageGallery;
