import React from "react";
import { Link } from "react-router-dom";
import StarRating from "./StarRating";
import { resolveProductImage } from "../../lib/imageMap";
import { useCart } from "../../context/CartContext";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;
  const imageSrc = resolveProductImage(product);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product._id) addToCart(product);
  };

  const Wrapper = product._id
    ? ({ children }) => (
        <Link to={`/product/${product._id}`} className="block">
          {children}
        </Link>
      )
    : React.Fragment;

  return (
    <Wrapper>
    <div className="group relative bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm rounded-2xl border border-gray-200/60 dark:border-white/[0.06] overflow-hidden shadow-sm hover:shadow-xl hover:shadow-amber-500/5 dark:hover:shadow-2xl dark:hover:shadow-yellow-500/5 hover:-translate-y-1.5 transition-all duration-300">
      {/* Image Area */}
      <div className="relative overflow-hidden bg-gray-100 dark:bg-gray-700/30">
        {/* Badges */}
        {discount > 0 && (
          <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1.5">
            <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] sm:text-xs font-bold rounded-md shadow-md">
              {discount}% OFF
            </span>
          </div>
        )}
        <button className="absolute top-2.5 right-2.5 z-10 w-7 h-7 sm:w-8 sm:h-8 bg-white/90 dark:bg-gray-800/90 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/30 hover:scale-110 transition-all duration-300">
          <svg
            className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 group-hover:text-red-500 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
        <img
          className="w-full h-36 sm:h-44 md:h-52 object-cover group-hover:scale-110 transition-transform duration-500"
          src={imageSrc}
          alt={product.name}
        />
        {/* Quick Add overlay */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button onClick={handleAddToCart} className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-500 dark:to-blue-500 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 hover:from-cyan-700 hover:to-blue-700 transition-all">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Add to Cart
          </button>
        </div>
      </div>
      {/* Info */}
      <div className="p-3 sm:p-4">
        <span className="inline-block px-2 py-0.5 bg-yellow-100 dark:bg-yellow-400/10 text-yellow-700 dark:text-yellow-400 text-[10px] sm:text-xs font-bold rounded-md uppercase tracking-wide">
          {product.category}
        </span>
        <h3 className="text-xs sm:text-sm font-bold text-gray-800 dark:text-white mt-1.5 leading-snug line-clamp-2">
          {product.name}
        </h3>
        <StarRating rating={product.rating} />
        <div className="flex items-end gap-2 mt-2">
          <span className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white">
            ₹{product.price}
          </span>
          {product.oldPrice && (
            <>
              <span className="text-[10px] sm:text-xs text-gray-400 line-through pb-0.5">
                ₹{product.oldPrice}
              </span>
              <span className="text-[10px] sm:text-xs text-green-600 dark:text-green-400 font-semibold ml-auto">
                Save ₹{product.oldPrice - product.price}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
    </Wrapper>
  );
};

export default ProductCard;
