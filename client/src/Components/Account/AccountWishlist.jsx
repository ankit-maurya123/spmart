import React from "react";
import { Link } from "react-router-dom";
import { useWishlist, useToggleWishlist } from "../../hooks/useWishlist";
import { useCart } from "../../context/CartContext";
import { resolveProductImage } from "../../lib/imageMap";
import usePageMeta from "../../hooks/usePageMeta";

const AccountWishlist = () => {
  usePageMeta({ title: "My Wishlist", noIndex: true });
  const { data: items = [], isLoading } = useWishlist();
  const toggle = useToggleWishlist();
  const { addToCart } = useCart();

  const moveToCart = (product) => {
    addToCart(product, 1);
    toggle.mutate(product._id);
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">My Wishlist</h1>
        <p className="text-sm text-gray-500">
          {isLoading
            ? "Loading…"
            : `${items.length} saved product${items.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
          <p className="text-5xl mb-3">❤️</p>
          <h3 className="text-base font-extrabold text-gray-900">Your wishlist is empty</h3>
          <p className="text-sm text-gray-500 mt-1 mb-5">Tap the heart on any product to save it for later.</p>
          <Link
            to="/store"
            className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-extrabold text-sm rounded-full"
          >
            Explore Products
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {items.map((p) => (
            <li
              key={p._id}
              className="bg-white border border-gray-200 hover:border-violet-300 hover:shadow-md rounded-2xl overflow-hidden transition-all flex flex-col"
            >
              <Link to={`/product/${p._id}`} className="block aspect-square bg-white relative">
                <img
                  src={resolveProductImage(p)}
                  alt={p.name}
                  className="w-full h-full object-contain p-3"
                />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggle.mutate(p._id);
                  }}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-rose-500 hover:bg-rose-50"
                  aria-label="Remove from wishlist"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </button>
              </Link>
              <div className="p-3 flex-1 flex flex-col">
                <Link
                  to={`/product/${p._id}`}
                  className="text-xs font-bold text-gray-900 line-clamp-2 hover:text-violet-600 transition-colors"
                >
                  {p.name}
                </Link>
                {p.weight && <p className="text-[10px] text-gray-500 mt-0.5">{p.weight}</p>}
                <div className="flex items-baseline gap-1.5 mt-2">
                  <span className="inline-flex px-1.5 py-0.5 rounded text-xs font-extrabold text-white bg-green-600">
                    ₹{p.price}
                  </span>
                  {p.oldPrice && (
                    <span className="text-[11px] text-gray-400 line-through">₹{p.oldPrice}</span>
                  )}
                </div>
                <button
                  onClick={() => moveToCart(p)}
                  className="mt-3 w-full py-2 rounded-lg border-[1.5px] border-rose-500 bg-white text-rose-500 text-xs font-extrabold uppercase hover:bg-rose-500 hover:text-white transition-colors"
                >
                  Move to Cart
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AccountWishlist;
