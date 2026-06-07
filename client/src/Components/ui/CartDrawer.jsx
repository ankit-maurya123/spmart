import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../../context/CartContext";
import { useUserAuth } from "../../context/UserAuthContext";
import { useAddresses } from "../../hooks/useAddresses";
import { resolveProductImage } from "../../lib/imageMap";

const FREE_DELIVERY_THRESHOLD = 499;
const DELIVERY_FEE = 40;
const HANDLING_FEE = 10;

const TIP_OPTIONS = [20, 30, 50, 100];

const CartDrawer = () => {
  const navigate = useNavigate();
  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartCount,
    isCartOpen,
    closeCart,
  } = useCart();
  const { user } = useUserAuth();
  const { data: addresses = [] } = useAddresses();

  const [openInstr, setOpenInstr] = useState(null);
  const [tip, setTip] = useState(0);

  // Drawer step: 'cart' → 'checkout' → 'success'. Reset every time it closes.
  const [step, setStep] = useState("cart");

  // Checkout form state (only used when step === 'checkout')
  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    address: "", city: "", state: "", pincode: "",
    paymentMethod: "cod", notes: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [placedOrderNumber, setPlacedOrderNumber] = useState("");

  useEffect(() => {
    if (!isCartOpen) {
      // Reset drawer state when closed (small delay so the slide-out animation
      // doesn't show the cart view flashing back)
      const t = setTimeout(() => {
        setStep("cart");
        setApiError("");
        setFormErrors({});
        setSubmitting(false);
      }, 300);
      return () => clearTimeout(t);
    }
    const onKey = (e) => {
      if (e.key === "Escape") closeCart();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isCartOpen, closeCart]);

  // When opening checkout step, prefill from user + first saved address (if any).
  useEffect(() => {
    if (step !== "checkout") return;
    const firstAddr = addresses?.[0];
    setForm((prev) => ({
      ...prev,
      name: prev.name || user?.name || "",
      email: prev.email || user?.email || "",
      phone: prev.phone || user?.phone || firstAddr?.phone || "",
      address: prev.address || firstAddr?.address || "",
      city: prev.city || firstAddr?.city || "",
      state: prev.state || firstAddr?.state || "",
      pincode: prev.pincode || firstAddr?.pincode || "",
    }));
  }, [step, user, addresses]);

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

  const fastestDelivery = useMemo(() => {
    const mins = items
      .map((i) => parseInt(i.product.deliveryTime || "10", 10))
      .filter((n) => Number.isFinite(n));
    return mins.length ? Math.min(...mins) : 10;
  }, [items]);

  const hasAddress = (addresses?.length || 0) > 0;
  const ctaLabel = !user
    ? "Sign In to Continue"
    : hasAddress
    ? "Proceed to Checkout"
    : "Add Address to proceed";

  const handleProceed = () => {
    // Login is the only flow that still requires leaving the drawer.
    if (!user) {
      closeCart();
      navigate("/login", { state: { from: "/" } });
      return;
    }
    // Everything else stays inside the drawer.
    setStep("checkout");
  };

  // "Continue shopping" actions stay inside the user's current page — they just
  // close the drawer so the underlying page is visible again. No navigation.
  const handleContinueShopping = () => {
    closeCart();
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
    setApiError("");
  };

  const validateForm = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name required";
    if (!form.email.trim()) e.email = "Email required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (!form.phone.trim()) e.phone = "Phone required";
    else if (!/^\d{10}$/.test(form.phone.replace(/\s/g, ""))) e.phone = "10-digit phone";
    if (!form.address.trim()) e.address = "Address required";
    if (!form.city.trim()) e.city = "City required";
    if (!form.state.trim()) e.state = "State required";
    if (!form.pincode.trim()) e.pincode = "Pincode required";
    else if (!/^\d{6}$/.test(form.pincode)) e.pincode = "6-digit pincode";
    return e;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }

    setSubmitting(true);
    setApiError("");

    try {
      const orderData = {
        customer: {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
        },
        shippingAddress: {
          address: form.address.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
        },
        items: items.map((i) => ({
          productId: i.product._id,
          quantity: i.quantity,
        })),
        paymentMethod: form.paymentMethod,
        notes: form.notes.trim(),
      };
      const { data } = await axios.post("/api/orders", orderData, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setPlacedOrderNumber(data.orderNumber || "");
      clearCart();
      setStep("success");
    } catch (err) {
      setApiError(err?.response?.data?.error || "Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeCart}
        aria-hidden={!isCartOpen}
        className={`fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isCartOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer panel — slides in from right, ~30% on desktop, wider on small screens */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={`fixed top-0 bottom-0 right-0 z-[90] flex flex-col bg-gray-50
          w-full sm:w-[420px] md:w-[460px] lg:w-[30vw] lg:min-w-[420px] lg:max-w-[560px]
          shadow-2xl transition-transform duration-300 ease-out
          ${isCartOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Sticky header — title + back button vary by step */}
        <header className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
          {step === "checkout" ? (
            <button
              onClick={() => setStep("cart")}
              aria-label="Back to cart"
              className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.4}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          ) : (
            <button
              onClick={closeCart}
              aria-label="Close cart"
              className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.4}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <h2 className="text-base font-extrabold text-gray-900">
            {step === "checkout"
              ? "Checkout"
              : step === "success"
              ? "Order Placed"
              : "My Cart"}
            {step === "cart" && items.length > 0 && (
              <span className="ml-2 text-xs font-bold text-gray-400">
                ({getCartCount()})
              </span>
            )}
          </h2>
        </header>

        {/* Body — content depends on step */}
        {step === "success" ? (
          <SuccessView
            orderNumber={placedOrderNumber}
            onClose={closeCart}
          />
        ) : step === "checkout" ? (
          <CheckoutView
            form={form}
            errors={formErrors}
            apiError={apiError}
            submitting={submitting}
            onChange={handleFormChange}
            onSubmit={handlePlaceOrder}
            subtotal={subtotal}
            deliveryFee={deliveryFee}
            tip={tip}
            total={total}
            items={items}
            getCartCount={getCartCount}
          />
        ) : items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center px-6 py-10">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center w-full">
              <div className="text-5xl mb-3">🛒</div>
              <h3 className="text-base font-extrabold text-gray-900 mb-1">
                Your cart is empty
              </h3>
              <p className="text-xs text-gray-500 mb-5">
                Looks like you haven&apos;t added any items yet.
              </p>
              <button
                onClick={handleContinueShopping}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-sm rounded-full shadow-lg shadow-rose-500/30 transition-colors"
              >
                Start Shopping
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.4}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            {/* Yay savings strip */}
            {totalSavings > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-xl px-3 py-2 text-center text-xs text-green-800">
                Yay! You{" "}
                <span className="font-extrabold">saved ₹{totalSavings}</span> on
                this order
              </div>
            )}

            {/* Coupons — inline expand panel, no navigation */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenInstr(openInstr === "coupons" ? null : "coupons")}
                className="w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-50 transition-colors"
              >
                <span className="w-8 h-8 rounded-lg bg-green-600 text-white flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.4}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6M9.5 8.5h.01M14.5 13.5h.01M5 7l7-3 7 3v5c0 4.5-3.1 8-7 9-3.9-1-7-4.5-7-9V7z" />
                  </svg>
                </span>
                <span className="flex-1 text-left text-sm font-extrabold text-gray-900">
                  View Coupons &amp; Offers
                </span>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    openInstr === "coupons" ? "rotate-180" : ""
                  }`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.4}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openInstr === "coupons" && (
                <div className="px-3 pb-3 space-y-2 border-t border-gray-100 pt-3">
                  {[
                    { code: "FIRST50",   off: "50% off up to ₹100", desc: "First-time order discount", min: 199 },
                    { code: "FREESHIP",  off: "Free Delivery",      desc: "On orders above ₹299",     min: 299 },
                    { code: "SAVE40",    off: "₹40 off",            desc: "On orders above ₹399",     min: 399 },
                  ].map((c) => {
                    const eligible = subtotal >= c.min;
                    return (
                      <div
                        key={c.code}
                        className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 ${
                          eligible
                            ? "border-green-200 bg-green-50/40"
                            : "border-dashed border-gray-200 bg-gray-50"
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-extrabold text-gray-900">
                            {c.off}
                          </p>
                          <p className="text-[11px] text-gray-500 truncate">{c.desc}</p>
                        </div>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-1 rounded-md border-dashed border ${
                            eligible
                              ? "bg-white text-green-700 border-green-300"
                              : "bg-white text-gray-500 border-gray-300"
                          }`}
                        >
                          {c.code}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Items */}
            <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-3 py-2.5 border-b border-gray-100">
                <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
                  </svg>
                </span>
                <p className="text-sm font-extrabold text-gray-900">
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
                      className={`flex gap-2.5 px-3 py-3 ${
                        idx > 0 ? "border-t border-gray-100" : ""
                      }`}
                    >
                      <div className="flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center">
                        <img
                          src={imageSrc}
                          alt={item.product.name}
                          className="w-full h-full object-contain p-1"
                        />
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h3 className="text-xs font-bold text-gray-900 line-clamp-2 leading-snug">
                          {item.product.name}
                        </h3>
                        {item.product.weight && (
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            1 pack ({item.product.weight})
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col items-end justify-center gap-1 flex-shrink-0">
                        <div className="flex items-center bg-rose-50 border border-rose-200 rounded-lg overflow-hidden h-7">
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
                            className="w-7 h-full flex items-center justify-center text-rose-500 font-extrabold hover:bg-rose-100 transition-colors"
                          >
                            −
                          </button>
                          <span className="min-w-[22px] h-full flex items-center justify-center text-[11px] font-extrabold text-rose-600">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.product._id, item.quantity + 1)
                            }
                            aria-label="Increase quantity"
                            className="w-7 h-full flex items-center justify-center text-rose-500 font-extrabold hover:bg-rose-100 transition-colors"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-right leading-tight">
                          <p className="text-xs font-extrabold text-gray-900">
                            ₹{lineTotal}
                          </p>
                          {hasMrpStrike && (
                            <p className="text-[10px] text-gray-400 line-through">
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

            {/* Missed something */}
            <div className="flex items-center justify-between bg-white border border-gray-200 rounded-2xl px-3 py-3">
              <p className="text-sm font-extrabold text-gray-900">
                Missed something?
              </p>
              <button
                onClick={handleContinueShopping}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-xs font-extrabold rounded-lg hover:bg-gray-800 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add More
              </button>
            </div>

            {/* Bill summary */}
            <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-3 py-2.5 border-b border-gray-100">
                <span className="w-8 h-8 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5h6m-6 4h6m-6 4h4M5 3v18l2-1 2 1 2-1 2 1 2-1 2 1V3l-2 1-2-1-2 1-2-1-2 1-2-1z" />
                  </svg>
                </span>
                <h3 className="text-sm font-extrabold text-gray-900">
                  Bill summary
                </h3>
              </div>

              <div className="px-3 py-2.5 space-y-2 text-xs">
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
                    <button
                      onClick={handleContinueShopping}
                      className="block text-[11px] font-semibold text-blue-500 hover:underline mt-1 text-left"
                    >
                      Add ₹{moreForFreeDelivery} more for free delivery
                    </button>
                  )}
                </div>

                {tip > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Delivery Partner Tip</span>
                    <span className="font-bold text-gray-900">₹{tip}</span>
                  </div>
                )}

                <div className="border-t border-dashed border-gray-200 pt-2 mt-1 flex items-center justify-between">
                  <span className="text-sm font-extrabold text-gray-900">
                    To Pay
                  </span>
                  <span className="text-right">
                    {originalTotal > total && (
                      <span className="text-gray-400 line-through font-medium mr-1.5 text-xs">
                        ₹{originalTotal}
                      </span>
                    )}
                    <span className="text-sm font-extrabold text-gray-900">
                      ₹{total}
                    </span>
                  </span>
                </div>
              </div>
            </section>

            {/* Delivery instructions / tip / safety */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              {[
                {
                  id: "instr",
                  label: "Delivery Instructions",
                  sub: "Delivery partner will be notified",
                  icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8-1.6 0-3.1-.36-4.4-1L3 20l1-4c-.66-1.2-1-2.6-1-4 0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  ),
                  body: (
                    <textarea
                      rows={2}
                      placeholder='e.g. "Leave at the door"…'
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-rose-300 focus:ring-1 focus:ring-rose-200 transition-colors resize-none"
                    />
                  ),
                },
                {
                  id: "tip",
                  label: "Delivery Partner Tip",
                  sub: "Goes 100% to your delivery partner",
                  icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V4m0 14v2" />
                      <circle cx="12" cy="12" r="9" />
                    </svg>
                  ),
                  body: (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {TIP_OPTIONS.map((t) => {
                        const active = tip === t;
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setTip(active ? 0 : t)}
                            className={`px-3 py-1 rounded-full text-xs font-extrabold border transition-colors ${
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
                          className="px-2 py-1 text-[11px] font-bold text-gray-500 hover:text-rose-500"
                        >
                          Remove tip
                        </button>
                      )}
                    </div>
                  ),
                },
              ].map((row, i) => {
                const open = openInstr === row.id;
                return (
                  <div key={row.id} className={i > 0 ? "border-t border-gray-100" : ""}>
                    <button
                      type="button"
                      onClick={() => setOpenInstr(open ? null : row.id)}
                      className="w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="w-8 h-8 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center flex-shrink-0">
                        {row.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-extrabold text-gray-900">
                          {row.label}
                        </p>
                        <p className="text-[11px] text-gray-500">{row.sub}</p>
                      </div>
                      <svg
                        className={`w-4 h-4 text-gray-400 transition-transform ${
                          open ? "rotate-180" : ""
                        }`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.4}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {open && <div className="px-3 pb-3">{row.body}</div>}
                  </div>
                );
              })}
            </div>

            {/* Clear cart */}
            <div className="flex justify-center pt-1 pb-2">
              <button
                onClick={clearCart}
                className="text-xs font-bold text-rose-500 hover:text-rose-600 inline-flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear Cart
              </button>
            </div>
          </div>
        )}

        {/* Sticky bottom CTA — only on cart step */}
        {step === "cart" && items.length > 0 && (
          <div className="bg-white border-t border-gray-200 px-3 py-2.5">
            <div className="flex items-center gap-2.5">
              <div className="flex-shrink-0 min-w-0">
                <p className="text-[10px] text-gray-500 leading-tight truncate">
                  {hasAddress
                    ? "Delivering to saved address"
                    : "Add address to deliver"}
                </p>
                <p className="text-base font-extrabold text-gray-900 leading-tight">
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
                className="flex-1 min-w-0 py-3 px-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm font-extrabold rounded-2xl shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 hover:scale-[1.01] transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <span>{ctaLabel}</span>
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.6}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

// ──────────────────────────────────────────────────────────────────────────
// Step: Checkout — full order form inside the drawer.
// ──────────────────────────────────────────────────────────────────────────
const CheckoutView = ({
  form,
  errors,
  apiError,
  submitting,
  onChange,
  onSubmit,
  subtotal,
  deliveryFee,
  tip,
  total,
  items,
  getCartCount,
}) => {
  const inputCls = (field) =>
    `w-full px-3 py-2 rounded-xl bg-white border text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 transition-colors ${
      errors[field]
        ? "border-red-300 focus:border-red-400 focus:ring-red-200"
        : "border-gray-200 focus:border-rose-300 focus:ring-rose-200"
    }`;

  return (
    <form onSubmit={onSubmit} className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {/* Order summary */}
        <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100">
            <span className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5h6m-6 4h6m-6 4h4M5 3v18l2-1 2 1 2-1 2 1 2-1 2 1V3l-2 1-2-1-2 1-2-1-2 1-2-1z" />
              </svg>
            </span>
            <h3 className="text-sm font-extrabold text-gray-900">
              Order Summary ({getCartCount()} items)
            </h3>
          </div>
          <ul className="px-3 py-2 space-y-2 max-h-40 overflow-y-auto">
            {items.map((i) => (
              <li key={i.product._id} className="flex items-center gap-2.5">
                <img
                  src={resolveProductImage(i.product)}
                  alt={i.product.name}
                  className="w-9 h-9 rounded-lg object-cover border border-gray-100 flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-gray-900 truncate">{i.product.name}</p>
                  <p className="text-[11px] text-gray-500">Qty {i.quantity} × ₹{i.product.price}</p>
                </div>
                <span className="text-xs font-extrabold text-gray-900">₹{i.product.price * i.quantity}</span>
              </li>
            ))}
          </ul>
          <div className="px-3 pb-3 pt-2 border-t border-dashed border-gray-200 text-xs space-y-1.5">
            <div className="flex justify-between text-gray-700"><span>Subtotal</span><span className="font-bold">₹{subtotal}</span></div>
            <div className="flex justify-between text-gray-700"><span>Delivery</span><span className="font-bold">{deliveryFee === 0 ? <span className="text-green-600">FREE</span> : `₹${deliveryFee}`}</span></div>
            {tip > 0 && <div className="flex justify-between text-gray-700"><span>Tip</span><span className="font-bold">₹{tip}</span></div>}
            <div className="flex justify-between border-t border-dashed border-gray-200 pt-1.5"><span className="font-extrabold text-gray-900">To Pay</span><span className="font-extrabold text-gray-900">₹{total}</span></div>
          </div>
        </section>

        {/* Contact */}
        <section className="bg-white border border-gray-200 rounded-2xl p-3 space-y-2.5">
          <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">Contact</h3>
          <div>
            <input name="name" value={form.name} onChange={onChange} placeholder="Full name" className={inputCls("name")} />
            {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
          </div>
          <div>
            <input name="email" value={form.email} onChange={onChange} placeholder="Email" className={inputCls("email")} />
            {errors.email && <p className="text-[11px] text-red-500 mt-1">{errors.email}</p>}
          </div>
          <div>
            <input name="phone" value={form.phone} onChange={onChange} placeholder="10-digit phone" className={inputCls("phone")} />
            {errors.phone && <p className="text-[11px] text-red-500 mt-1">{errors.phone}</p>}
          </div>
        </section>

        {/* Shipping */}
        <section className="bg-white border border-gray-200 rounded-2xl p-3 space-y-2.5">
          <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">Shipping Address</h3>
          <div>
            <input name="address" value={form.address} onChange={onChange} placeholder="Street address" className={inputCls("address")} />
            {errors.address && <p className="text-[11px] text-red-500 mt-1">{errors.address}</p>}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <input name="city" value={form.city} onChange={onChange} placeholder="City" className={inputCls("city")} />
              {errors.city && <p className="text-[11px] text-red-500 mt-1">{errors.city}</p>}
            </div>
            <div>
              <input name="state" value={form.state} onChange={onChange} placeholder="State" className={inputCls("state")} />
              {errors.state && <p className="text-[11px] text-red-500 mt-1">{errors.state}</p>}
            </div>
          </div>
          <div>
            <input name="pincode" value={form.pincode} onChange={onChange} placeholder="6-digit pincode" className={inputCls("pincode")} />
            {errors.pincode && <p className="text-[11px] text-red-500 mt-1">{errors.pincode}</p>}
          </div>
        </section>

        {/* Payment */}
        <section className="bg-white border border-gray-200 rounded-2xl p-3 space-y-2">
          <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider mb-1">Payment</h3>
          {[
            { val: "cod",    label: "Cash on Delivery", sub: "Pay when you receive" },
            { val: "online", label: "Online Payment",   sub: "UPI, Card, Net Banking" },
          ].map((p) => {
            const active = form.paymentMethod === p.val;
            return (
              <label
                key={p.val}
                className={`flex items-center gap-3 p-2.5 rounded-xl border-2 cursor-pointer transition-colors ${
                  active ? "border-rose-400 bg-rose-50/40" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio" name="paymentMethod" value={p.val}
                  checked={active} onChange={onChange}
                  className="sr-only"
                />
                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${active ? "border-rose-500" : "border-gray-300"}`}>
                  {active && <span className="w-2 h-2 rounded-full bg-rose-500" />}
                </span>
                <span className="min-w-0">
                  <p className="text-xs font-bold text-gray-900">{p.label}</p>
                  <p className="text-[10px] text-gray-500">{p.sub}</p>
                </span>
              </label>
            );
          })}
        </section>

        {/* Notes */}
        <section className="bg-white border border-gray-200 rounded-2xl p-3">
          <textarea
            name="notes" value={form.notes} onChange={onChange}
            rows={2}
            placeholder="Order notes (optional)"
            className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-rose-300 focus:ring-1 focus:ring-rose-200 transition-colors resize-none"
          />
        </section>

        {apiError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-xs text-red-700">
            {apiError}
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="bg-white border-t border-gray-200 px-3 py-2.5">
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm font-extrabold rounded-2xl shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:hover:scale-100"
        >
          {submitting ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Placing Order…
            </>
          ) : (
            <>Place Order — ₹{total}</>
          )}
        </button>
        <p className="text-[10px] text-gray-400 text-center mt-2">
          By placing your order, you agree to our Terms &amp; Conditions.
        </p>
      </div>
    </form>
  );
};

// ──────────────────────────────────────────────────────────────────────────
// Step: Success — order confirmation inside the drawer.
// ──────────────────────────────────────────────────────────────────────────
const SuccessView = ({ orderNumber, onClose }) => (
  <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center">
    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
      <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </div>
    <h3 className="text-lg font-extrabold text-gray-900 mb-1">Order Placed!</h3>
    <p className="text-sm text-gray-600 mb-1">Your order is confirmed.</p>
    {orderNumber && (
      <p className="text-xs text-gray-500 mb-6">
        Order #<span className="font-bold text-gray-700">{orderNumber}</span>
      </p>
    )}
    <button
      type="button"
      onClick={onClose}
      className="inline-flex items-center gap-2 px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-sm rounded-full shadow-lg shadow-rose-500/30 transition-colors"
    >
      Continue Shopping
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.4}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  </div>
);

export default CartDrawer;
