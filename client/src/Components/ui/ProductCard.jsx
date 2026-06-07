import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  resolveProductImage,
  resolveProductImages,
} from "../../lib/imageMap";
import { useCart } from "../../context/CartContext";
import { useUserAuth } from "../../context/UserAuthContext";
import { useWishlist, useToggleWishlist } from "../../hooks/useWishlist";

/**
 * Product card — exact Zepto "Laundry Care" spec.
 *
 *  ┌────────────────────────────┐
 *  │ Bestseller ribbon          │
 *  │      [ image slider ]      │
 *  │              [ ADD ]       │  ← overlapping bottom-right
 *  ├────────────────────────────┤
 *  │ [₹194] ~~₹249~~            │  green price pill + old price
 *  │ ₹55 OFF                    │  green savings
 *  │ - - - - - - - - - - - - -  │  dashed divider
 *  │ Product Name (2 lines)     │
 *  │ 1 pack (2 kg)              │  weight (gray)
 *  │ [ Fresh & Fragrant ]       │  cyan tag pill
 *  │ 🌿 4.8 (37.6k)            │  leaf rating + count
 *  └────────────────────────────┘
 */

// Format a deterministic faux review-count from rating + id, so each card
// shows a stable "(37.6k)" style number. Real review counts can replace this
// later by simply passing `product.reviewCount` from the API.
const formatReviewCount = (product) => {
  if (typeof product.reviewCount === "number") {
    return product.reviewCount >= 1000
      ? `${(product.reviewCount / 1000).toFixed(1).replace(/\.0$/, "")}k`
      : `${product.reviewCount}`;
  }
  // Stable hash from _id so the number doesn't change between renders
  const id = product._id || product.name || "x";
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const n = 1000 + (h % 49000); // 1.0k–50.0k
  return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
};

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart, items = [], updateQuantity, removeFromCart } = useCart();
  const { user } = useUserAuth();
  const { data: wishlist = [] } = useWishlist();
  const toggleWishlist = useToggleWishlist();
  const isWishlisted = wishlist.some((p) => p?._id === product._id);

  // Quantity already in cart for this product
  const inCart = items.find((c) => c.product?._id === product._id);
  const qty = inCart?.quantity || 0;

  // Multi-image slider
  const slides = resolveProductImages(product);
  const hasSlider = slides.length > 1;
  const [index, setIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const intervalRef = useRef(null);

  // Pricing
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;
  const savings = product.oldPrice ? product.oldPrice - product.price : 0;

  // Stock
  const stock = typeof product.stock === "number" ? product.stock : 100;
  const isOutOfStock = stock === 0;
  const isLowStock = stock > 0 && stock <= 5;
  const isAtCartLimit = qty >= stock;

  // Tags
  const isBestseller = product.tags?.some(
    (t) => /^bestseller$/i.test(t) || /^top pick$/i.test(t)
  );
  const otherTag = product.tags?.find(
    (t) => !/^bestseller$/i.test(t) && !/^top pick$/i.test(t)
  );

  // Auto-cycle on hover
  useEffect(() => {
    if (!hasSlider || !isHovering) return;
    intervalRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 1500);
    return () => clearInterval(intervalRef.current);
  }, [hasSlider, isHovering, slides.length]);

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    if (product._id) addToCart(product);
  };

  // The card body — same JSX whether we wrap with Link or div below.
  // (Defining the wrapper as an inline component is a React anti-pattern:
  //  it creates a new component identity every render, which unmounts the
  //  Link mid-click and breaks navigation.)
  const cardBody = (
      <div
        className={`group relative h-full bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col transition-all hover:shadow-md hover:border-rose-200 ${
          isOutOfStock ? "opacity-90" : ""
        }`}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* ──────── IMAGE AREA ──────── */}
        <div className="relative">
          <div className="relative aspect-square overflow-hidden bg-white">
            {/* Slides */}
            <div
              className={`flex h-full transition-transform duration-500 ease-out ${isOutOfStock ? "grayscale" : ""}`}
              style={{ transform: `translateX(-${index * 100}%)` }}
            >
              {slides.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`${product.name} ${i + 1}`}
                  loading={i === 0 ? "eager" : "lazy"}
                  className="w-full h-full object-cover flex-shrink-0"
                  draggable={false}
                />
              ))}
            </div>

            {/* Out-of-stock overlay */}
            {isOutOfStock && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-[1px] pointer-events-none">
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-900 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-md">
                  Out of Stock
                </span>
              </div>
            )}

            {/* Low-stock badge — top-left */}
            {!isOutOfStock && isLowStock && (
              <span className="absolute top-1.5 left-0 z-10 inline-flex items-center px-2 py-0.5 rounded-r text-[9px] font-extrabold text-rose-700 bg-rose-100 shadow-sm uppercase tracking-wide animate-pulse">
                Only {stock} left
              </span>
            )}

            {/* Bestseller ribbon — top-left, small corner-tag */}
            {!isLowStock && isBestseller && (
              <span className="absolute top-1.5 left-0 z-10 inline-flex items-center px-2 py-0.5 rounded-r text-[9px] font-extrabold text-stone-700 bg-amber-100 shadow-sm uppercase tracking-wide italic">
                Bestseller
              </span>
            )}

            {/* Wishlist — top-right */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!user) {
                  navigate(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
                  return;
                }
                if (product._id) toggleWishlist.mutate(product._id);
              }}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              className={`absolute top-1.5 right-1.5 z-10 w-6 h-6 rounded-full bg-white/95 backdrop-blur-sm shadow-sm flex items-center justify-center transition-colors ${
                isWishlisted ? "text-rose-500" : "text-gray-400 hover:text-rose-500"
              }`}
            >
              {isWishlisted ? (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              )}
            </button>

            {/* Image-cycle dots — only visible on hover (matches the hover-driven auto-cycle) */}
            {hasSlider && isHovering && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10 pointer-events-none">
                {slides.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1 rounded-full transition-all ${
                      i === index ? "w-3 bg-rose-500" : "w-1 bg-gray-300/80"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ADD button — overlapping bottom-right of image */}
          <div className="absolute -bottom-2 right-2 sm:right-2.5 z-20">
            {isOutOfStock ? (
              <button
                type="button"
                disabled
                aria-label="Out of stock"
                className="px-3 sm:px-3.5 h-8 sm:h-9 rounded-lg bg-gray-100 border-[1.5px] border-gray-300 text-gray-500 text-[10px] font-extrabold uppercase tracking-wider cursor-not-allowed"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              >
                Sold Out
              </button>
            ) : qty > 0 ? (
              <div
                onClick={(e) => e.preventDefault()}
                className="flex items-center bg-rose-500 rounded-lg shadow-md overflow-hidden h-8 sm:h-9 select-none"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (qty <= 1) removeFromCart(product._id);
                    else updateQuantity(product._id, qty - 1);
                  }}
                  className="px-2 sm:px-2.5 h-full text-white font-extrabold text-sm sm:text-base hover:bg-rose-600 transition-colors"
                  aria-label="Decrease"
                >
                  −
                </button>
                <span className="px-1 text-white text-xs font-extrabold min-w-[14px] text-center">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (isAtCartLimit) return;
                    updateQuantity(product._id, qty + 1);
                  }}
                  disabled={isAtCartLimit}
                  className="px-2 sm:px-2.5 h-full text-white font-extrabold text-sm sm:text-base hover:bg-rose-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Increase"
                  title={isAtCartLimit ? `Only ${stock} available` : ""}
                >
                  +
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleAdd}
                aria-label="Add to cart"
                className="px-3.5 sm:px-4 h-8 sm:h-9 rounded-lg bg-white border-[1.5px] border-rose-500 text-rose-500 text-xs font-extrabold uppercase tracking-wider shadow-sm hover:bg-rose-500 hover:text-white transition-colors"
              >
                ADD
              </button>
            )}
          </div>
        </div>

        {/* ──────── INFO ──────── */}
        <div className="px-2 pt-3 pb-2 flex-1 flex flex-col">
          {/* Price row: green pill + old price strikethrough */}
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-extrabold text-white bg-green-600 leading-none">
              ₹{product.price}
            </span>
            {product.oldPrice && (
              <span className="text-[11px] text-gray-400 line-through font-medium">
                ₹{product.oldPrice}
              </span>
            )}
            {/* Savings — moved inline with price to save a vertical row */}
            {savings > 0 && (
              <span className="text-[10px] text-green-700 font-bold ml-auto">
                ₹{savings} OFF
              </span>
            )}
          </div>

          {/* Dashed divider */}
          <div className="my-1 border-t border-dashed border-gray-300" />

          {/* Product name */}
          <h3 className="text-[12px] font-medium text-gray-900 leading-tight line-clamp-2 min-h-[2.2em]">
            {product.name}
          </h3>

          {/* Quantity */}
          {product.weight && (
            <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">
              1 pack ({product.weight})
            </p>
          )}

          {/* Spacer pushes tag + rating to the bottom */}
          <div className="flex-1" />

          {/* Tag + rating share one row to compress the footer */}
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            {otherTag && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold text-sky-700 bg-sky-100 leading-none">
                {otherTag}
              </span>
            )}
            {product.rating > 0 && (
              <div className="flex items-center gap-1 ml-auto">
                <svg className="w-3 h-3 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                  <path d="M17.5 2.5c0 7-5 12-12.5 12.5l-2 .5C3.5 8.5 9 3 17.5 2.5z" />
                </svg>
                <span className="text-[11px] font-bold text-green-700 leading-none">
                  {product.rating?.toFixed(1) || "4.5"}
                </span>
                <span className="text-[10px] text-gray-500 leading-none">
                  ({formatReviewCount(product)})
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
  );

  // Wrap with <Link> when we have a product id; fall back to a plain div otherwise.
  return product._id ? (
    <Link to={`/product/${product._id}`} className="block h-full">
      {cardBody}
    </Link>
  ) : (
    <div className="block h-full">{cardBody}</div>
  );
};

export default ProductCard;
