import { useState, useMemo, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useUserAuth } from "../../context/UserAuthContext";
import { useAddresses } from "../../hooks/useAddresses";
import { useProducts } from "../../hooks/useProducts";
import { resolveProductImage } from "../../lib/imageMap";
import usePageMeta from "../../hooks/usePageMeta";
import ProductCard from "../ui/ProductCard";

const FREE_DELIVERY_THRESHOLD = 499;
const DELIVERY_FEE = 40;
const HANDLING_FEE = 10; // shown as struck-through "FREE" — mirrors quick-commerce billing UX

const TIP_OPTIONS = [20, 30, 50, 100];

const Cart = () => {
  usePageMeta({
    title: "Cart",
    description:
      "Review the items in your SPMart shopping cart and proceed to checkout for fast 10-minute delivery.",
    noIndex: true,
  });

  const navigate = useNavigate();
  const { items, removeFromCart, updateQuantity, clearCart, getCartCount } = useCart();
  const { user } = useUserAuth();
  const { data: addresses = [] } = useAddresses();
  const { data: products = [] } = useProducts();

  const [openInstr, setOpenInstr] = useState(null);
  const [tip, setTip] = useState(0);

  // Horizontal scroller for "You might also like"
  const recoRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateRecoButtons = () => {
    const el = recoRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    const el = recoRef.current;
    if (!el) return;
    updateRecoButtons();
    el.addEventListener("scroll", updateRecoButtons, { passive: true });
    window.addEventListener("resize", updateRecoButtons);
    return () => {
      el.removeEventListener("scroll", updateRecoButtons);
      window.removeEventListener("resize", updateRecoButtons);
    };
  }, []);

  const scrollRecos = (dir) => {
    const el = recoRef.current;
    if (!el) return;
    const card = el.querySelector("[data-reco]");
    const step = card ? card.getBoundingClientRect().width + 10 : 280;
    el.scrollBy({ left: dir * step * 2, behavior: "smooth" });
  };

  // ─── Pricing ──────────────────────────────────────────────────────
  const subtotal = items.reduce(
    (s, i) => s + (i.product.price || 0) * i.quantity,
    0
  );
  const mrpTotal = items.reduce(
    (s, i) => s + (i.product.oldPrice || i.product.price || 0) * i.quantity,
    0
  );
  const productSavings = Math.max(0, mrpTotal - subtotal);

  const isFreeDelivery = subtotal >= FREE_DELIVERY_THRESHOLD;
  const deliveryFee = items.length === 0 ? 0 : isFreeDelivery ? 0 : DELIVERY_FEE;
  const deliverySavings = isFreeDelivery ? DELIVERY_FEE : 0;
  const handlingSavings = items.length === 0 ? 0 : HANDLING_FEE;

  const totalSavings = productSavings + deliverySavings + handlingSavings;
  const moreForFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);

  const total = subtotal + deliveryFee + tip;
  const originalTotal = mrpTotal + DELIVERY_FEE + HANDLING_FEE + tip;

  // Fastest delivery time across cart items
  const fastestDelivery = useMemo(() => {
    const mins = items
      .map((i) => parseInt(i.product.deliveryTime || "10", 10))
      .filter((n) => Number.isFinite(n));
    return mins.length ? Math.min(...mins) : 10;
  }, [items]);

  // ─── Recommendations ──────────────────────────────────────────────
  const recos = useMemo(() => {
    const cartIds = new Set(items.map((i) => i.product._id));
    return (products || []).filter((p) => !cartIds.has(p._id)).slice(0, 14);
  }, [items, products]);

  // ─── CTA ──────────────────────────────────────────────────────────
  const hasAddress = (addresses?.length || 0) > 0;
  // Two labels: short for tight mobile widths, full for ≥sm.
  const ctaLabel = !user
    ? "Sign In to Continue"
    : hasAddress
    ? "Proceed to Checkout"
    : "Add Address to proceed";
  const ctaLabelShort = !user
    ? "Sign In"
    : hasAddress
    ? "Checkout"
    : "Add Address";

  const handleProceed = () => {
    if (!user) {
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }
    navigate("/checkout");
  };

  // ─── Empty cart ───────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="pt-4 sm:pt-6 pb-12 min-h-screen">
        <div className="max-w-[860px] mx-auto px-4">
          <div className="flex items-center gap-3 mb-6 animate-fade-in-up">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors"
              aria-label="Go back"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.4}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">Cart</h1>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center animate-fade-in-up">
            <div className="text-6xl mb-3 animate-float">🛒</div>
            <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 mb-1">
              Your cart is empty
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Looks like you haven&apos;t added any items yet.
            </p>
            <Link
              to="/store"
              className="inline-flex items-center gap-2 px-7 py-3 bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-sm rounded-full shadow-lg shadow-rose-500/30 transition-colors"
            >
              Start Shopping
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.4}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-3 sm:pt-4 pb-[140px] md:pb-[110px] min-h-screen">
      <div className="max-w-[860px] mx-auto px-3 sm:px-4 space-y-3 sm:space-y-4">
        {/* ─── Header bar ─────────────────────────────────────────── */}
        <div className="flex items-center gap-3 animate-fade-in-up">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors"
            aria-label="Go back"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2.4}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-lg sm:text-xl font-extrabold text-gray-900">
            Cart
            <span className="ml-2 text-sm font-bold text-gray-400">
              ({getCartCount()})
            </span>
          </h1>
        </div>

        {/* ─── Yay savings strip ──────────────────────────────────── */}
        {totalSavings > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 text-center text-sm text-green-800 animate-fade-in-up">
            Yay! You{" "}
            <span className="font-extrabold">saved ₹{totalSavings}</span> on
            this order
          </div>
        )}

        {/* ─── Coupons & offers ───────────────────────────────────── */}
        <button
          type="button"
          className="w-full flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-4 py-3.5 hover:border-rose-200 hover:bg-rose-50/30 transition-colors"
          onClick={() => navigate("/account/coupons")}
        >
          <span className="w-9 h-9 rounded-lg bg-green-600 text-white flex items-center justify-center flex-shrink-0">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2.4}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 14l6-6M9.5 8.5h.01M14.5 13.5h.01M5 7l7-3 7 3v5c0 4.5-3.1 8-7 9-3.9-1-7-4.5-7-9V7z"
              />
            </svg>
          </span>
          <span className="flex-1 text-left text-sm sm:text-base font-extrabold text-gray-900">
            View Coupons &amp; Offers
          </span>
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2.4}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        {/* ─── Items card ─────────────────────────────────────────── */}
        <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
            <span className="w-9 h-9 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
              </svg>
            </span>
            <p className="text-sm sm:text-base font-extrabold text-gray-900">
              Delivery in {fastestDelivery} mins
            </p>
          </div>

          <ul>
            {items.map((item, idx) => {
              const imageSrc = resolveProductImage(item.product);
              const lineTotal = item.product.price * item.quantity;
              const lineMrp =
                (item.product.oldPrice || item.product.price) * item.quantity;
              const hasMrpStrike = lineMrp > lineTotal;

              return (
                <li
                  key={item.product._id}
                  className={`flex gap-3 px-4 py-3.5 ${
                    idx > 0 ? "border-t border-gray-100" : ""
                  }`}
                >
                  <Link
                    to={`/product/${item.product._id}`}
                    className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center"
                  >
                    <img
                      src={imageSrc}
                      alt={item.product.name}
                      className="w-full h-full object-contain p-1"
                    />
                  </Link>

                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <Link to={`/product/${item.product._id}`}>
                      <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug hover:text-rose-500 transition-colors">
                        {item.product.name}
                      </h3>
                    </Link>
                    {item.product.weight && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        1 pack ({item.product.weight})
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end justify-center gap-1.5 flex-shrink-0">
                    <div className="flex items-center bg-rose-50 border border-rose-200 rounded-lg overflow-hidden h-8">
                      <button
                        onClick={() => {
                          if (item.quantity <= 1)
                            removeFromCart(item.product._id);
                          else
                            updateQuantity(
                              item.product._id,
                              item.quantity - 1
                            );
                        }}
                        aria-label="Decrease quantity"
                        className="w-8 h-full flex items-center justify-center text-rose-500 font-extrabold hover:bg-rose-100 transition-colors"
                      >
                        −
                      </button>
                      <span className="min-w-[28px] h-full flex items-center justify-center text-xs font-extrabold text-rose-600">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.product._id, item.quantity + 1)
                        }
                        aria-label="Increase quantity"
                        className="w-8 h-full flex items-center justify-center text-rose-500 font-extrabold hover:bg-rose-100 transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-right leading-tight">
                      <p className="text-sm font-extrabold text-gray-900">
                        ₹{lineTotal}
                      </p>
                      {hasMrpStrike && (
                        <p className="text-[11px] text-gray-400 line-through">
                          ₹{lineMrp}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* ─── Missed something ──────────────────────────────────── */}
        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-2xl px-4 py-3.5">
          <p className="text-sm sm:text-base font-extrabold text-gray-900">
            Missed something?
          </p>
          <Link
            to="/store"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gray-900 text-white text-xs sm:text-sm font-extrabold rounded-lg hover:bg-gray-800 transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add More Items
          </Link>
        </div>

        {/* ─── Bill summary ──────────────────────────────────────── */}
        <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
            <span className="w-9 h-9 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5h6m-6 4h6m-6 4h4M5 3v18l2-1 2 1 2-1 2 1 2-1 2 1V3l-2 1-2-1-2 1-2-1-2 1-2-1z"
                />
              </svg>
            </span>
            <h2 className="text-sm sm:text-base font-extrabold text-gray-900">
              Bill summary
            </h2>
          </div>

          <div className="px-4 py-3 space-y-2.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Item Total</span>
              <span className="font-bold text-gray-900">
                {productSavings > 0 && (
                  <span className="text-gray-400 line-through font-medium mr-1.5">
                    ₹{mrpTotal}
                  </span>
                )}
                ₹{subtotal}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-700">Handling Fee</span>
              <span className="font-bold">
                <span className="text-gray-400 line-through font-medium mr-1.5">
                  ₹{HANDLING_FEE}
                </span>
                <span className="text-green-600">FREE</span>
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Delivery Fee</span>
                <span className="font-bold">
                  {isFreeDelivery ? (
                    <>
                      <span className="text-gray-400 line-through font-medium mr-1.5">
                        ₹{DELIVERY_FEE}
                      </span>
                      <span className="text-green-600">FREE</span>
                    </>
                  ) : (
                    <span className="text-gray-900">₹{deliveryFee}</span>
                  )}
                </span>
              </div>
              {!isFreeDelivery && moreForFreeDelivery > 0 && (
                <Link
                  to="/store"
                  className="block text-xs font-semibold text-blue-500 hover:underline mt-1"
                >
                  Add products worth ₹{moreForFreeDelivery} to get free
                  delivery
                </Link>
              )}
            </div>

            {tip > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Delivery Partner Tip</span>
                <span className="font-bold text-gray-900">₹{tip}</span>
              </div>
            )}

            <div className="border-t border-dashed border-gray-200 pt-2.5 mt-1 flex items-center justify-between">
              <span className="text-base font-extrabold text-gray-900">
                To Pay
              </span>
              <span className="text-right">
                {originalTotal > total && (
                  <span className="text-gray-400 line-through font-medium mr-1.5 text-sm">
                    ₹{originalTotal}
                  </span>
                )}
                <span className="text-base font-extrabold text-gray-900">
                  ₹{total}
                </span>
              </span>
            </div>
          </div>
        </section>

        {/* ─── Savings on this order ─────────────────────────────── */}
        {totalSavings > 0 && (
          <section className="bg-green-50 border border-green-200 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <h3 className="text-sm sm:text-base font-extrabold text-gray-900">
                Savings on this order
              </h3>
              <span className="px-2.5 py-1 bg-green-600 text-white text-sm font-extrabold rounded-md">
                ₹{totalSavings}
              </span>
            </div>

            <div className="bg-white border-t border-green-100 divide-y divide-gray-100">
              {productSavings > 0 && (
                <div className="flex items-center gap-3 px-4 py-3">
                  <span className="w-8 h-8 rounded-md bg-green-100 text-green-700 flex items-center justify-center font-extrabold text-sm flex-shrink-0">
                    %
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-extrabold text-gray-900">
                      Discount on MRP
                    </p>
                    <p className="text-xs text-gray-500">
                      Including free gifts and deals
                    </p>
                  </div>
                  <span className="text-sm font-extrabold text-gray-900">
                    ₹{productSavings}
                  </span>
                </div>
              )}

              {handlingSavings > 0 && (
                <div className="flex items-center gap-3 px-4 py-3">
                  <span className="w-8 h-8 rounded-md bg-green-100 text-green-700 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 2L3 5v6c0 4 3 6 7 7 4-1 7-3 7-7V5l-7-3z" />
                    </svg>
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-extrabold text-gray-900">
                      Savings on Handling fee
                    </p>
                  </div>
                  <span className="text-sm font-extrabold text-gray-900">
                    ₹{handlingSavings}
                  </span>
                </div>
              )}

              {deliverySavings > 0 && (
                <div className="flex items-center gap-3 px-4 py-3">
                  <span className="w-8 h-8 rounded-md bg-green-100 text-green-700 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2.2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 7h11v10H3zM14 11h4l3 3v3h-7"
                      />
                      <circle cx="7" cy="18" r="1.6" />
                      <circle cx="17.5" cy="18" r="1.6" />
                    </svg>
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-extrabold text-gray-900">
                      Free Delivery
                    </p>
                  </div>
                  <span className="text-sm font-extrabold text-gray-900">
                    ₹{deliverySavings}
                  </span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ─── Delivery instructions / tip / safety ──────────────── */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          {[
            {
              id: "instr",
              label: "Delivery Instructions",
              sub: "Delivery partner will be notified",
              icon: (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2.2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8-1.6 0-3.1-.36-4.4-1L3 20l1-4c-.66-1.2-1-2.6-1-4 0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              ),
              body: (
                <textarea
                  rows={2}
                  placeholder='e.g. "Leave at the door", "Call when reached"…'
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-rose-300 focus:ring-1 focus:ring-rose-200 transition-colors resize-none"
                />
              ),
            },
            {
              id: "tip",
              label: "Delivery Partner Tip",
              sub: "This amount goes to your delivery partner",
              icon: (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2.2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V4m0 14v2"
                  />
                  <circle cx="12" cy="12" r="9" />
                </svg>
              ),
              body: (
                <div className="flex flex-wrap gap-2 mt-1">
                  {TIP_OPTIONS.map((t) => {
                    const active = tip === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTip(active ? 0 : t)}
                        className={`px-3.5 py-1.5 rounded-full text-sm font-extrabold border transition-colors ${
                          active
                            ? "bg-rose-500 text-white border-rose-500"
                            : "bg-white text-gray-700 border-gray-200 hover:border-rose-200 hover:text-rose-600"
                        }`}
                      >
                        ₹{t}
                      </button>
                    );
                  })}
                  {tip > 0 && (
                    <button
                      type="button"
                      onClick={() => setTip(0)}
                      className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-rose-500"
                    >
                      Remove tip
                    </button>
                  )}
                </div>
              ),
            },
            {
              id: "safety",
              label: "Delivery Partner's Safety",
              sub: "Learn more about how we ensure their safety",
              icon: (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2.2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 2l9 4v6c0 5-4 8-9 10-5-2-9-5-9-10V6l9-4z"
                  />
                </svg>
              ),
              body: (
                <p className="text-sm text-gray-600 mt-1">
                  We provide safety gear, accident insurance, and adequate
                  rest stops for our delivery partners — their well-being is
                  central to every order.
                </p>
              ),
            },
          ].map((row, i) => {
            const open = openInstr === row.id;
            return (
              <div key={row.id} className={i > 0 ? "border-t border-gray-100" : ""}>
                <button
                  type="button"
                  onClick={() => setOpenInstr(open ? null : row.id)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="w-9 h-9 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center flex-shrink-0">
                    {row.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base font-extrabold text-gray-900">
                      {row.label}
                    </p>
                    <p className="text-xs text-gray-500">{row.sub}</p>
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      open ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2.4}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {open && <div className="px-4 pb-4">{row.body}</div>}
              </div>
            );
          })}
        </div>

        {/* ─── You might also like ───────────────────────────────── */}
        {recos.length > 0 && (
          <section className="bg-white border border-gray-200 rounded-2xl px-3 sm:px-4 pt-4 pb-3 overflow-hidden">
            <div className="flex items-center justify-between mb-3 px-1 gap-3">
              <h3 className="text-base sm:text-lg font-extrabold text-gray-900">
                You might also like 💕
              </h3>
              <div className="hidden md:flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => scrollRecos(-1)}
                  aria-label="Scroll left"
                  disabled={!canPrev}
                  className={`w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 transition-all ${
                    canPrev
                      ? "hover:bg-rose-500 hover:text-white hover:border-rose-500"
                      : "opacity-40 cursor-not-allowed"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.6}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => scrollRecos(1)}
                  aria-label="Scroll right"
                  disabled={!canNext}
                  className={`w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 transition-all ${
                    canNext
                      ? "hover:bg-rose-500 hover:text-white hover:border-rose-500"
                      : "opacity-40 cursor-not-allowed"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.6}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
            <div
              ref={recoRef}
              className="no-scrollbar flex gap-2.5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-1 -mx-1 px-1"
            >
              {recos.map((p) => (
                <div
                  key={p._id}
                  data-reco
                  className="snap-start flex-shrink-0 w-[140px] sm:w-[160px]"
                >
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── Ordering a gift ───────────────────────────────────── */}
        <button
          type="button"
          className="w-full flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-4 py-3.5 hover:border-rose-200 hover:bg-rose-50/30 transition-colors"
        >
          <span className="w-11 h-11 rounded-xl bg-violet-50 text-2xl flex items-center justify-center flex-shrink-0">
            🎁
          </span>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm sm:text-base font-extrabold text-gray-900">
              Ordering a gift?
            </p>
            <p className="text-xs text-gray-500">
              Select items to pack in a gift bag!
            </p>
          </div>
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2.4}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        {/* ─── Clear cart ────────────────────────────────────────── */}
        <div className="flex justify-center pt-1">
          <button
            onClick={clearCart}
            className="text-xs sm:text-sm font-bold text-rose-500 hover:text-rose-600 inline-flex items-center gap-1.5"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Clear Cart
          </button>
        </div>
      </div>

      {/* ─── Sticky bottom CTA ──────────────────────────────────── */}
      <div className="fixed inset-x-0 bottom-[64px] md:bottom-0 z-40 bg-white/95 backdrop-blur border-t border-gray-200 px-2.5 sm:px-4 py-2 sm:py-2.5">
        <div className="max-w-[860px] mx-auto flex items-center gap-2 sm:gap-3">
          <div className="flex-shrink-0 min-w-0">
            <p className="text-[10px] sm:text-[11px] text-gray-500 leading-tight truncate max-w-[140px] sm:max-w-none">
              {hasAddress
                ? "Delivering to saved address"
                : "Add address to deliver"}
            </p>
            <p className="text-base sm:text-lg font-extrabold text-gray-900 leading-tight">
              ₹{total}
            </p>
            {totalSavings > 0 && (
              <p className="text-[10px] font-bold text-green-600 leading-tight">
                Saved ₹{totalSavings}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleProceed}
            className="flex-1 min-w-0 py-3 sm:py-3.5 px-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm sm:text-base font-extrabold rounded-2xl shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 hover:scale-[1.01] transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <span className="sm:hidden">{ctaLabelShort}</span>
            <span className="hidden sm:inline">{ctaLabel}</span>
            <svg
              className="w-4 h-4 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2.6}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
