import React from "react";
import { Link } from "react-router-dom";
import { resolveProductImage } from "../../lib/imageMap";

/**
 * Twin promo banners (Zepto-style) — replaces the old hero on Home.
 *
 * Left  : "All New SPMART Experience" — ₹0 fees pitch
 * Right : "Kirana Corner" — branded category promo with product visuals
 *
 * Fully responsive: stacks on mobile, side-by-side from md+.
 */
const HeroPromoBanners = ({ products = [] }) => {
  // Pick up to 3 products from the catalog to dress the right banner.
  const banner1 = products[0];
  const banner2 = products[1];
  const banner3 = products[2];

  return (
    <section className="max-w-[1280px] mx-auto px-3 sm:px-4 mt-4 sm:mt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-5">
        {/* ============== LEFT — All New SPMART Experience ============== */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-violet-100 via-violet-50 to-fuchsia-50 p-5 sm:p-6 md:p-7 min-h-[260px] sm:min-h-[300px]">
          {/* decorative blobs */}
          <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-violet-300/40 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-12 w-36 h-36 rounded-full bg-fuchsia-300/30 blur-2xl pointer-events-none" />

          <div className="relative">
            {/* heading */}
            <h2 className="text-base sm:text-lg md:text-xl font-extrabold tracking-wide text-violet-900 uppercase">
              All New <span className="text-violet-600">SPMART</span> Experience
            </h2>

            {/* two feature pills */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mt-4 sm:mt-5">
              {/* card 1 */}
              <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm flex items-center gap-2.5">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-base sm:text-lg md:text-xl font-extrabold text-violet-900 leading-none">₹0 FEES</p>
                  <p className="text-[9px] sm:text-[10px] text-violet-700/70 font-semibold uppercase tracking-wider mt-0.5">
                    On every order
                  </p>
                </div>
              </div>

              {/* card 2 */}
              <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm flex items-center gap-2.5">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-2 0-3 1-3 2.5S10 13 12 13s3 1 3 2.5S14 18 12 18m0-10v10m0-10V6m0 14v-2" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-sm sm:text-base md:text-lg font-extrabold text-violet-900 leading-tight">
                    LOWEST<br />PRICES<sup>*</sup>
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-violet-700/70 font-semibold uppercase tracking-wider mt-0.5">
                    Every day
                  </p>
                </div>
              </div>
            </div>

            {/* checklist */}
            <ul className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 sm:gap-2 mt-4 sm:mt-5">
              {[
                "₹0 Handling Fee",
                "₹0 Delivery Fee*",
                "₹0 Surge Fee",
              ].map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span className="text-[11px] sm:text-xs font-bold text-violet-900">{item}</span>
                </li>
              ))}
            </ul>

            <p className="text-[9px] sm:text-[10px] text-violet-700/60 mt-2 sm:mt-3">
              *T&amp;C apply. Above specific minimum order value.
            </p>
          </div>
        </div>

        {/* ============== RIGHT — Kirana Corner promo ============== */}
        <Link
          to="/store"
          className="relative rounded-3xl overflow-hidden p-5 sm:p-6 md:p-7 min-h-[260px] sm:min-h-[300px] block group"
          style={{
            background:
              "linear-gradient(110deg, #1a0f3d 0%, #4c1d95 35%, #7c3aed 70%, #ec4899 100%)",
          }}
        >
          {/* stadium / spotlight glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-yellow-300/30 blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-44 h-44 rounded-full bg-fuchsia-400/40 blur-2xl" />
          </div>
          {/* faint grid pattern for stadium feel */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.55) 1px, transparent 1px)",
              backgroundSize: "18px 18px",
            }}
          />

          <div className="relative h-full flex flex-col justify-between">
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-none tracking-tight">
                Kirana <span className="text-yellow-300">Corner</span>
              </h2>
              <p className="mt-2 sm:mt-3 text-xs sm:text-sm md:text-base text-white/85 max-w-[80%]">
                Daily essentials, premium oils &amp; spices —<br className="hidden sm:block" />
                delivered in <span className="font-bold text-yellow-300">30 minutes</span>.
              </p>
            </div>

            {/* CTA + product visuals */}
            <div className="mt-5 sm:mt-6 flex items-end justify-between gap-3">
              <span className="inline-flex items-center gap-2 bg-white text-violet-900 font-extrabold text-sm sm:text-base rounded-full px-5 sm:px-6 py-2.5 sm:py-3 shadow-lg group-hover:scale-105 transition-transform">
                Order Now
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>

              <div className="flex items-end gap-2 sm:gap-3">
                {[banner1, banner2, banner3].filter(Boolean).map((p, i) => (
                  <div
                    key={p._id || i}
                    className={`relative ${i === 1 ? "w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28" : "w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24"}`}
                    style={{ animation: `floatY ${5 + i * 0.6}s ease-in-out infinite ${i * 0.3}s` }}
                  >
                    {/* glow */}
                    <div className="absolute inset-[-15%] rounded-full bg-yellow-300/30 blur-xl pointer-events-none" />
                    <img
                      src={resolveProductImage(p)}
                      alt={p.name}
                      className="relative w-full h-full object-contain"
                      style={{
                        filter:
                          "drop-shadow(0 12px 18px rgba(0,0,0,0.35)) drop-shadow(0 4px 8px rgba(255,255,255,0.18))",
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <p className="absolute bottom-1 right-3 text-[8px] sm:text-[9px] text-white/40 italic">
              *Free delivery on orders above ₹499
            </p>
          </div>
        </Link>
      </div>
    </section>
  );
};

export default HeroPromoBanners;
