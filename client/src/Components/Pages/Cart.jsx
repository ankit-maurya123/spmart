import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useUserAuth } from "../../context/UserAuthContext";
import { resolveProductImage } from "../../lib/imageMap";

const Cart = () => {
  const { items, removeFromCart, updateQuantity, clearCart, getCartTotal, getCartCount } = useCart();
  const { user } = useUserAuth();
  const navigate = useNavigate();

  const subtotal = getCartTotal();
  const deliveryFee = subtotal >= 499 ? 0 : 40;
  const total = subtotal + deliveryFee;

  return (
    <div className="pt-20 md:pt-24 pb-12 min-h-screen">
      <div className="max-w-[1200px] mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400 mb-6 animate-fade-in-up">
          <Link to="/" className="hover:text-yellow-500 transition-colors">Home</Link>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-600 dark:text-gray-300">Cart</span>
        </div>

        {/* Page heading */}
        <div className="mb-6 sm:mb-8 animate-fade-in-up">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
            Shopping <span className="section-heading">Cart</span>
            {getCartCount() > 0 && (
              <span className="text-base sm:text-lg font-semibold text-gray-400 ml-3">
                ({getCartCount()} {getCartCount() === 1 ? "item" : "items"})
              </span>
            )}
          </h1>
        </div>

        {/* Empty cart state */}
        {items.length === 0 ? (
          <div className="text-center py-16 animate-fade-in-up">
            <div className="animate-float mb-6">
              <svg className="w-24 h-24 mx-auto text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base mb-6">
              Looks like you haven't added any items yet.
            </p>
            <Link
              to="/store"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold text-sm rounded-full hover:scale-105 hover:shadow-lg transition-all duration-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up">
            {/* Cart items */}
            <div className="lg:col-span-2 space-y-3">
              {items.map((item) => {
                const imageSrc = resolveProductImage(item.product);
                return (
                  <div
                    key={item.product._id}
                    className="bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm rounded-2xl border border-gray-200/60 dark:border-white/[0.06] p-3 sm:p-4 flex gap-3 sm:gap-4"
                  >
                    {/* Product image */}
                    <Link to={`/product/${item.product._id}`} className="flex-shrink-0">
                      <img
                        src={imageSrc}
                        alt={item.product.name}
                        className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl"
                      />
                    </Link>

                    {/* Product info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="inline-block px-2 py-0.5 bg-yellow-100 dark:bg-yellow-400/10 text-yellow-700 dark:text-yellow-400 text-[10px] font-bold rounded-md uppercase tracking-wide">
                            {item.product.category}
                          </span>
                          <Link to={`/product/${item.product._id}`}>
                            <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mt-1 line-clamp-2 hover:text-yellow-500 transition-colors">
                              {item.product.name}
                            </h3>
                          </Link>
                        </div>

                        {/* Remove button */}
                        <button
                          onClick={() => removeFromCart(item.product._id)}
                          className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-400/10 transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>

                      {/* Price + quantity */}
                      <div className="flex items-center justify-between mt-2 sm:mt-3 flex-wrap gap-2">
                        <span className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white">
                          ₹{item.product.price * item.quantity}
                        </span>

                        {/* Quantity controls */}
                        <div className="flex items-center border border-gray-200 dark:border-white/[0.1] rounded-lg overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            −
                          </button>
                          <span className="w-10 h-8 flex items-center justify-center text-xs font-bold text-gray-900 dark:text-white border-x border-gray-200 dark:border-white/[0.1]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors text-sm font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Cart actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={clearCart}
                  className="text-xs sm:text-sm font-semibold text-red-500 hover:text-red-600 transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear Cart
                </button>
                <Link
                  to="/store"
                  className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-yellow-500 transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Continue Shopping
                </Link>
              </div>
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <div className="bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm rounded-2xl border border-gray-200/60 dark:border-white/[0.06] p-5 sm:p-6 lg:sticky lg:top-24">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Order Summary
                </h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>Subtotal ({getCartCount()} items)</span>
                    <span className="font-semibold">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>Delivery Fee</span>
                    <span className="font-semibold">
                      {deliveryFee === 0 ? (
                        <span className="text-green-500">FREE</span>
                      ) : (
                        `₹${deliveryFee}`
                      )}
                    </span>
                  </div>
                  {deliveryFee > 0 && (
                    <p className="text-[10px] sm:text-xs text-gray-400">
                      Free delivery on orders above ₹499
                    </p>
                  )}
                  <div className="border-t border-gray-200 dark:border-white/[0.06] pt-3 flex justify-between">
                    <span className="font-bold text-gray-900 dark:text-white text-base">Total</span>
                    <span className="font-extrabold text-gray-900 dark:text-white text-lg">₹{total}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (user) {
                      navigate("/checkout");
                    } else {
                      navigate("/login", { state: { from: "/checkout" } });
                    }
                  }}
                  className="w-full mt-5 py-3.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold text-sm rounded-full hover:scale-[1.02] hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {user ? "Proceed to Checkout" : "Sign In to Checkout"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
