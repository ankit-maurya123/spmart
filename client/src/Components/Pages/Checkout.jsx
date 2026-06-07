import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../../context/CartContext";
import { useUserAuth } from "../../context/UserAuthContext";
import { useAddresses } from "../../hooks/useAddresses";
import { useWallet } from "../../hooks/useWallet";
import { resolveProductImage } from "../../lib/imageMap";
import usePageMeta from "../../hooks/usePageMeta";

/* ── Coupon catalog ─────────────────────────────────────────── */
const COUPONS = [
  { code: "FIRST50",   label: "50% off up to ₹100", min: 199, type: "pct",  value: 50, cap: 100 },
  { code: "FREESHIP",  label: "Free Delivery",       min: 299, type: "ship", value: 0 },
  { code: "SAVE40",    label: "₹40 off",             min: 399, type: "flat", value: 40 },
  { code: "SPMART20",  label: "₹50 off ₹999+",       min: 999, type: "flat", value: 50 },
  { code: "WELCOME50", label: "₹50 off first order", min: 0,   type: "flat", value: 50 },
];

const computeCoupon = (code, subtotal, deliveryFee) => {
  const c = COUPONS.find((x) => x.code === code.toUpperCase());
  if (!c) return { ok: false, err: "Invalid coupon code." };
  if (subtotal < c.min) return { ok: false, err: `Add ₹${c.min - subtotal} more to use ${c.code}.` };
  if (c.type === "pct") {
    const off = Math.min(Math.round((subtotal * c.value) / 100), c.cap || Infinity);
    return { ok: true, code: c.code, label: c.label, productOff: off, shipOff: 0 };
  }
  if (c.type === "ship") return { ok: true, code: c.code, label: c.label, productOff: 0, shipOff: deliveryFee };
  return { ok: true, code: c.code, label: c.label, productOff: c.value, shipOff: 0 };
};

/* ── UPI helpers ────────────────────────────────────────────── */
const UPI_VPA = "spmart@upi";
const UPI_NAME = "SPMart";
const buildUpiUrl = (amount, txnRef) =>
  `upi://pay?pa=${encodeURIComponent(UPI_VPA)}&pn=${encodeURIComponent(UPI_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent("Order " + txnRef)}`;
const qrSrc = (data, size = 200) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=8&data=${encodeURIComponent(data)}`;

/* ── Bits ───────────────────────────────────────────────────── */
function Field({ label, error, hint, required, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-bold text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
      </span>
      {children}
      {error ? (
        <span className="block text-[11px] font-bold text-rose-500 mt-1">{error}</span>
      ) : hint ? (
        <span className="block text-[10px] text-gray-400 mt-1">{hint}</span>
      ) : null}
    </label>
  );
}

function StepHeader({ n, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="w-8 h-8 rounded-full bg-violet-600 text-white text-sm font-extrabold flex items-center justify-center flex-shrink-0">
        {n}
      </span>
      <div className="min-w-0">
        <h2 className="text-base sm:text-lg font-extrabold text-gray-900 leading-tight">{title}</h2>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5 leading-tight">{subtitle}</p>}
      </div>
    </div>
  );
}

/* ── Main page ──────────────────────────────────────────────── */
export default function Checkout() {
  usePageMeta({
    title: "Checkout",
    description: "Complete your SPMart order — fast and secure checkout.",
    noIndex: true,
  });

  const { items, getCartTotal, getCartCount, clearCart, openCart } = useCart();
  const { user } = useUserAuth();
  const { data: savedAddresses = [] } = useAddresses();
  const { data: wallet } = useWallet();
  const navigate = useNavigate();

  const subtotal = getCartTotal();
  const baseDeliveryFee = subtotal >= 499 ? 0 : 40;

  /* ── Address ── */
  const [addressMode, setAddressMode] = useState(savedAddresses[0]?._id || "new");
  useEffect(() => {
    if (addressMode === "new") return;
    if (!savedAddresses.some((a) => a._id === addressMode)) {
      setAddressMode(savedAddresses[0]?._id || "new");
    }
  }, [savedAddresses, addressMode]);

  const selectedSaved = useMemo(
    () => savedAddresses.find((a) => a._id === addressMode) || null,
    [savedAddresses, addressMode]
  );

  /* ── Form ── */
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    notes: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [cardForm, setCardForm] = useState({ number: "", name: "", exp: "", cvv: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      name: prev.name || user?.name || "",
      email: prev.email || user?.email || "",
      phone: prev.phone || user?.phone || "",
    }));
  }, [user]);

  /* ── Coupon ── */
  const [couponInput, setCouponInput] = useState("");
  const [applied, setApplied] = useState(null);
  const [couponMsg, setCouponMsg] = useState("");

  useEffect(() => {
    if (!applied) return;
    const next = computeCoupon(applied.code, subtotal, baseDeliveryFee);
    if (!next.ok) { setApplied(null); setCouponMsg(next.err); }
    else setApplied(next);
  }, [subtotal, baseDeliveryFee]); // eslint-disable-line react-hooks/exhaustive-deps

  const applyCoupon = (codeRaw) => {
    const code = (codeRaw || couponInput).trim();
    if (!code) return;
    const res = computeCoupon(code, subtotal, baseDeliveryFee);
    if (!res.ok) { setApplied(null); setCouponMsg(res.err); return; }
    setApplied(res); setCouponInput(""); setCouponMsg("");
  };
  const removeCoupon = () => { setApplied(null); setCouponMsg(""); };

  /* ── Totals ── */
  const productOff = applied?.productOff || 0;
  const shipOff = applied?.shipOff || 0;
  const deliveryFee = Math.max(0, baseDeliveryFee - shipOff);
  const total = Math.max(0, subtotal - productOff + deliveryFee);
  const totalSavings = productOff + shipOff;

  const walletBalance = wallet?.balance || 0;
  const walletShort = paymentMethod === "wallet" ? Math.max(0, total - walletBalance) : 0;
  const walletInsufficient = paymentMethod === "wallet" && walletBalance < total;

  const txnRef = useMemo(
    () => "SPM" + Math.floor(100000 + Math.random() * 900000),
    []
  );

  /* ── Validation ── */
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.email.trim()) e.email = "Required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (!form.phone.trim()) e.phone = "Required";
    else if (!/^\d{10}$/.test(form.phone.replace(/\s/g, ""))) e.phone = "10-digit phone";

    if (addressMode === "new") {
      if (!form.address.trim()) e.address = "Required";
      if (!form.city.trim()) e.city = "Required";
      if (!form.state.trim()) e.state = "Required";
      if (!form.pincode.trim()) e.pincode = "Required";
      else if (!/^\d{6}$/.test(form.pincode)) e.pincode = "6-digit pincode";
    }

    if (paymentMethod === "card") {
      const digits = cardForm.number.replace(/\s/g, "");
      if (digits.length !== 16) e.card_number = "16-digit card number";
      if (!cardForm.name.trim()) e.card_name = "Required";
      if (!/^\d{2}\/\d{2}$/.test(cardForm.exp)) e.card_exp = "MM/YY";
      if (cardForm.cvv.length !== 3) e.card_cvv = "3 digits";
    }

    if (walletInsufficient) e.payment = "Insufficient wallet balance.";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
    setApiError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) {
      setErrors(v);
      const firstKey = Object.keys(v)[0];
      const el = document.querySelector(`[name="${firstKey}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.focus?.();
      return;
    }

    setSubmitting(true);
    setApiError("");

    const shippingAddress = addressMode === "new"
      ? {
          address: form.address.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
        }
      : {
          address: selectedSaved.address,
          city: selectedSaved.city,
          state: selectedSaved.state,
          pincode: selectedSaved.pincode,
        };

    try {
      const { data } = await axios.post(
        "/api/orders",
        {
          customer: {
            name: form.name.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
          },
          shippingAddress,
          items: items.map((i) => ({ productId: i.product._id, quantity: i.quantity })),
          paymentMethod,
          notes: [
            form.notes.trim(),
            applied ? `[Coupon: ${applied.code}, saved ₹${totalSavings}]` : "",
          ].filter(Boolean).join(" "),
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      clearCart();
      navigate(`/order-confirmation/${data.orderNumber}`);
    } catch (err) {
      setApiError(err?.response?.data?.error || "Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Guards ── */
  if (!user) return <Navigate to="/login" state={{ from: "/checkout" }} replace />;

  if (items.length === 0) {
    return (
      <div className="pt-6 sm:pt-10 pb-12 min-h-screen">
        <div className="max-w-md mx-auto px-4 text-center py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-violet-50 mb-5">
            <svg className="w-10 h-10 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-sm text-gray-500 mb-6">Add items to your cart before checking out.</p>
          <Link to="/store" className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-extrabold text-sm rounded-full transition-colors">
            Browse Store
          </Link>
        </div>
      </div>
    );
  }

  const inputCls = (field) =>
    `w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none transition-colors ${
      errors[field]
        ? "border-rose-300 focus:border-rose-400"
        : "border-gray-200 focus:border-violet-400"
    }`;

  /* ── Card helpers ── */
  const fmtCard = (v) => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const fmtExp = (v) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  /* ── Payment options ── */
  const PAYMENT_OPTIONS = [
    { val: "upi",    icon: "📱", label: "UPI",    sub: "GPay, PhonePe, Paytm" },
    { val: "card",   icon: "💳", label: "Card",   sub: "Debit / Credit Card" },
    { val: "wallet", icon: "💰", label: "Wallet", sub: `Balance ₹${walletBalance}` },
    { val: "cod",    icon: "💵", label: "Cash on Delivery", sub: "Pay when you receive" },
  ];

  return (
    <div className="pt-4 sm:pt-6 pb-28 lg:pb-12 min-h-screen">
      <div className="max-w-[1280px] mx-auto px-3 sm:px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-400 mb-4">
          <Link to="/" className="hover:text-violet-600 transition-colors">Home</Link>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          <button type="button" onClick={openCart} className="hover:text-violet-600 transition-colors">Cart</button>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          <span className="text-gray-700 font-semibold">Checkout</span>
        </nav>

        <div className="flex items-center justify-between gap-3 mb-5 sm:mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Checkout</h1>
            <p className="text-sm text-gray-500 mt-0.5">Just one step away from your order.</p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-full bg-green-50 border border-green-200 text-xs font-extrabold text-green-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.4}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Secure Checkout
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
          {/* ── LEFT: forms ── */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4 sm:space-y-5">

            {/* Contact */}
            <section className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
              <StepHeader n={1} title="Contact Information" subtitle="For order updates & invoice." />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Full Name" required error={errors.name}>
                  <input name="name" value={form.name} onChange={handleChange} placeholder="John Doe" className={inputCls("name")} />
                </Field>
                <Field label="Email" required error={errors.email}>
                  <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="john@example.com" className={inputCls("email")} />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Phone Number" required error={errors.phone}>
                    <input name="phone" type="tel" inputMode="tel" value={form.phone} onChange={handleChange} placeholder="9876543210" className={inputCls("phone")} />
                  </Field>
                </div>
              </div>
            </section>

            {/* Address */}
            <section className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-violet-600 text-white text-sm font-extrabold flex items-center justify-center flex-shrink-0">2</span>
                  <div>
                    <h2 className="text-base sm:text-lg font-extrabold text-gray-900 leading-tight">Shipping Address</h2>
                    <p className="text-xs text-gray-500 mt-0.5 leading-tight">
                      {savedAddresses.length > 0
                        ? "Pick a saved address or add a new one."
                        : "Where should we deliver?"}
                    </p>
                  </div>
                </div>
                <Link to="/account/addresses" className="text-xs font-extrabold text-violet-600 hover:underline whitespace-nowrap">
                  Manage →
                </Link>
              </div>

              {savedAddresses.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
                  {savedAddresses.map((a) => {
                    const active = addressMode === a._id;
                    return (
                      <button
                        key={a._id}
                        type="button"
                        onClick={() => setAddressMode(a._id)}
                        className={`text-left p-3 rounded-xl border-2 transition-colors ${
                          active ? "border-violet-400 bg-violet-50/40" : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-100 text-violet-700 text-[10px] font-extrabold uppercase">
                            {a.label || "Home"}
                          </span>
                          {a.isDefault && (
                            <span className="px-2 py-0.5 rounded-md bg-green-100 text-green-700 text-[10px] font-extrabold uppercase">Default</span>
                          )}
                        </div>
                        <p className="text-xs font-extrabold text-gray-900">{a.name}</p>
                        <p className="text-[11px] text-gray-600 leading-snug">
                          {a.address}, {a.city}, {a.state} – {a.pincode}
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5">{a.phone}</p>
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => setAddressMode("new")}
                    className={`text-left p-3 rounded-xl border-2 border-dashed transition-colors ${
                      addressMode === "new" ? "border-violet-400 bg-violet-50/40" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-violet-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.4}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      Use a new address
                    </span>
                    <p className="text-[11px] text-gray-500 mt-1">Enter a one-time delivery address.</p>
                  </button>
                </div>
              )}

              {addressMode === "new" && (
                <div className="space-y-3">
                  <Field label="Street Address" required error={errors.address}>
                    <input name="address" value={form.address} onChange={handleChange} placeholder="House no, street, area" className={inputCls("address")} />
                  </Field>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Field label="City" required error={errors.city}>
                      <input name="city" value={form.city} onChange={handleChange} placeholder="Mumbai" className={inputCls("city")} />
                    </Field>
                    <Field label="State" required error={errors.state}>
                      <input name="state" value={form.state} onChange={handleChange} placeholder="Maharashtra" className={inputCls("state")} />
                    </Field>
                    <Field label="Pincode" required error={errors.pincode}>
                      <input name="pincode" inputMode="numeric" maxLength={6} value={form.pincode} onChange={handleChange} placeholder="400001" className={inputCls("pincode")} />
                    </Field>
                  </div>
                </div>
              )}
            </section>

            {/* Payment */}
            <section className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
              <StepHeader n={3} title="Payment Method" subtitle="Pick how you'd like to pay." />

              {/* Method tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                {PAYMENT_OPTIONS.map((p) => {
                  const active = paymentMethod === p.val;
                  return (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() => setPaymentMethod(p.val)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        active ? "border-violet-400 bg-violet-50/40 shadow-sm" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span className="text-2xl block leading-none mb-1.5">{p.icon}</span>
                      <p className="text-xs font-extrabold text-gray-900 leading-tight">{p.label}</p>
                      <p className="text-[10px] text-gray-500 leading-tight truncate">{p.sub}</p>
                    </button>
                  );
                })}
              </div>

              {/* UPI: show QR */}
              {paymentMethod === "upi" && (
                <div className="rounded-2xl border-2 border-violet-200 bg-violet-50/40 p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-4 items-center">
                  <div className="flex justify-center sm:justify-start">
                    <div className="p-2.5 rounded-2xl bg-white border-2 border-violet-200">
                      <img
                        src={qrSrc(buildUpiUrl(total, txnRef), 180)}
                        alt="UPI QR Code"
                        className="w-[180px] h-[180px] block"
                        loading="lazy"
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-gray-900 mb-1">Scan with any UPI app</p>
                    <p className="text-[11px] text-gray-500 mb-3">
                      GPay · PhonePe · Paytm · BHIM · Amazon Pay
                    </p>
                    <dl className="space-y-1.5 text-xs">
                      <Row label="Amount" value={`₹${total}`} bold />
                      <Row label="UPI ID" value={UPI_VPA} mono />
                      <Row label="Merchant" value={UPI_NAME} />
                      <Row label="Order Ref" value={txnRef} mono />
                    </dl>
                    <a
                      href={buildUpiUrl(total, txnRef)}
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-violet-200 text-violet-700 text-xs font-extrabold sm:hidden"
                    >
                      Open UPI App
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.6}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  </div>
                </div>
              )}

              {/* Card: show form */}
              {paymentMethod === "card" && (
                <div className="rounded-2xl border-2 border-violet-200 bg-violet-50/40 p-4 sm:p-5">
                  {/* Visual card */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-black p-4 sm:p-5 text-white mb-4">
                    <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-violet-400/20 blur-2xl pointer-events-none" />
                    <div className="flex items-center justify-between mb-5">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white/70">
                        <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                        SPMart Card
                      </span>
                      <span className="text-xs font-extrabold tracking-widest">VISA</span>
                    </div>
                    <p className="text-sm sm:text-base font-mono tracking-wider mb-3 truncate">
                      {cardForm.number || "•••• •••• •••• ••••"}
                    </p>
                    <div className="flex items-end justify-between gap-2">
                      <div>
                        <p className="text-[9px] uppercase text-white/60 tracking-wider">Card Holder</p>
                        <p className="text-xs font-bold uppercase truncate">{cardForm.name || "Your Name"}</p>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase text-white/60 tracking-wider">Expires</p>
                        <p className="text-xs font-bold">{cardForm.exp || "MM/YY"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Field label="Card Number" required error={errors.card_number}>
                      <input
                        name="card_number"
                        value={cardForm.number}
                        onChange={(e) => { setCardForm({ ...cardForm, number: fmtCard(e.target.value) }); errors.card_number && setErrors({ ...errors, card_number: "" }); }}
                        placeholder="1234 5678 9012 3456"
                        inputMode="numeric"
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white font-mono tracking-wider focus:outline-none transition-colors ${errors.card_number ? "border-rose-300" : "border-gray-200 focus:border-violet-400"}`}
                      />
                    </Field>
                    <Field label="Name on Card" required error={errors.card_name}>
                      <input
                        name="card_name"
                        value={cardForm.name}
                        onChange={(e) => { setCardForm({ ...cardForm, name: e.target.value }); errors.card_name && setErrors({ ...errors, card_name: "" }); }}
                        placeholder="John Doe"
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white focus:outline-none transition-colors ${errors.card_name ? "border-rose-300" : "border-gray-200 focus:border-violet-400"}`}
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Expiry" required error={errors.card_exp}>
                        <input
                          name="card_exp"
                          value={cardForm.exp}
                          onChange={(e) => { setCardForm({ ...cardForm, exp: fmtExp(e.target.value) }); errors.card_exp && setErrors({ ...errors, card_exp: "" }); }}
                          placeholder="MM/YY"
                          inputMode="numeric"
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white font-mono focus:outline-none transition-colors ${errors.card_exp ? "border-rose-300" : "border-gray-200 focus:border-violet-400"}`}
                        />
                      </Field>
                      <Field label="CVV" required error={errors.card_cvv}>
                        <input
                          name="card_cvv"
                          value={cardForm.cvv}
                          onChange={(e) => { setCardForm({ ...cardForm, cvv: e.target.value.replace(/\D/g, "").slice(0, 3) }); errors.card_cvv && setErrors({ ...errors, card_cvv: "" }); }}
                          placeholder="123"
                          type="password"
                          inputMode="numeric"
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white font-mono focus:outline-none transition-colors ${errors.card_cvv ? "border-rose-300" : "border-gray-200 focus:border-violet-400"}`}
                        />
                      </Field>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500">
                      <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Encrypted with 256-bit SSL
                    </div>
                  </div>
                </div>
              )}

              {/* Wallet panel */}
              {paymentMethod === "wallet" && (
                <div className="rounded-2xl border-2 border-violet-200 bg-violet-50/40 p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-extrabold text-violet-700">SPMart Wallet</p>
                      <p className="text-2xl font-extrabold text-gray-900">₹{walletBalance.toLocaleString("en-IN")}</p>
                    </div>
                    <Link
                      to="/account/wallet"
                      className="px-3 py-2 rounded-full bg-violet-600 hover:bg-violet-700 text-white text-xs font-extrabold transition-colors"
                    >
                      + Add Money
                    </Link>
                  </div>
                  {walletInsufficient ? (
                    <div className="bg-rose-50 border border-rose-200 rounded-xl px-3 py-2.5">
                      <p className="text-xs font-extrabold text-rose-700">
                        Insufficient balance — short by ₹{walletShort}
                      </p>
                      <p className="text-[11px] text-rose-600 mt-0.5">
                        Add money or pick a different payment method.
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-green-700 font-bold flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      ₹{total} will be deducted on order placement
                    </p>
                  )}
                </div>
              )}

              {/* COD panel */}
              {paymentMethod === "cod" && (
                <div className="rounded-2xl border-2 border-violet-200 bg-violet-50/40 p-4 sm:p-5 flex items-start gap-3">
                  <span className="text-3xl flex-shrink-0">💵</span>
                  <div>
                    <p className="text-sm font-extrabold text-gray-900 mb-1">Cash on Delivery</p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Pay <span className="font-extrabold text-gray-900">₹{total}</span> in cash to your delivery partner. Please keep exact change ready.
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* Notes */}
            <section className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
              <Field label="Order Notes" hint="Special instructions for delivery — gate code, leave at door, etc.">
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="(Optional)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-400 transition-colors resize-none"
                />
              </Field>
            </section>
          </div>

          {/* ── RIGHT: order summary ── */}
          <aside className="lg:col-span-5 xl:col-span-4">
            <div className="lg:sticky lg:top-32 space-y-4">
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="text-base font-extrabold text-gray-900">Order Summary</h2>
                  <span className="text-[11px] font-bold text-gray-500">
                    {getCartCount()} item{getCartCount() !== 1 ? "s" : ""}
                  </span>
                </div>

                <ul className="px-5 sm:px-6 py-3 space-y-3 max-h-72 overflow-y-auto">
                  {items.map((it) => (
                    <li key={it.product._id} className="flex items-center gap-3">
                      <img
                        src={resolveProductImage(it.product)}
                        alt={it.product.name}
                        loading="lazy"
                        className="w-12 h-12 rounded-lg object-contain bg-gray-50 border border-gray-100 p-1 flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-gray-900 truncate">{it.product.name}</p>
                        <p className="text-[11px] text-gray-500">Qty {it.quantity} × ₹{it.product.price}</p>
                      </div>
                      <span className="text-xs font-extrabold text-gray-900 flex-shrink-0">
                        ₹{it.product.price * it.quantity}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Coupon */}
                <div className="px-5 sm:px-6 py-3 border-t border-dashed border-gray-200">
                  {applied ? (
                    <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-green-50 border border-green-200">
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold text-green-800 truncate">{applied.code} applied</p>
                        <p className="text-[11px] text-green-700">You saved ₹{totalSavings}</p>
                      </div>
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="text-[11px] font-bold text-rose-500 hover:text-rose-600"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2">
                        <input
                          value={couponInput}
                          onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponMsg(""); }}
                          placeholder="Enter coupon code"
                          className="flex-1 px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs uppercase font-bold text-gray-900 placeholder-gray-400 tracking-wider focus:outline-none focus:border-violet-400 transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => applyCoupon()}
                          disabled={!couponInput.trim()}
                          className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-extrabold disabled:opacity-50 transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                      {couponMsg && (
                        <p className="text-[11px] text-rose-500 font-bold mt-1.5">{couponMsg}</p>
                      )}
                      {!couponMsg && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {COUPONS.slice(0, 3).map((c) => (
                            <button
                              key={c.code}
                              type="button"
                              onClick={() => applyCoupon(c.code)}
                              className="text-[10px] font-extrabold text-violet-700 bg-violet-50 hover:bg-violet-100 border border-dashed border-violet-300 rounded-md px-1.5 py-0.5 transition-colors"
                            >
                              {c.code}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="px-5 sm:px-6 py-4 border-t border-gray-100 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-bold text-gray-900">₹{subtotal}</span>
                  </div>
                  {productOff > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Coupon discount</span>
                      <span className="font-bold">− ₹{productOff}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee</span>
                    <span className="font-bold">
                      {shipOff > 0 || baseDeliveryFee === 0 ? (
                        <>
                          {baseDeliveryFee > 0 && (
                            <span className="text-gray-400 line-through mr-1.5 font-medium">₹{baseDeliveryFee}</span>
                          )}
                          <span className="text-green-600">FREE</span>
                        </>
                      ) : (
                        <span className="text-gray-900">₹{deliveryFee}</span>
                      )}
                    </span>
                  </div>
                  <div className="border-t border-gray-100 pt-2 flex justify-between items-end">
                    <span className="font-extrabold text-gray-900 text-base">Total</span>
                    <div className="text-right">
                      <p className="text-lg sm:text-xl font-extrabold text-gray-900 leading-none">₹{total}</p>
                      {totalSavings > 0 && (
                        <p className="text-[11px] font-bold text-green-600 mt-0.5">You save ₹{totalSavings}</p>
                      )}
                    </div>
                  </div>
                </div>

                {apiError && (
                  <div className="mx-5 sm:mx-6 mb-3 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
                    {apiError}
                  </div>
                )}

                <div className="hidden lg:block px-5 sm:px-6 pb-5">
                  <button
                    type="submit"
                    disabled={submitting || walletInsufficient}
                    className="w-full py-3.5 bg-violet-600 hover:bg-violet-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-violet-500/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                      <>
                        {paymentMethod === "cod" ? "Place Order" : `Pay & Place Order`} — ₹{total}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.6}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-gray-400 text-center mt-2">
                    By placing your order, you agree to our Terms &amp; Conditions.
                  </p>
                </div>
              </div>

              {/* Trust strip */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { ic: "🚚", l: "Free Delivery", s: "On ₹499+" },
                  { ic: "🔒", l: "Secure", s: "256-bit SSL" },
                  { ic: "🔄", l: "Easy Returns", s: "7 days" },
                ].map((t) => (
                  <div key={t.l} className="bg-white border border-gray-200 rounded-xl p-2.5 text-center">
                    <p className="text-xl leading-none">{t.ic}</p>
                    <p className="text-[10px] font-extrabold text-gray-900 mt-1.5">{t.l}</p>
                    <p className="text-[9px] text-gray-500">{t.s}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Mobile sticky submit */}
          <div className="lg:hidden fixed bottom-16 left-0 right-0 z-40 bg-white border-t border-gray-200 px-3 py-2.5 shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3 max-w-[1280px] mx-auto">
              <div className="flex-shrink-0 min-w-0">
                <p className="text-[10px] text-gray-500 leading-none">Total</p>
                <p className="text-base font-extrabold text-gray-900 leading-tight">₹{total}</p>
                {totalSavings > 0 && (
                  <p className="text-[10px] font-bold text-green-600 leading-none">Saved ₹{totalSavings}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={submitting || walletInsufficient}
                className="flex-1 py-3 px-4 bg-violet-600 hover:bg-violet-700 text-white text-sm font-extrabold rounded-xl shadow-lg shadow-violet-500/20 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? "Placing…" : paymentMethod === "cod" ? "Place Order" : "Pay & Place"}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.6}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function Row({ label, value, mono = false, bold = false }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[11px] text-gray-500">{label}</span>
      <span className={`text-xs text-gray-900 ${mono ? "font-mono" : ""} ${bold ? "font-extrabold text-base" : "font-bold"}`}>
        {value}
      </span>
    </div>
  );
}
