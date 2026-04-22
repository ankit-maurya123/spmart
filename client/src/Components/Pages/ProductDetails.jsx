import { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useProduct, useRelatedProducts } from "../../hooks/useProducts";
import { useReviews, useAddReview } from "../../hooks/useReviews";
import { resolveProductImage } from "../../lib/imageMap";
import { useCart } from "../../context/CartContext";
import ProductCard from "../ui/ProductCard";

/* ── Tiny reusable pieces ───────────────────────────── */

function Stars({ rating, size = "w-4 h-4" }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`${size} ${s <= Math.round(rating) ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function RatingBar({ star, count, total }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-3 text-gray-500 dark:text-gray-400 font-medium text-right">{star}</span>
      <svg className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      <div className="flex-1 h-2 bg-gray-200 dark:bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full bg-yellow-400 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-6 text-xs text-gray-400 text-right">{count}</span>
    </div>
  );
}

const FEATURES = [
  {
    icon: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4",
    label: "Free Delivery",
    sub: "Orders above ₹499",
    color: "text-green-500",
    bg: "bg-green-50 dark:bg-green-500/10",
  },
  {
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    label: "100% Genuine",
    sub: "Authentic products",
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-500/10",
  },
  {
    icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
    label: "Easy Returns",
    sub: "7-day return policy",
    color: "text-orange-500",
    bg: "bg-orange-50 dark:bg-orange-500/10",
  },
  {
    icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
    label: "Secure Payment",
    sub: "Safe & encrypted",
    color: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-500/10",
  },
];

/* ── Skeleton ──────────────────────────────────────── */

function PageSkeleton() {
  return (
    <div className="pt-20 md:pt-24 pb-12 min-h-screen">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex items-center gap-2 mb-8">
          <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="bg-gray-200 dark:bg-gray-700/50 rounded-3xl h-[340px] sm:h-[440px] lg:h-[520px] animate-pulse" />
          <div className="space-y-5 animate-pulse">
            <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            <div className="h-9 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="flex gap-2">
              <div className="h-5 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
            <div className="h-12 w-44 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
            <div className="h-14 w-full bg-gray-200 dark:bg-gray-700 rounded-2xl" />
            <div className="h-14 w-full bg-gray-200 dark:bg-gray-700 rounded-2xl" />
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────── */

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { data: product, isLoading, isError } = useProduct(id);
  const { data: relatedProducts } = useRelatedProducts(product?.category, product?._id);
  const { data: reviews, isLoading: reviewsLoading } = useReviews(id);
  const addReviewMutation = useAddReview();

  const [quantity, setQuantity] = useState(1);
  const [imageZoomed, setImageZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [reviewForm, setReviewForm] = useState({ name: "", rating: 0, comment: "" });
  const [hoveredStar, setHoveredStar] = useState(0);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const discount = product?.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  // Rating breakdown
  const ratingStats = useMemo(() => {
    if (!reviews?.length) return { avg: 0, total: 0, dist: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;
    reviews.forEach((r) => {
      dist[r.rating] = (dist[r.rating] || 0) + 1;
      sum += r.rating;
    });
    return { avg: Math.round((sum / reviews.length) * 10) / 10, total: reviews.length, dist };
  }, [reviews]);

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewForm.name || !reviewForm.rating || !reviewForm.comment) return;
    setReviewSuccess(false);
    addReviewMutation.mutate(
      { productId: id, ...reviewForm },
      {
        onSuccess: () => {
          setReviewForm({ name: "", rating: 0, comment: "" });
          setReviewSuccess(true);
          setTimeout(() => setReviewSuccess(false), 3000);
        },
      }
    );
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setZoomPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  if (isLoading) return <PageSkeleton />;

  if (isError || !product) {
    return (
      <div className="pt-20 md:pt-24 pb-12 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Product Not Found</h2>
          <p className="text-gray-400 mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/store"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold rounded-full hover:scale-105 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Store
          </Link>
        </div>
      </div>
    );
  }

  const imageSrc = resolveProductImage(product);

  return (
    <div className="pt-20 md:pt-24 pb-12 min-h-screen">
      <div className="max-w-[1200px] mx-auto px-4">

        {/* ── Breadcrumb ─────────────────────────────── */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-400 mb-8 animate-fade-in-up">
          <Link to="/" className="hover:text-yellow-500 transition-colors">Home</Link>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <Link to="/store" className="hover:text-yellow-500 transition-colors">Store</Link>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-600 dark:text-gray-300 truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* ── Main product section ───────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 animate-fade-in-up">

          {/* ── Left: Image ──────────────────────────── */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div
              className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm border border-gray-200/60 dark:border-white/[0.06] cursor-zoom-in group"
              onMouseEnter={() => setImageZoomed(true)}
              onMouseLeave={() => setImageZoomed(false)}
              onMouseMove={handleMouseMove}
            >
              {/* Badges */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                {discount > 0 && (
                  <span className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-500/30">
                    {discount}% OFF
                  </span>
                )}
                <span className="px-3 py-1.5 bg-green-500/90 text-white text-xs font-bold rounded-xl shadow-lg shadow-green-500/20">
                  In Stock
                </span>
              </div>

              {/* Zoom hint */}
              <div className="absolute bottom-4 right-4 z-10 px-3 py-1.5 bg-black/50 backdrop-blur-sm text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
                Hover to zoom
              </div>

              <img
                className="w-full h-[340px] sm:h-[440px] lg:h-[520px] object-cover transition-transform duration-500"
                style={imageZoomed ? { transform: "scale(1.8)", transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : {}}
                src={imageSrc}
                alt={product.name}
              />
            </div>
          </div>

          {/* ── Right: Info ──────────────────────────── */}
          <div className="flex flex-col gap-5">
            {/* Category */}
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-400/10 text-yellow-700 dark:text-yellow-400 text-xs font-bold rounded-lg uppercase tracking-wider">
                {product.category}
              </span>
            </div>

            {/* Name */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
              {product.name}
            </h1>

            {/* Rating summary */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 dark:bg-yellow-400/10 rounded-xl">
                <Stars rating={product.rating} size="w-4 h-4" />
                <span className="text-sm font-bold text-gray-800 dark:text-white">{product.rating?.toFixed(1)}</span>
              </div>
              <span className="text-sm text-gray-400">
                {ratingStats.total} {ratingStats.total === 1 ? "review" : "reviews"}
              </span>
            </div>

            {/* Price */}
            <div className="flex items-end gap-3 flex-wrap">
              <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
                ₹{product.price}
              </span>
              {product.oldPrice && (
                <>
                  <span className="text-lg text-gray-400 line-through pb-0.5">₹{product.oldPrice}</span>
                  <span className="px-2.5 py-1 bg-green-100 dark:bg-green-400/10 text-green-700 dark:text-green-400 text-xs font-bold rounded-lg">
                    Save ₹{product.oldPrice - product.price}
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Divider */}
            <div className="h-px bg-gray-200 dark:bg-white/[0.06]" />

            {/* Quantity + Total */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Qty:</span>
                <div className="flex items-center border border-gray-200 dark:border-white/[0.1] rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors text-lg font-bold"
                  >
                    −
                  </button>
                  <span className="w-12 h-10 flex items-center justify-center text-sm font-bold text-gray-900 dark:text-white border-x border-gray-200 dark:border-white/[0.1]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors text-lg font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {quantity > 1 && (
                <div className="text-right">
                  <p className="text-xs text-gray-400">Total</p>
                  <p className="text-xl font-extrabold text-gray-900 dark:text-white">₹{product.price * quantity}</p>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddToCart}
                className="flex-1 py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-500 dark:to-blue-500 text-white text-sm sm:text-base font-bold rounded-2xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-cyan-500/25 active:scale-[0.98] transition-all"
              >
                {addedToCart ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Added!
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                    </svg>
                    Add to Cart
                  </>
                )}
              </button>

              <button
                onClick={() => { addToCart(product, quantity); navigate("/cart"); }}
                className="flex-1 py-3.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 text-sm sm:text-base font-bold rounded-2xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-yellow-500/25 active:scale-[0.98] transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Buy Now
              </button>
            </div>

            {/* Feature badges */}
            <div className="grid grid-cols-2 gap-3 mt-1">
              {FEATURES.map((f) => (
                <div key={f.label} className={`flex items-center gap-3 p-3 rounded-xl ${f.bg} border border-gray-100 dark:border-white/[0.04]`}>
                  <svg className={`w-5 h-5 ${f.color} flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                  </svg>
                  <div>
                    <p className="text-xs font-bold text-gray-800 dark:text-white leading-tight">{f.label}</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">{f.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Reviews Section ────────────────────────── */}
        <div className="mt-16 animate-fade-in-up">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-8">
            Customer <span className="section-heading">Reviews</span>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

            {/* ── Col 1: Rating summary + Form ────── */}
            <div className="lg:col-span-1 space-y-6">

              {/* Rating overview card */}
              <div className="rounded-2xl p-5 sm:p-6 bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm border border-gray-200/60 dark:border-white/[0.06]">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-4xl font-extrabold text-gray-900 dark:text-white leading-none">
                      {ratingStats.avg || product.rating?.toFixed(1) || "0.0"}
                    </p>
                    <Stars rating={ratingStats.avg || product.rating || 0} size="w-3.5 h-3.5" />
                    <p className="text-xs text-gray-400 mt-1">{ratingStats.total} reviews</p>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <RatingBar key={star} star={star} count={ratingStats.dist[star]} total={ratingStats.total} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Review form */}
              <div className="rounded-2xl p-5 sm:p-6 bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm border border-gray-200/60 dark:border-white/[0.06]">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Write a Review</h3>
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Your Name</label>
                    <input
                      type="text"
                      value={reviewForm.name}
                      onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                      placeholder="Enter your name"
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.1] text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Rating</label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                          onMouseEnter={() => setHoveredStar(star)}
                          onMouseLeave={() => setHoveredStar(0)}
                          className="p-0.5 transition-transform hover:scale-125"
                        >
                          <svg
                            className={`w-7 h-7 transition-colors ${
                              star <= (hoveredStar || reviewForm.rating) ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </button>
                      ))}
                      {reviewForm.rating > 0 && (
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                          {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][reviewForm.rating]}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Your Review</label>
                    <textarea
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      placeholder="Share your experience..."
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.1] text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-colors resize-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={addReviewMutation.isPending || !reviewForm.rating}
                    className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold text-sm rounded-xl hover:from-yellow-300 hover:to-orange-400 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addReviewMutation.isPending ? "Submitting..." : "Submit Review"}
                  </button>

                  {reviewSuccess && (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-semibold justify-center bg-green-50 dark:bg-green-500/10 rounded-xl py-2.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Review submitted successfully!
                    </div>
                  )}
                  {addReviewMutation.isError && (
                    <p className="text-red-500 text-sm font-semibold text-center">Failed to submit. Please try again.</p>
                  )}
                </form>
              </div>
            </div>

            {/* ── Col 2: Review list ─────────────── */}
            <div className="lg:col-span-2 space-y-4">
              {reviewsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="rounded-2xl p-5 bg-white/80 dark:bg-white/[0.04] border border-gray-200/60 dark:border-white/[0.06] animate-pulse">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                      <div className="space-y-1.5">
                        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                        <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                      </div>
                    </div>
                    <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                    <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                ))
              ) : reviews && reviews.length > 0 ? (
                reviews.map((review) => (
                  <div
                    key={review._id}
                    className="rounded-2xl p-5 sm:p-6 bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm border border-gray-200/60 dark:border-white/[0.06] hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {review.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white">{review.name}</h4>
                            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-bold rounded-md">
                              <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Verified
                            </span>
                          </div>
                          <Stars rating={review.rating} size="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0 pt-0.5">
                        {new Date(review.createdAt).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed pl-[52px]">
                      {review.comment}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl p-12 bg-white/80 dark:bg-white/[0.04] border border-gray-200/60 dark:border-white/[0.06] text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-white/[0.06] mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">No reviews yet</p>
                  <p className="text-sm text-gray-400 mt-1">Be the first to share your experience!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Related Products ───────────────────────── */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-16 animate-fade-in-up">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-6">
              You May Also <span className="section-heading">Like</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 md:gap-5">
              {relatedProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
