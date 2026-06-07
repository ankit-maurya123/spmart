import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useProduct, useRelatedProducts } from "../../hooks/useProducts";
import { useReviews, useAddReview } from "../../hooks/useReviews";
import {
  resolveProductImage,
  resolveProductImages,
} from "../../lib/imageMap";
import { useCart } from "../../context/CartContext";
import { useUserAuth } from "../../context/UserAuthContext";
import { useNavigate } from "react-router-dom";
import usePageMeta from "../../hooks/usePageMeta";
import ProductSlider from "../ui/ProductSlider";
import CircularImageGallery from "../ui/CircularImageGallery";

/* ── Tiny reusable bits ─────────────────────────────── */
function Stars({ rating, size = "w-4 h-4" }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`${size} ${s <= Math.round(rating) ? "text-yellow-400" : "text-gray-300"}`}
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
      <span className="w-3 text-gray-500 font-medium text-right">{star}</span>
      <svg className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-yellow-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-6 text-xs text-gray-400 text-right">{count}</span>
    </div>
  );
}

/* Faux review-count formatter — same shape as ProductCard */
const formatReviewCount = (product) => {
  if (typeof product?.reviewCount === "number") {
    return product.reviewCount >= 1000
      ? `${(product.reviewCount / 1000).toFixed(1).replace(/\.0$/, "")}k`
      : `${product.reviewCount}`;
  }
  const id = product?._id || product?.name || "x";
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const n = 1000 + (h % 49000);
  return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
};

/* Generate written About paragraphs from product data */
const buildAboutContent = (product) => {
  if (!product) return [];
  const brand = product.brand || "SPMart";
  const name = product.name;
  const category = product.category;
  const weight = product.weight;
  const tags = product.tags || [];

  const desc = product.description ||
    `${name} is a premium ${category.toLowerCase()} product carefully sourced and packed for everyday use.`;

  const para1 = `${desc} Made by ${brand}, this product is a popular choice in Indian households for its consistent quality and trusted brand legacy.`;

  const tagLine = tags.length
    ? `Tagged as ${tags.map((t) => `'${t}'`).join(", ")}, it stands out for its `
    : "It's known for its ";
  const adjective = tags.includes("Premium")
    ? "premium-grade quality"
    : tags.includes("Healthy")
    ? "health-friendly profile"
    : tags.includes("Bestseller")
    ? "bestseller status across SPMart"
    : tags.includes("Fresh")
    ? "fresh, farm-to-doorstep handling"
    : "everyday-use reliability";

  const para2 = `${tagLine}${adjective}. Each ${weight || "pack"} is sealed for freshness and delivered to your doorstep in just ${product.deliveryTime || "10 mins"}, so you never run out of essentials.`;

  const para3 = `Whether you're stocking the pantry or replenishing daily essentials, ${brand} ${name} brings the trusted store experience straight home — all at SPMart's lowest-prices-everyday promise.`;

  return [para1, para2, para3];
};

/* Generate a list of key features per product */
const buildKeyFeatures = (product) => {
  const features = [];
  if (product.brand) features.push(`Trusted ${product.brand} brand quality`);
  if (product.weight) features.push(`Conveniently packed in ${product.weight}`);
  if (product.deliveryTime) features.push(`Fast delivery in ${product.deliveryTime}`);
  if (product.tags?.includes("Fresh")) features.push("Sourced fresh — handpicked daily");
  if (product.tags?.includes("Healthy")) features.push("Curated as a healthy daily choice");
  if (product.tags?.includes("Bestseller")) features.push("One of SPMart's top bestsellers");
  if (product.tags?.includes("Premium")) features.push("Premium-grade ingredients");
  if (product.tags?.includes("Pure")) features.push("100% pure, no added preservatives");
  features.push("100% genuine — directly from authorized sellers");
  features.push("Easy returns within 7 days of delivery");
  return features.slice(0, 6);
};

/* Build FAQ list */
const buildFaqs = (product) => {
  const brand = product.brand || "SPMart";
  return [
    {
      q: `How fast is the delivery for ${product.name}?`,
      a: `On SPMart, ${product.name} is delivered to your doorstep in approximately ${product.deliveryTime || "10 mins"} — completely free for orders above ₹499.`,
    },
    {
      q: `Is ${product.name} genuine?`,
      a: `Yes. We source directly from ${brand} authorised distributors. Every product is 100% genuine, sealed, and within shelf life.`,
    },
    {
      q: "What is the return policy?",
      a: "Sealed grocery items are eligible for replacement within 7 days of delivery if there's a quality issue. Reach out to support@spmart.com.",
    },
    {
      q: "Are there bulk discounts available?",
      a: "Yes — apply the SPMART20 coupon at checkout to get 20% off on bulk grocery orders above ₹999.",
    },
  ];
};

/* ── Skeleton ──────────────────────────────────────── */
function PageSkeleton() {
  return (
    <div className="pt-4 md:pt-6 pb-12 min-h-screen">
      <div className="max-w-[1280px] mx-auto px-3 sm:px-4">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-3 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-3 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
          <div className="bg-gray-200 rounded-3xl aspect-square animate-pulse" />
          <div className="space-y-4 animate-pulse">
            <div className="h-4 w-20 bg-gray-200 rounded" />
            <div className="h-8 w-3/4 bg-gray-200 rounded" />
            <div className="h-4 w-32 bg-gray-200 rounded" />
            <div className="h-6 w-24 bg-gray-200 rounded" />
            <div className="h-10 w-44 bg-gray-200 rounded" />
            <div className="h-12 w-full bg-gray-200 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main component ────────────────────────────────── */
const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUserAuth();
  const { addToCart, items, updateQuantity, removeFromCart } = useCart();
  const { data: product, isLoading, isError } = useProduct(id);
  const { data: relatedProducts } = useRelatedProducts(product?.category, product?._id);
  const { data: reviews, isLoading: reviewsLoading } = useReviews(id);
  const addReviewMutation = useAddReview(user?.token);

  const [reviewForm, setReviewForm] = useState({ rating: 0, title: "", comment: "" });
  const [hoveredStar, setHoveredStar] = useState(0);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [reviewPage, setReviewPage] = useState(1);
  const REVIEWS_PER_PAGE = 4;
  const [openFaq, setOpenFaq] = useState(0);
  const [pincode, setPincode] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState(null);

  // Gallery: only this product's own unique images — no repeats, no padding.
  // Orbit shows 1–2 thumbnails depending on how many images the product has.
  const galleryImages = useMemo(
    () => (product ? resolveProductImages(product) : []),
    [product]
  );

  const inCart = items.find((c) => c.product?._id === product?._id);
  const qty = inCart?.quantity || 0;

  const discount = product?.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;
  const savings = product?.oldPrice ? product.oldPrice - product.price : 0;

  const aboutParas = useMemo(() => (product ? buildAboutContent(product) : []), [product]);
  const keyFeatures = useMemo(() => (product ? buildKeyFeatures(product) : []), [product]);
  const faqs = useMemo(() => (product ? buildFaqs(product) : []), [product]);

  // SEO meta — uses product brand + name + price
  usePageMeta({
    title: product
      ? `${product.brand ? `${product.brand} ` : ""}${product.name}${product.weight ? ` (${product.weight})` : ""}`
      : "Product",
    description: product
      ? `Buy ${product.brand || ""} ${product.name} (${product.weight || "pack"}) online at SPMart for just ₹${product.price}. ${product.deliveryTime || "10-min"} delivery, lowest price guaranteed.`
      : undefined,
  });

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

  // JSON-LD structured data for Google product rich-results
  // Must come AFTER `ratingStats` is declared — otherwise the dep array
  // hits a TDZ ReferenceError and blanks the page.
  useEffect(() => {
    if (!product) return;
    const ld = {
      "@context": "https://schema.org/",
      "@type": "Product",
      name: product.name,
      description: product.description,
      brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
      category: product.category,
      sku: product._id,
      offers: {
        "@type": "Offer",
        priceCurrency: "INR",
        price: product.price,
        availability: "https://schema.org/InStock",
        priceValidUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10),
      },
      aggregateRating: product.rating
        ? {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: ratingStats.total || 100,
          }
        : undefined,
    };
    let el = document.getElementById("ld-product");
    if (!el) {
      el = document.createElement("script");
      el.type = "application/ld+json";
      el.id = "ld-product";
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(ld);
    return () => { if (el && el.parentNode) el.parentNode.removeChild(el); };
  }, [product, ratingStats.total]);

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (!reviewForm.rating || !reviewForm.comment.trim()) return;
    setReviewSuccess(false);
    addReviewMutation.mutate(
      { productId: id, rating: reviewForm.rating, title: reviewForm.title, comment: reviewForm.comment },
      {
        onSuccess: () => {
          setReviewForm({ rating: 0, title: "", comment: "" });
          setReviewFormOpen(false);
          setReviewSuccess(true);
          // Keep the success banner visible longer so the user sees the
          // "awaiting approval" message clearly.
          setTimeout(() => setReviewSuccess(false), 6000);
        },
      }
    );
  };

  const openReviewForm = () => {
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setReviewFormOpen(true);
  };

  // Derive a brief "Customers Say" summary from the most-used positive words
  // and quick stats. Static-but-data-driven — replaces "AI summary" without
  // any external API call.
  const customersSay = useMemo(() => {
    if (!reviews?.length || !product) return "";
    const positive = reviews.filter((r) => r.rating >= 4).length;
    const pct = Math.round((positive / reviews.length) * 100);
    const cat = (product.category || "product").toLowerCase().replace(/s$/, "");
    if (pct >= 80) {
      return `Customers appreciate this ${cat} for its quality, value and fast delivery — ${pct}% of reviewers rated it 4★ or above.`;
    }
    if (pct >= 50) {
      return `Most customers are happy with this ${cat} — ${pct}% rated it 4★+. A few have raised concerns about pricing or packaging.`;
    }
    return `Customer feedback is mixed for this ${cat} — only ${pct}% rated it 4★+. Read the reviews below for details.`;
  }, [reviews, product]);

  // Pagination slice for the reviews list
  const pagedReviews = useMemo(() => {
    if (!reviews) return [];
    const start = (reviewPage - 1) * REVIEWS_PER_PAGE;
    return reviews.slice(start, start + REVIEWS_PER_PAGE);
  }, [reviews, reviewPage]);
  const reviewPageCount = reviews ? Math.ceil(reviews.length / REVIEWS_PER_PAGE) : 0;

  const handlePincodeCheck = (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pincode)) {
      setPincodeStatus({ ok: false, msg: "Enter a valid 6-digit pincode." });
      return;
    }
    // Fake serviceability — every pincode "ships" with the product's delivery time
    setPincodeStatus({
      ok: true,
      msg: `Delivers to ${pincode} in ${product?.deliveryTime || "10 mins"}`,
    });
  };

  if (isLoading) return <PageSkeleton />;

  if (isError || !product) {
    return (
      <div className="pt-12 pb-12 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h2>
          <p className="text-gray-400 mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <Link to="/store" className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-full transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Store
          </Link>
        </div>
      </div>
    );
  }

  const reviewCount = ratingStats.total || formatReviewCount(product);

  return (
    <div className="pt-4 md:pt-6 pb-12 min-h-screen">
      <div className="max-w-[1280px] mx-auto px-3 sm:px-4">

        {/* ── Breadcrumb ─────────────────────────────── */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-400 mb-5 overflow-hidden">
          <Link to="/" className="hover:text-violet-600 transition-colors">Home</Link>
          <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <Link to={`/store?category=${encodeURIComponent(product.category)}`} className="hover:text-violet-600 transition-colors">{product.category}</Link>
          <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="text-gray-700 font-semibold truncate">{product.name}</span>
        </nav>

        {/* ────── MAIN PRODUCT SECTION (gallery + info column) ────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">

          {/* Left: circular orbit gallery + sticky price/ADD row */}
          <div className="lg:col-span-6 lg:sticky lg:top-32 lg:self-start">
            <div className="relative bg-gradient-to-br from-violet-50 via-white to-rose-50 rounded-3xl border border-gray-200 p-3 sm:p-5">
              <CircularImageGallery
                images={galleryImages}
                alt={product.name}
                topLeftBadge={
                  discount > 0
                    ? { label: `${discount}% OFF`, color: "rose" }
                    : { label: "NEW", color: "rose" }
                }
                topRightBadge={
                  product.tags?.includes("Bestseller")
                    ? { label: "BESTSELLER", color: "amber" }
                    : { label: "VERIFIED", color: "emerald" }
                }
              />
            </div>

            {/* ── Price pill + Add-to-Cart row (under the gallery, stays sticky) ── */}
            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="flex items-baseline gap-2 flex-shrink-0">
                <span className="inline-flex items-center px-3 py-2 rounded-lg bg-green-600 text-white font-extrabold text-base sm:text-lg shadow-sm leading-none">
                  ₹{product.price}
                </span>
                {product.oldPrice && (
                  <span className="text-sm sm:text-base text-gray-400 line-through font-medium">
                    ₹{product.oldPrice}
                  </span>
                )}
              </div>

              {qty > 0 ? (
                <div className="flex items-center bg-rose-500 rounded-lg shadow-md overflow-hidden h-11 sm:h-12 select-none">
                  <button
                    type="button"
                    onClick={() => (qty <= 1 ? removeFromCart(product._id) : updateQuantity(product._id, qty - 1))}
                    className="px-3 sm:px-4 h-full text-white font-extrabold text-lg hover:bg-rose-600 transition-colors"
                    aria-label="Decrease"
                  >
                    −
                  </button>
                  <div className="flex flex-col items-center justify-center px-2 min-w-[44px]">
                    <span className="text-[10px] font-bold text-white/80 leading-none">In Cart</span>
                    <span className="text-base font-extrabold text-white leading-none mt-0.5">{qty}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateQuantity(product._id, qty + 1)}
                    className="px-3 sm:px-4 h-full text-white font-extrabold text-lg hover:bg-rose-600 transition-colors"
                    aria-label="Increase"
                  >
                    +
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => addToCart(product, 1)}
                  className="flex-1 sm:flex-initial px-6 sm:px-10 h-11 sm:h-12 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-sm sm:text-base font-extrabold shadow-md transition-colors"
                >
                  Add to Cart
                </button>
              )}
            </div>
          </div>

          {/* Right: product info */}
          <div className="lg:col-span-6 flex flex-col gap-4">

            {/* ── Brand + Share ── */}
            <div className="flex items-center justify-between gap-3">
              {product.brand ? (
                <Link
                  to={`/store?search=${encodeURIComponent(product.brand)}`}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 border border-violet-100 hover:bg-violet-100 transition-colors"
                >
                  <span className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-[10px] font-extrabold">
                    {product.brand.charAt(0)}
                  </span>
                  <span className="text-xs font-extrabold text-violet-700">{product.brand}</span>
                  <svg className="w-3 h-3 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ) : <span />}

              <div className="flex items-center gap-1.5">
                <button aria-label="Share" className="w-9 h-9 rounded-full border border-gray-200 hover:border-violet-300 hover:bg-violet-50 flex items-center justify-center text-gray-500 hover:text-violet-600 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
                <button aria-label="Wishlist" className="w-9 h-9 rounded-full border border-gray-200 hover:border-rose-300 hover:bg-rose-50 flex items-center justify-center text-gray-500 hover:text-rose-500 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* ── Title ── */}
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">
              {product.name}
            </h1>

            {/* ── Net quantity ── */}
            {product.weight && (
              <p className="text-sm text-gray-500 -mt-1">1 pack ({product.weight})</p>
            )}

            {/* ── Rating + Best-seller badge ── */}
            <div className="flex items-center gap-2 flex-wrap">
              {(product.rating || ratingStats.total) > 0 && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-600 text-white text-xs font-extrabold">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                    <path d="M17.5 2.5c0 7-5 12-12.5 12.5l-2 .5C3.5 8.5 9 3 17.5 2.5z" />
                  </svg>
                  {(ratingStats.avg || product.rating || 0).toFixed(1)}
                </span>
              )}
              <a href="#reviews" className="text-xs sm:text-sm text-gray-500 font-semibold hover:text-violet-600 transition-colors">
                ({reviewCount} {ratingStats.total ? "reviews" : "ratings"})
              </a>
              {product.tags?.includes("Bestseller") && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-stone-700 text-[10px] font-extrabold uppercase tracking-wide italic">
                  Bestseller
                </span>
              )}
            </div>

            {/* ── Price block ── */}
            <div className="bg-gradient-to-br from-gray-50 to-violet-50/40 rounded-2xl p-4 border border-gray-100">
              <div className="flex items-end gap-3 flex-wrap">
                <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-none">
                  ₹{product.price}
                </span>
                {product.oldPrice && (
                  <>
                    <span className="text-base text-gray-400 line-through pb-1">
                      MRP ₹{product.oldPrice}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-extrabold text-white bg-rose-500 pb-1">
                      {discount}% OFF
                    </span>
                  </>
                )}
              </div>
              {savings > 0 && (
                <p className="text-sm text-green-700 font-bold mt-1.5">
                  You save ₹{savings} on this item
                </p>
              )}
              <p className="text-[11px] text-gray-400 mt-1">(inclusive of all taxes)</p>
            </div>

            {/* ── Coupon / offers row ── */}
            <div className="border border-dashed border-violet-300 bg-violet-50/40 rounded-xl p-3 flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-violet-600 text-white flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-extrabold text-violet-900">Save extra ₹50</p>
                <p className="text-[11px] text-violet-700/80">Use code <span className="font-mono font-bold">SPMART20</span> on orders ₹999+</p>
              </div>
              <button className="text-xs font-extrabold text-violet-600 hover:text-violet-700 underline-offset-2 hover:underline flex-shrink-0">
                Apply
              </button>
            </div>

            {/* ── Delivery strip ── */}
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-violet-50 border border-violet-100">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white shadow-sm flex-shrink-0">
                <svg className="w-5 h-5 text-violet-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
              </span>
              <div className="leading-tight flex-1">
                <p className="text-sm font-extrabold text-violet-900">Get it in {product.deliveryTime || "10 mins"}</p>
                <p className="text-[11px] text-violet-700/70">Free delivery on orders ₹499+</p>
              </div>
            </div>

            {/* ── Pincode check ── */}
            <form onSubmit={handlePincodeCheck} className="flex items-center gap-2">
              <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-xl border border-gray-200 bg-white focus-within:border-violet-400 transition-colors">
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter pincode to check delivery"
                  value={pincode}
                  onChange={(e) => { setPincode(e.target.value.replace(/\D/g, "")); setPincodeStatus(null); }}
                  className="flex-1 bg-transparent text-sm focus:outline-none placeholder-gray-400"
                />
              </div>
              <button type="submit" className="px-4 py-2 rounded-xl bg-gray-900 text-white text-xs font-extrabold hover:bg-gray-800 transition-colors">
                Check
              </button>
            </form>
            {pincodeStatus && (
              <p className={`text-xs font-bold -mt-1 ${pincodeStatus.ok ? "text-green-600" : "text-rose-500"}`}>
                {pincodeStatus.ok ? "✓ " : "✗ "}{pincodeStatus.msg}
              </p>
            )}

            {/* ── Tag pills ── */}
            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {product.tags.map((t) => (
                  <span key={t} className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-100">
                    {t}
                  </span>
                ))}
              </div>
            )}

            {/* ── Trust strip ── */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[
                { ic: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622", label: "100% Genuine" },
                { ic: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15", label: "Easy Returns" },
                { ic: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z", label: "Secure Pay" },
              ].map((f) => (
                <div key={f.label} className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-gray-50 border border-gray-200">
                  <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={f.ic} />
                  </svg>
                  <span className="text-[10px] font-bold text-gray-700 text-center leading-tight">{f.label}</span>
                </div>
              ))}
            </div>

            {/* ─── Below this line, the right column keeps scrolling
                  while the left gallery stays pinned (sticky). ─── */}

            {/* ── About card ── */}
            <section className="mt-2 bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
              <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 mb-3">
                About <span className="text-violet-600">{product.brand} {product.name}</span>
              </h2>
              <div className="space-y-3">
                {aboutParas.map((p, i) => (
                  <p key={i} className="text-sm text-gray-600 leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>
            </section>

            {/* ── Key Highlights ── */}
            <section className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
              <h3 className="text-base font-extrabold text-gray-900 mb-3">Key Highlights</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {keyFeatures.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-700 flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="leading-snug">{f}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* ── Product Details table ── */}
            <section className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
              <h3 className="text-base font-extrabold text-gray-900 mb-3">Product Details</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                {[
                  ["Brand", product.brand || "SPMart"],
                  ["Category", product.category],
                  ["Pack Size", product.weight || "—"],
                  ["Delivery", product.deliveryTime || "10 mins"],
                  ["Country of Origin", "India"],
                  ["Shelf Life", "As printed on pack"],
                  ["FSSAI License", "10012345678901"],
                  ["Item Code", product._id?.slice(-8).toUpperCase() || "—"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2 border-b border-gray-100">
                    <dt className="text-gray-500">{k}</dt>
                    <dd className="font-semibold text-gray-900 text-right ml-3 truncate">{v}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {/* ── Information / Why SPMart ── */}
            <section className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 space-y-5">
              <div>
                <h3 className="text-base font-extrabold text-gray-900 mb-3">Information</h3>
                <div className="space-y-3 text-xs sm:text-sm">
                  <div>
                    <p className="text-gray-500 mb-0.5 font-semibold">Customer Care</p>
                    <p className="text-gray-800">support@spmart.com</p>
                    <p className="text-gray-500 text-[11px]">Mon–Sun, 8am–10pm IST</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-0.5 font-semibold">Seller</p>
                    <p className="text-gray-800">SP Mart Retail Pvt. Ltd.</p>
                    <p className="text-gray-500 text-[11px]">Mumbai, Maharashtra, India</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-0.5 font-semibold">Manufacturer / Marketer</p>
                    <p className="text-gray-800">{product.brand || "SP Mart"} — refer to pack for full address.</p>
                  </div>
                  <p className="text-[11px] text-gray-400 italic pt-2 border-t border-gray-100">
                    * All images are for representational purposes. Read labels carefully before purchase.
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-5">
                <h3 className="text-base font-extrabold text-gray-900 mb-3">Why SPMart?</h3>
                <ul className="space-y-2 text-xs sm:text-sm">
                  {[
                    "30-min delivery in your city",
                    "Lowest prices, every day",
                    "Daily-fresh quality, sealed packs",
                    "100% replacement if damaged",
                  ].map((b) => (
                    <li key={b} className="flex items-center gap-2 text-gray-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* ── FAQ accordion ── */}
            <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <h3 className="text-base font-extrabold text-gray-900 p-5 sm:p-6 pb-3">
                Frequently Asked <span className="text-violet-600">Questions</span>
              </h3>
              <div className="divide-y divide-gray-100">
                {faqs.map((f, i) => {
                  const open = openFaq === i;
                  return (
                    <div key={i}>
                      <button
                        onClick={() => setOpenFaq(open ? -1 : i)}
                        aria-expanded={open}
                        aria-controls={`faq-panel-${i}`}
                        className="w-full flex items-center justify-between gap-3 p-4 sm:p-5 text-left hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-sm font-bold text-gray-900">{f.q}</span>
                        <svg
                          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}
                          aria-hidden="true"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {open && (
                        <div id={`faq-panel-${i}`} role="region" className="px-4 sm:px-5 pb-4 sm:pb-5 -mt-1">
                          <p className="text-sm text-gray-600 leading-relaxed">{f.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>

        {/* ── Similar products — moved ABOVE reviews per UX request ── */}
        {relatedProducts && relatedProducts.length > 0 && (
          <ProductSlider
            title="You May Also Like"
            subtitle={`More ${product.category} products you'll love`}
            products={relatedProducts}
            seeAllTo={`/store?category=${encodeURIComponent(product.category)}`}
          />
        )}

        {/* ─────────── RATINGS & REVIEWS (Flipkart-style two-column) ─────────── */}
        <section id="reviews" className="mt-10 sm:mt-12 scroll-mt-32 bg-white rounded-3xl border border-gray-200 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-6">
            Ratings &amp; Reviews
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] xl:grid-cols-[300px_1fr] gap-6 lg:gap-10">
            {/* ── LEFT: rating overview + rate-this-product CTA ────────── */}
            <aside className="lg:border-r lg:border-gray-100 lg:pr-6">
              <div className="flex items-start gap-5 sm:gap-6">
                <div className="text-left">
                  <p className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-none">
                    {(ratingStats.avg || product.rating || 0).toFixed(1)}
                  </p>
                  <div className="mt-1.5">
                    <Stars rating={ratingStats.avg || product.rating || 0} size="w-4 h-4" />
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1 font-medium">
                    {ratingStats.total.toLocaleString("en-IN")} rating{ratingStats.total !== 1 ? "s" : ""}
                  </p>
                </div>

                <div className="flex-1 min-w-0 space-y-1.5">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <RatingBar
                      key={star}
                      star={star}
                      count={ratingStats.dist[star]}
                      total={ratingStats.total}
                    />
                  ))}
                </div>
              </div>

              {/* Rate this product — interactive star selector */}
              <div className="mt-6 pt-5 border-t border-gray-100 text-center">
                <p className="text-sm font-extrabold text-gray-900">Rate this product</p>
                <p className="text-[11px] text-gray-500 mb-3">Help others make an informed decision!</p>
                <div className="flex items-center justify-center gap-1.5 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => {
                        if (!user) {
                          navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
                          return;
                        }
                        setReviewForm({ ...reviewForm, rating: star });
                        setReviewFormOpen(true);
                      }}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                      aria-label={`Rate ${star} out of 5`}
                      className="p-1 transition-transform hover:scale-125"
                    >
                      <svg
                        className={`w-7 h-7 transition-colors ${
                          star <= (hoveredStar || reviewForm.rating)
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                        fill={star <= (hoveredStar || reviewForm.rating) ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth={1.5}
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={openReviewForm}
                  className="w-full py-2.5 rounded-full border-2 border-violet-200 text-violet-700 font-bold text-sm hover:bg-violet-50 transition-colors"
                >
                  {user ? "Write a review" : "Sign in to write a review"}
                </button>
              </div>
            </aside>

            {/* ── RIGHT: Customers Say + Review list ────────────────── */}
            <div className="min-w-0">
              {/* Customers Say summary */}
              {customersSay && (
                <div className="pb-5 border-b border-gray-100">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-sm font-extrabold text-gray-900">Customers Say</h3>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2zM18 14l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3zM5 16l.7 2.1L8 19l-2.3.9L5 22l-.7-2.1L2 19l2.3-.9L5 16z" />
                      </svg>
                      Summarised
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{customersSay}</p>
                </div>
              )}

              {/* Inline submission feedback */}
              {reviewSuccess && (
                <div className="mt-4 flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl px-3.5 py-3">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold text-green-800">Thanks for your review!</p>
                    <p className="text-xs text-green-700 mt-0.5">It's been sent to our team for approval — once approved, it will appear here.</p>
                  </div>
                </div>
              )}

              {/* Inline review form (toggled by "Write a review") */}
              {reviewFormOpen && user && (
                <form
                  onSubmit={handleReviewSubmit}
                  className="mt-4 rounded-2xl border border-violet-200 bg-violet-50/30 p-4 sm:p-5 space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-extrabold text-gray-900">Write a review</h3>
                    <button
                      type="button"
                      onClick={() => { setReviewFormOpen(false); setReviewForm({ rating: 0, title: "", comment: "" }); }}
                      aria-label="Cancel"
                      className="text-xs font-bold text-gray-500 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Posting as <span className="font-bold text-gray-700">{user.name}</span>
                  </p>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Your rating</label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                          onMouseEnter={() => setHoveredStar(star)}
                          onMouseLeave={() => setHoveredStar(0)}
                          aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                          className="p-0.5 transition-transform hover:scale-125"
                        >
                          <svg
                            className={`w-6 h-6 transition-colors ${star <= (hoveredStar || reviewForm.rating) ? "text-yellow-400" : "text-gray-300"}`}
                            fill="currentColor" viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </button>
                      ))}
                      {reviewForm.rating > 0 && (
                        <span className="ml-2 text-xs text-gray-500">
                          {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][reviewForm.rating]}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Title (optional)</label>
                    <input
                      type="text"
                      value={reviewForm.title}
                      onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                      placeholder="A short headline for your review"
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-violet-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Your review</label>
                    <textarea
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      placeholder="Share your experience with this product…"
                      rows={3}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-violet-400 transition-colors resize-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={addReviewMutation.isPending || !reviewForm.rating || !reviewForm.comment.trim()}
                    className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-extrabold text-sm rounded-xl active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addReviewMutation.isPending ? "Submitting…" : "Submit review"}
                  </button>

                  {addReviewMutation.isError && (
                    <p className="text-rose-500 text-xs font-semibold text-center">
                      {addReviewMutation.error?.response?.data?.error || "Failed to submit. Please try again."}
                    </p>
                  )}
                </form>
              )}

              {/* Top Product Reviews */}
              <div className="mt-5">
                <h3 className="text-sm sm:text-base font-extrabold text-gray-900 mb-4">
                  Top Product Reviews{" "}
                  {!!ratingStats.total && (
                    <span className="text-gray-400 font-bold">({ratingStats.total})</span>
                  )}
                </h3>

                {reviewsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="rounded-2xl p-4 bg-gray-50 animate-pulse">
                        <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
                        <div className="h-3 w-full bg-gray-200 rounded mb-1.5" />
                        <div className="h-3 w-2/3 bg-gray-200 rounded" />
                      </div>
                    ))}
                  </div>
                ) : reviews && reviews.length > 0 ? (
                  <ul className="divide-y divide-gray-100">
                    {pagedReviews.map((review) => (
                      <li key={review._id} className="py-4 sm:py-5">
                        <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-base font-extrabold text-gray-900">
                            {review.rating.toFixed(1)}
                            <Stars rating={review.rating} size="w-3.5 h-3.5" />
                          </span>
                          {review.title && (
                            <span className="text-sm font-bold text-gray-900 truncate max-w-full">
                              {review.title}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed mb-2">
                          {review.comment}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-gray-500 flex-wrap">
                          <span className="inline-flex items-center gap-1">
                            <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="font-semibold text-gray-700">{review.name}</span>
                          </span>
                          <span>·</span>
                          <span>
                            {new Date(review.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="rounded-2xl p-8 sm:p-10 bg-gray-50 border border-dashed border-gray-200 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white border border-gray-200 mb-3">
                      <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <p className="text-sm font-bold text-gray-700">No reviews yet</p>
                    <p className="text-xs text-gray-500 mt-1">Be the first to share your experience!</p>
                  </div>
                )}

                {/* Pagination */}
                {reviewPageCount > 1 && (
                  <div className="mt-6 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setReviewPage((p) => Math.max(1, p - 1))}
                      disabled={reviewPage === 1}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200 bg-white text-sm font-bold text-gray-700 hover:border-violet-300 hover:text-violet-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.6}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                      Previous
                    </button>
                    <span className="text-xs font-semibold text-gray-500">
                      Page {reviewPage} of {reviewPageCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => setReviewPage((p) => Math.min(reviewPageCount, p + 1))}
                      disabled={reviewPage === reviewPageCount}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200 bg-white text-sm font-bold text-gray-700 hover:border-violet-300 hover:text-violet-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Next
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.6}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProductDetails;
