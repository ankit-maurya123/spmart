import React from "react";
import { Link } from "react-router-dom";
import ProductCard from "../ui/ProductCard";
import { useProducts, useCategories } from "../../hooks/useProducts";
import { useLatestReviews } from "../../hooks/useReviews";
import { resolveProductImage } from "../../lib/imageMap";

const features = [
  { icon: "🚚", title: "Free Delivery", desc: "On orders above ₹499" },
  { icon: "✅", title: "Best Quality", desc: "100% genuine products" },
  { icon: "💰", title: "Best Prices", desc: "Lowest price guaranteed" },
  { icon: "🔄", title: "Easy Returns", desc: "7-day return policy" },
];

const CATEGORY_META = {
  Oil: { icon: "🫒", bg: "bg-yellow-50 dark:bg-yellow-400/10", border: "border-yellow-200 dark:border-yellow-500/30" },
  Spices: { icon: "🌶️", bg: "bg-red-50 dark:bg-red-400/10", border: "border-red-200 dark:border-red-500/30" },
  Flour: { icon: "🌾", bg: "bg-amber-50 dark:bg-amber-400/10", border: "border-amber-200 dark:border-amber-500/30" },
  Dairy: { icon: "🥛", bg: "bg-blue-50 dark:bg-blue-400/10", border: "border-blue-200 dark:border-blue-500/30" },
  Snacks: { icon: "🍿", bg: "bg-purple-50 dark:bg-purple-400/10", border: "border-purple-200 dark:border-purple-500/30" },
  Vegetables: { icon: "🥦", bg: "bg-green-50 dark:bg-green-400/10", border: "border-green-200 dark:border-green-500/30" },
  Noodles: { icon: "🍜", bg: "bg-orange-50 dark:bg-orange-400/10", border: "border-orange-200 dark:border-orange-500/30" },
  Essentials: { icon: "🧂", bg: "bg-cyan-50 dark:bg-cyan-400/10", border: "border-cyan-200 dark:border-cyan-500/30" },
  Beverages: { icon: "☕", bg: "bg-pink-50 dark:bg-pink-400/10", border: "border-pink-200 dark:border-pink-500/30" },
};

const DEFAULT_CATEGORY_META = { icon: "📦", bg: "bg-gray-50 dark:bg-gray-400/10", border: "border-gray-200 dark:border-gray-500/30" };

// Skeleton card for loading state
const SkeletonCard = () => (
  <div className="rounded-2xl bg-white/80 dark:bg-white/[0.04] border border-gray-200/60 dark:border-white/[0.06] overflow-hidden animate-pulse">
    <div className="h-36 sm:h-44 md:h-52 bg-gray-200 dark:bg-gray-700/30" />
    <div className="p-3 sm:p-4 space-y-2">
      <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  </div>
);

const Home = () => {
  const { data: allProducts, isLoading } = useProducts();
  const { data: categories } = useCategories();
  const { data: latestReviews } = useLatestReviews();

  const products = allProducts?.slice(0, 8) || [];
  const kiranaProducts = allProducts?.slice(8, 16) || [];

  // Pick products for hero orbit images (4 spread-out products)
  const heroFeatured = allProducts?.[8]; // Amul Ghee as center
  const heroOrbitItems = allProducts
    ? [allProducts[0], allProducts[10], allProducts[2], allProducts[11]]
    : [];

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="hero-section relative overflow-hidden min-h-[100vh] flex items-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="hero-blob hero-blob-1"></div>
          <div className="hero-blob hero-blob-2"></div>
          <div className="hero-blob hero-blob-3"></div>
          <div className="absolute inset-0 hero-grid opacity-[0.03]"></div>
          {[1,2,3,4,5,6].map(n => <div key={n} className={`hero-particle hero-particle-${n}`}></div>)}
        </div>

        <div className="relative z-10 max-w-[1200px] mx-auto w-full px-4 pt-24 pb-16 md:pt-28 md:pb-20">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="order-2 md:order-1">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs md:text-sm font-semibold rounded-full mb-5 animate-fade-in-down">
                <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                #1 Online Kirana Store
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.08] animate-fade-in-up">
                Your Daily<br />
                <span className="section-heading">Grocery</span> Needs<br />
                <span className="text-white/90">Delivered</span>{" "}
                <span className="relative inline-block">
                  <span className="section-heading">Fast</span>
                  <svg className="absolute -bottom-1 left-0 w-full" height="8" viewBox="0 0 100 8" preserveAspectRatio="none">
                    <path d="M0 7 Q25 0 50 4 T100 2" stroke="url(#underlineGrad)" strokeWidth="3" fill="none" strokeLinecap="round" />
                    <defs><linearGradient id="underlineGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#FFD700" /><stop offset="100%" stopColor="#FF8C00" /></linearGradient></defs>
                  </svg>
                </span>
              </h1>
              <p className="text-white/60 text-sm sm:text-base md:text-lg mt-5 max-w-lg leading-relaxed animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
                Fresh vegetables, premium oils, spices & daily essentials at unbeatable prices. Free delivery on orders above <span className="text-yellow-400 font-semibold">₹499</span>.
              </p>
              <div className="mt-7 flex items-center max-w-md animate-fade-in-up" style={{ animationDelay: "0.25s" }}>
                <div className="relative flex-1">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <input type="text" placeholder="Search groceries..." className="w-full pl-11 pr-4 py-3.5 bg-white/10 backdrop-blur-md border border-white/15 rounded-l-2xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-yellow-400/50 transition-all" />
                </div>
                <button className="px-6 py-3.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold text-sm rounded-r-2xl hover:from-yellow-300 hover:to-orange-400 transition-all whitespace-nowrap">Search</button>
              </div>
              <div className="flex flex-wrap gap-3 mt-6 animate-fade-in-up" style={{ animationDelay: "0.35s" }}>
                <Link to="/store" className="px-7 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold rounded-full shadow-lg hover:scale-105 transition-all duration-300 animate-pulse-glow text-sm md:text-base">Shop Now</Link>
                <button className="px-7 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-full hover:bg-white/20 hover:scale-105 transition-all duration-300 text-sm md:text-base">View Offers</button>
              </div>
              <div className="flex items-center gap-6 md:gap-8 mt-8 animate-fade-in-up" style={{ animationDelay: "0.45s" }}>
                {[
                  { val: allProducts ? `${allProducts.length}+` : "...", label: "Products" },
                  { val: categories ? `${categories.length}+` : "...", label: "Categories" },
                  { val: "30min", label: "Delivery" },
                ].map((s, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <div className="w-px h-10 bg-white/10"></div>}
                    <div><h4 className="text-2xl md:text-3xl font-extrabold text-white">{s.val}</h4><p className="text-gray-500 text-xs mt-0.5">{s.label}</p></div>
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="order-1 md:order-2 flex justify-center md:justify-end">
              <div className="relative w-[260px] h-[260px] sm:w-[320px] sm:h-[320px] md:w-[400px] md:h-[400px] lg:w-[460px] lg:h-[460px]">
                <div className="absolute inset-4 md:inset-8 rounded-full bg-gradient-to-br from-yellow-400/20 via-orange-500/10 to-cyan-400/20 blur-3xl"></div>
                <div className="absolute inset-0 rounded-full border border-white/10"></div>
                <div className="absolute inset-4 rounded-full border border-dashed border-white/5 hero-rotate-slow"></div>
                {/* Center featured product — dynamic */}
                <div className="absolute inset-[15%] rounded-full overflow-hidden border-4 border-yellow-400/30 shadow-2xl animate-float">
                  {heroFeatured ? (
                    <img src={resolveProductImage(heroFeatured)} alt={heroFeatured.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-700/50 animate-pulse" />
                  )}
                </div>
                {/* Orbit items — dynamic */}
                {["top-0 left-1/2 -translate-x-1/2 -translate-y-2", "top-1/2 right-0 translate-x-2 -translate-y-1/2", "bottom-0 left-1/2 -translate-x-1/2 translate-y-2", "top-1/2 left-0 -translate-x-2 -translate-y-1/2"].map((pos, i) => (
                  <div key={i} className={`absolute ${pos} w-14 h-14 sm:w-18 sm:h-18 md:w-22 md:h-22 rounded-2xl overflow-hidden shadow-xl border-2 border-white/20 hero-orbit-item`}>
                    {heroOrbitItems[i] ? (
                      <img src={resolveProductImage(heroOrbitItems[i])} alt={heroOrbitItems[i].name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-700/30 animate-pulse" />
                    )}
                  </div>
                ))}
                <div className="absolute -top-2 -right-2 md:top-2 md:right-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl px-2.5 py-1.5 shadow-lg animate-fade-in-down" style={{ animationDelay: "0.8s" }}>
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 bg-green-500/20 rounded-md flex items-center justify-center"><svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></div>
                    <div><p className="text-white text-[10px] font-bold">100% Fresh</p></div>
                  </div>
                </div>
                <div className="absolute -bottom-2 -left-2 md:bottom-2 md:left-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl px-2.5 py-1.5 shadow-lg animate-fade-in-up" style={{ animationDelay: "1s" }}>
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 bg-yellow-500/20 rounded-md flex items-center justify-center"><svg className="w-3 h-3 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                    <div><p className="text-white text-[10px] font-bold">30 Min</p></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" className="w-full" preserveAspectRatio="none"><path d="M0 40L60 36C120 32 240 24 360 28C480 32 600 48 720 52C840 56 960 48 1080 40C1200 32 1320 28 1380 26L1440 24V80H0Z" className="fill-[#f8fafc] dark:fill-transparent" /></svg>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="max-w-[1200px] mx-auto px-4 -mt-5 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4">
          {features.map((f, i) => (
            <div key={i} className="rounded-2xl p-3.5 sm:p-4 md:p-5 text-center bg-white/80 dark:bg-white/[0.04] border border-gray-200/60 dark:border-white/[0.06] backdrop-blur-sm shadow-sm dark:shadow-none hover:-translate-y-1 hover:shadow-md dark:hover:bg-white/[0.08] transition-all duration-300">
              <div className="text-2xl sm:text-3xl md:text-4xl mb-1.5 sm:mb-2">{f.icon}</div>
              <h3 className="text-gray-800 dark:text-white font-bold text-xs sm:text-sm md:text-base">{f.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-[10px] sm:text-xs md:text-sm mt-0.5">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="px-3 sm:px-4">
        {/* ===== DEALS BANNER ===== */}
        <section className="max-w-[1200px] mx-auto mt-8 sm:mt-10">
          <div className="relative rounded-2xl overflow-hidden p-5 sm:p-8 md:p-10">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-red-500 to-pink-600"></div>
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
              <div className="text-center sm:text-left">
                <span className="inline-block px-3 py-1 bg-white/20 text-white text-[10px] sm:text-xs font-bold rounded-full mb-2 uppercase tracking-wider">Limited Time</span>
                <h3 className="text-xl sm:text-2xl md:text-4xl font-extrabold text-white leading-tight">Today's Special Deals</h3>
                <p className="text-white/80 text-xs sm:text-sm mt-1 sm:mt-2">Get up to <span className="text-yellow-300 font-bold text-sm sm:text-lg">50% OFF</span> on essentials</p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                {["12", "08", "45"].map((t, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <span className="text-white font-extrabold text-lg sm:text-xl md:text-2xl">{t}</span>
                    </div>
                    <span className="text-white/60 text-[9px] mt-1">{["HRS", "MIN", "SEC"][i]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ===== POPULAR PRODUCTS ===== */}
        <section className="max-w-[1200px] mx-auto mt-12 sm:mt-14">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white">
              Shop Now at <span className="section-heading">SPMART!</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1.5 sm:mt-2 text-xs sm:text-sm md:text-base">Handpicked products just for you</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 md:gap-5">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
              : products.map((p) => <ProductCard key={p._id} product={p} />)
            }
          </div>
        </section>

        {/* ===== CATEGORIES (dynamic from DB) ===== */}
        <section className="max-w-[1200px] mx-auto mt-12 sm:mt-14">
          <div className="text-center mb-5 sm:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white">
              Shop by <span className="section-heading">Category</span>
            </h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
            {categories
              ? categories.map((cat, i) => {
                  const meta = CATEGORY_META[cat] || DEFAULT_CATEGORY_META;
                  return (
                    <Link key={i} to={`/store?category=${cat}`} className={`flex flex-col items-center gap-1 sm:gap-2 p-3 sm:p-4 md:p-5 rounded-2xl ${meta.bg} border ${meta.border} hover:scale-105 hover:shadow-md transition-all duration-300`}>
                      <span className="text-2xl sm:text-3xl md:text-4xl">{meta.icon}</span>
                      <span className="text-gray-700 dark:text-white text-[10px] sm:text-xs md:text-sm font-semibold">{cat}</span>
                    </Link>
                  );
                })
              : Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 p-4 md:p-5 rounded-2xl bg-gray-100 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.06] animate-pulse">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
                    <div className="w-12 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                ))
            }
          </div>
        </section>

        {/* ===== KIRANA PRODUCTS ===== */}
        <section className="max-w-[1200px] mx-auto mt-12 sm:mt-14">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white">
              Quality You Trust, <span className="section-heading">Prices You Love!</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1.5 sm:mt-2 text-xs sm:text-sm md:text-base">Top branded grocery essentials at best deals</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 md:gap-5">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
              : kiranaProducts.map((p) => <ProductCard key={p._id} product={p} />)
            }
          </div>
          <div className="flex justify-center mt-8 sm:mt-10">
            <Link to="/store" className="px-10 sm:px-16 md:px-20 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 text-sm sm:text-base md:text-lg font-bold rounded-full shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300">
              View All Categories
            </Link>
          </div>
        </section>

        {/* ===== CUSTOMER REVIEWS ===== */}
        {latestReviews && latestReviews.length > 0 && (
          <section className="max-w-[1200px] mx-auto mt-12 sm:mt-14">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white">
                What Our Customers <span className="section-heading">Say</span>
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1.5 sm:mt-2 text-xs sm:text-sm md:text-base">Real reviews from real customers</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 md:gap-5">
              {latestReviews.map((review) => (
                <Link
                  key={review._id}
                  to={review.productId ? `/product/${review.productId._id}` : "#"}
                  className="rounded-2xl p-4 sm:p-5 bg-white/80 dark:bg-white/[0.04] border border-gray-200/60 dark:border-white/[0.06] backdrop-blur-sm shadow-sm dark:shadow-none hover:-translate-y-1 hover:shadow-md dark:hover:bg-white/[0.08] transition-all duration-300 flex flex-col"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {review.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{review.name}</h4>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-3.5 h-3.5 ${star <= review.rating ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3 flex-1">
                    {review.comment}
                  </p>
                  {review.productId && (
                    <div className="flex items-center gap-2.5 mt-3 pt-3 border-t border-gray-100 dark:border-white/[0.06]">
                      <img
                        src={resolveProductImage(review.productId)}
                        alt={review.productId.name}
                        className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                      />
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 truncate">
                        {review.productId.name}
                      </span>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ===== CTA SECTION ===== */}
        <section className="max-w-[1200px] mx-auto mt-10 sm:mt-12">
          <div className="relative rounded-2xl overflow-hidden p-5 sm:p-8 md:p-12">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-600 via-blue-700 to-indigo-800"></div>
            <div className="absolute top-0 right-0 w-48 sm:w-64 md:w-80 h-48 sm:h-64 md:h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-5 md:gap-10">
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
                  Get Fresh Groceries<br /><span className="text-yellow-300">Delivered in 30 Minutes!</span>
                </h3>
                <p className="text-white/70 text-xs sm:text-sm mt-2 sm:mt-3 max-w-md mx-auto md:mx-0">Order now and enjoy free delivery on your first order.</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 sm:gap-3 mt-4 sm:mt-5">
                  <Link to="/store" className="px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold text-xs sm:text-sm rounded-full hover:scale-105 transition-all">Order Now</Link>
                  <Link to="/about" className="px-5 sm:px-6 py-2.5 sm:py-3 bg-white/15 border border-white/25 text-white font-semibold text-xs sm:text-sm rounded-full hover:bg-white/25 hover:scale-105 transition-all">Learn More</Link>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full max-w-[280px]">
                {[
                  { val: "30 Min", label: "Delivery", icon: "🚀" },
                  { val: allProducts ? `${allProducts.length}+` : "...", label: "Products", icon: "📦" },
                  { val: "₹0", label: "Delivery Fee*", icon: "🎁" },
                  { val: "4.8★", label: "Rating", icon: "⭐" },
                ].map((s, i) => (
                  <div key={i} className="bg-white/10 border border-white/10 rounded-xl p-3 text-center hover:bg-white/15 transition-all">
                    <span className="text-lg">{s.icon}</span>
                    <h4 className="text-white font-extrabold text-sm mt-1">{s.val}</h4>
                    <p className="text-white/50 text-[9px]">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ===== ABOUT ===== */}
        <section className="max-w-[1200px] mx-auto my-12 sm:my-14">
          <div className="rounded-2xl p-5 sm:p-8 md:p-10 bg-white/80 dark:bg-white/[0.04] border border-gray-200/60 dark:border-white/[0.06] backdrop-blur-sm shadow-sm dark:shadow-none">
            <h2 className="text-lg sm:text-xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Why Choose <span className="section-heading">SPMART?</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
              <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm md:text-base leading-relaxed">
                SPMart brings your local kirana store experience online! Shop daily groceries, household essentials, snacks, and more at unbeatable prices. Fast delivery, trusted quality, and the convenience of shopping from home.
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm md:text-base leading-relaxed">
                SPMart was founded to modernize your kirana shopping experience. We partner with local stores to bring you fresh, affordable groceries while supporting small businesses.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;
