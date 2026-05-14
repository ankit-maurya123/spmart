import React from "react";
import { Link } from "react-router-dom";
import usePageMeta from "../../hooks/usePageMeta";
import ProductSlider from "../ui/ProductSlider";
import CategoryCircles from "../ui/CategoryCircles";
import BannerCarousel from "../ui/BannerCarousel";
import HeroPromoBanners from "../ui/HeroPromoBanners";
import TopBrands from "../ui/TopBrands";
import { useProducts, useCategories } from "../../hooks/useProducts";
import { useLatestReviews } from "../../hooks/useReviews";
import { resolveProductImage } from "../../lib/imageMap";

const features = [
  { icon: "🚚", title: "Free Delivery", desc: "On orders above ₹499" },
  { icon: "✅", title: "Best Quality",  desc: "100% genuine products" },
  { icon: "💰", title: "Best Prices",   desc: "Lowest price guaranteed" },
  { icon: "🔄", title: "Easy Returns",  desc: "7-day return policy" },
];

const CATEGORY_META = {
  Oil:        { icon: "🫒", bg: "bg-yellow-50",  border: "border-yellow-200" },
  Spices:     { icon: "🌶️", bg: "bg-red-50",     border: "border-red-200" },
  Flour:      { icon: "🌾", bg: "bg-amber-50",   border: "border-amber-200" },
  Dairy:      { icon: "🥛", bg: "bg-blue-50",    border: "border-blue-200" },
  Snacks:     { icon: "🍿", bg: "bg-purple-50",  border: "border-purple-200" },
  Vegetables: { icon: "🥦", bg: "bg-green-50",   border: "border-green-200" },
  Noodles:    { icon: "🍜", bg: "bg-orange-50",  border: "border-orange-200" },
  Essentials: { icon: "🧂", bg: "bg-cyan-50",    border: "border-cyan-200" },
  Beverages:  { icon: "☕", bg: "bg-pink-50",    border: "border-pink-200" },
};

const DEFAULT_CATEGORY_META = { icon: "📦", bg: "bg-gray-50", border: "border-gray-200" };

// Skeleton card for loading state
const SkeletonCard = () => (
  <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden animate-pulse">
    <div className="aspect-square bg-gray-200" />
    <div className="p-3 space-y-2">
      <div className="h-3 w-3/4 bg-gray-200 rounded" />
      <div className="h-3 w-1/2 bg-gray-200 rounded" />
      <div className="h-4 w-2/3 bg-gray-200 rounded" />
    </div>
  </div>
);

const SliderSkeleton = ({ titleWidth = "w-48" }) => (
  <section className="max-w-[1280px] mx-auto px-3 sm:px-4 my-8 sm:my-10">
    <div className="space-y-2 mb-4">
      <div className={`h-6 ${titleWidth} bg-gray-200 rounded animate-pulse`} />
      <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
    </div>
    <div className="flex gap-3 overflow-hidden">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="w-[160px] sm:w-[200px] md:w-[230px] flex-shrink-0">
          <SkeletonCard />
        </div>
      ))}
    </div>
  </section>
);

const Home = () => {
  usePageMeta({
    title: null, // use the default homepage title
    description:
      "Shop daily groceries, fresh vegetables, premium oils, spices, dairy and snacks online with SPMart. 10-minute delivery, lowest prices and free delivery on orders ₹499+.",
  });

  const { data: allProducts, isLoading } = useProducts();
  const { data: categories } = useCategories();
  const { data: latestReviews } = useLatestReviews();

  // Group products by category for stacked Zepto-style sliders
  const byCategory = (cat) =>
    (allProducts || []).filter((p) => p.category === cat);

  const findByName = (n) => allProducts?.find((p) => p.name === n);
  const heroFeatured = findByName("Amul Pure Ghee");
  const heroSide1    = findByName("Aashirvaad Atta");
  const heroSide2    = findByName("Fortune Mustard Oil");

  // Sections in display order — Zepto-style category stacking
  const PRODUCT_SECTIONS = [
    { title: "Best Sellers",        subtitle: "Top picks loved by customers", source: "tag-bestseller" },
    { title: "Fresh Vegetables",    subtitle: "Farm-fresh, hand-picked daily", category: "Vegetables" },
    { title: "Cooking Oils",        subtitle: "Premium oils for everyday cooking", category: "Oil" },
    { title: "Dairy & Spreads",     subtitle: "Pure & fresh dairy essentials", category: "Dairy" },
    { title: "Atta, Rice & Dals",   subtitle: "Pantry must-haves at lowest prices", category: "Flour" },
    { title: "Snacks & Munchies",   subtitle: "Crispies, biscuits & much more", category: "Snacks" },
    { title: "Tea, Coffee & More",  subtitle: "Brew your perfect cup",          category: "Beverages" },
    { title: "Spices & Masalas",    subtitle: "Authentic flavours for your kitchen", category: "Spices" },
    { title: "Daily Essentials",    subtitle: "Salt, sugar, dals & staples",   category: "Essentials" },
  ];

  const resolveSectionProducts = (s) => {
    if (s.source === "tag-bestseller") {
      return (allProducts || []).filter(
        (p) => p.tags?.includes("Bestseller") || p.tags?.includes("Top Pick")
      );
    }
    return byCategory(s.category);
  };

  return (
    <>
      {/* ===== CATEGORY CIRCLES (right under header) ===== */}
      {categories && categories.length > 0 && (
        <CategoryCircles
          categories={categories.map((cat) => {
            const meta = CATEGORY_META[cat] || DEFAULT_CATEGORY_META;
            return {
              name: cat,
              icon: meta.icon,
              to: `/store?category=${encodeURIComponent(cat)}`,
              bg: meta.bg,
            };
          })}
        />
      )}

      {/* ===== AUTO-ROTATING BANNER CAROUSEL ===== */}
      <BannerCarousel products={allProducts || []} />

      {/* ===== TWIN PROMO BANNERS (₹0 Fees + Kirana Corner) ===== */}
      <HeroPromoBanners
        products={[heroFeatured, heroSide1, heroSide2].filter(Boolean)}
      />

      {/* ===== FEATURES STRIP ===== */}
      <section className="max-w-[1280px] mx-auto px-3 sm:px-4 mt-6 sm:mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 md:p-6 flex items-center gap-3 sm:gap-4 hover:shadow-md hover:border-violet-300 transition-all"
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0">
                {f.icon}
              </div>
              <div className="min-w-0">
                <h3 className="text-gray-900 font-bold text-xs sm:text-sm md:text-base truncate">{f.title}</h3>
                <p className="text-gray-500 text-[10px] sm:text-xs md:text-sm mt-0.5 leading-snug">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== STACKED CATEGORIZED PRODUCT SLIDERS ===== */}
      {isLoading
        ? Array.from({ length: 4 }).map((_, i) => <SliderSkeleton key={i} />)
        : PRODUCT_SECTIONS.map((s) => {
            const items = resolveSectionProducts(s);
            if (!items.length) return null;
            return (
              <ProductSlider
                key={s.title}
                title={s.title}
                subtitle={s.subtitle}
                products={items}
                seeAllTo={
                  s.category
                    ? `/store?category=${encodeURIComponent(s.category)}`
                    : "/store"
                }
              />
            );
          })}

      {/* ===== TOP BRANDS (replaces old Shop-by-Category grid) ===== */}
      {!isLoading && (
        <TopBrands products={allProducts || []} title="Top Brands" />
      )}

      {/* ===== DEALS / TIMER STRIP ===== */}
      <section className="max-w-[1280px] mx-auto px-3 sm:px-4 mt-10 sm:mt-12">
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden p-5 sm:p-8 md:p-10">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-rose-500" />
          <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-yellow-300/40 blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
            <div className="text-center sm:text-left">
              <span className="inline-block px-3 py-1 bg-white/20 text-white text-[10px] sm:text-xs font-bold rounded-full mb-2 uppercase tracking-wider">Limited Time</span>
              <h3 className="text-xl sm:text-2xl md:text-4xl font-extrabold text-white leading-tight">Today's Special Deals</h3>
              <p className="text-white/85 text-xs sm:text-sm mt-1 sm:mt-2">
                Get up to <span className="text-yellow-300 font-extrabold text-sm sm:text-lg">50% OFF</span> on essentials
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {["12", "08", "45"].map((t, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <span className="text-white font-extrabold text-lg sm:text-xl md:text-2xl">{t}</span>
                  </div>
                  <span className="text-white/70 text-[9px] mt-1 font-bold">{["HRS", "MIN", "SEC"][i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== CUSTOMER REVIEWS ===== */}
      {latestReviews && latestReviews.length > 0 && (
        <section className="max-w-[1280px] mx-auto px-3 sm:px-4 mt-10 sm:mt-12">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900">
              What Our Customers <span className="text-violet-600">Say</span>
            </h2>
            <p className="text-gray-500 mt-1.5 text-xs sm:text-sm md:text-base">Real reviews from real customers</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
            {latestReviews.map((review) => (
              <Link
                key={review._id}
                to={review.productId ? `/product/${review.productId._id}` : "#"}
                className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 flex flex-col hover:shadow-md hover:border-violet-300 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0">
                    {review.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 truncate">{review.name}</h4>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-3.5 h-3.5 ${star <= review.rating ? "text-yellow-400" : "text-gray-300"}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 flex-1">
                  {review.comment}
                </p>
                {review.productId && (
                  <div className="flex items-center gap-2.5 mt-3 pt-3 border-t border-gray-100">
                    <img
                      src={resolveProductImage(review.productId)}
                      alt={review.productId.name}
                      className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                    />
                    <span className="text-xs font-semibold text-gray-500 truncate">
                      {review.productId.name}
                    </span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ===== CTA ===== */}
      <section className="max-w-[1280px] mx-auto px-3 sm:px-4 mt-10 sm:mt-12">
        <div className="relative rounded-3xl overflow-hidden p-5 sm:p-8 md:p-12">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-700 via-violet-600 to-fuchsia-600" />
          <div className="absolute top-0 right-0 w-48 sm:w-64 md:w-80 h-48 sm:h-64 md:h-80 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute -bottom-12 -left-10 w-44 h-44 rounded-full bg-fuchsia-300/30 blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-5 md:gap-10">
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
                Get Fresh Groceries<br />
                <span className="text-yellow-300">Delivered in 10 Minutes!</span>
              </h3>
              <p className="text-white/80 text-xs sm:text-sm mt-2 sm:mt-3 max-w-md mx-auto md:mx-0">
                Order now and enjoy free delivery on your first order.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 sm:gap-3 mt-4 sm:mt-5">
                <Link to="/store" className="px-5 sm:px-6 py-2.5 sm:py-3 bg-white text-violet-700 font-extrabold text-xs sm:text-sm rounded-full hover:scale-105 transition-all">Order Now</Link>
                <Link to="/about" className="px-5 sm:px-6 py-2.5 sm:py-3 bg-white/15 border border-white/25 text-white font-bold text-xs sm:text-sm rounded-full hover:bg-white/25 hover:scale-105 transition-all">Learn More</Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full max-w-[280px]">
              {[
                { val: "10 Min",                                  label: "Delivery",     icon: "🚀" },
                { val: allProducts ? `${allProducts.length}+` : "...", label: "Products",     icon: "📦" },
                { val: "₹0",                                      label: "Delivery Fee*", icon: "🎁" },
                { val: "4.8★",                                    label: "Rating",       icon: "⭐" },
              ].map((s, i) => (
                <div key={i} className="bg-white/10 border border-white/20 rounded-xl p-3 text-center hover:bg-white/20 transition-all">
                  <span className="text-lg">{s.icon}</span>
                  <h4 className="text-white font-extrabold text-sm mt-1">{s.val}</h4>
                  <p className="text-white/60 text-[9px]">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== ABOUT ===== */}
      <section className="max-w-[1280px] mx-auto px-3 sm:px-4 my-10 sm:my-14">
        <div className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-8 md:p-10">
          <h2 className="text-lg sm:text-xl md:text-3xl font-extrabold text-gray-900 mb-3 sm:mb-4">
            Why Choose <span className="text-violet-600">SPMART?</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            <p className="text-gray-600 text-xs sm:text-sm md:text-base leading-relaxed">
              SPMart brings your local kirana store experience online! Shop daily groceries, household essentials, snacks, and more at unbeatable prices. Fast delivery, trusted quality, and the convenience of shopping from home.
            </p>
            <p className="text-gray-600 text-xs sm:text-sm md:text-base leading-relaxed">
              SPMart was founded to modernize your kirana shopping experience. We partner with local stores to bring you fresh, affordable groceries while supporting small businesses.
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
