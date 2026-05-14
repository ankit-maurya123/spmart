import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useUserAuth } from "../../context/UserAuthContext";
import { resolveProductImage } from "../../lib/imageMap";
import axios from "axios";
import usePageMeta from "../../hooks/usePageMeta";

export default function Checkout() {
  usePageMeta({ title: "Checkout", description: "Complete your SPMart order — fast and secure checkout.", noIndex: true });
  const { items, getCartTotal, getCartCount, clearCart } = useCart();
  const { user } = useUserAuth();
  const navigate = useNavigate();

  const subtotal = getCartTotal();
  const deliveryFee = subtotal >= 499 ? 0 : 40;
  const total = subtotal + deliveryFee;

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    paymentMethod: "cod",
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  // Redirect to login if not authenticated (after all hooks)
  if (!user) {
    return <Navigate to="/login" state={{ from: "/checkout" }} replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    setApiError("");
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (!form.phone.trim()) e.phone = "Phone is required";
    else if (!/^\d{10}$/.test(form.phone.replace(/\s/g, ""))) e.phone = "Enter 10-digit phone number";
    if (!form.address.trim()) e.address = "Address is required";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.state.trim()) e.state = "State is required";
    if (!form.pincode.trim()) e.pincode = "Pincode is required";
    else if (!/^\d{6}$/.test(form.pincode)) e.pincode = "Enter 6-digit pincode";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

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
      clearCart();
      navigate(`/order-confirmation/${data.orderNumber}`);
    } catch (err) {
      setApiError(err?.response?.data?.error || "Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Redirect if cart empty
  if (items.length === 0) {
    return (
      <div className="pt-20 md:pt-24 pb-12 min-h-screen">
        <div className="max-w-[1200px] mx-auto px-4 text-center py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-white/[0.06] mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6 text-sm">Add items to your cart before checking out.</p>
          <Link to="/store" className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold text-sm rounded-full hover:scale-105 transition-all">
            Browse Store
          </Link>
        </div>
      </div>
    );
  }

  const inputClass = (field) =>
    `w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.06] border text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 transition-all ${
      errors[field]
        ? "border-red-300 dark:border-red-500/40 focus:border-red-400 focus:ring-red-400/20"
        : "border-gray-200 dark:border-white/[0.1] focus:border-yellow-400 focus:ring-yellow-400/20"
    }`;

  return (
    <div className="pt-20 md:pt-24 pb-12 min-h-screen">
      <div className="max-w-[1200px] mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400 mb-6">
          <Link to="/" className="hover:text-yellow-500 transition-colors">Home</Link>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <Link to="/cart" className="hover:text-yellow-500 transition-colors">Cart</Link>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="text-gray-600 dark:text-gray-300">Checkout</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-6">
          Checkout
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Forms */}
            <div className="lg:col-span-2 space-y-5">
              {/* Contact Info */}
              <div className="bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm rounded-2xl border border-gray-200/60 dark:border-white/[0.06] p-5 sm:p-6">
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Contact Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Full Name *</label>
                    <input name="name" value={form.name} onChange={handleChange} placeholder="John Doe" className={inputClass("name")} />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Email *</label>
                    <input name="email" value={form.email} onChange={handleChange} placeholder="john@example.com" className={inputClass("email")} />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Phone Number *</label>
                    <input name="phone" value={form.phone} onChange={handleChange} placeholder="9876543210" className={inputClass("phone")} />
                    {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm rounded-2xl border border-gray-200/60 dark:border-white/[0.06] p-5 sm:p-6">
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Shipping Address
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Street Address *</label>
                    <input name="address" value={form.address} onChange={handleChange} placeholder="123, Main Street, Apartment 4B" className={inputClass("address")} />
                    {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">City *</label>
                      <input name="city" value={form.city} onChange={handleChange} placeholder="Mumbai" className={inputClass("city")} />
                      {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">State *</label>
                      <input name="state" value={form.state} onChange={handleChange} placeholder="Maharashtra" className={inputClass("state")} />
                      {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Pincode *</label>
                      <input name="pincode" value={form.pincode} onChange={handleChange} placeholder="400001" className={inputClass("pincode")} />
                      {errors.pincode && <p className="text-xs text-red-500 mt-1">{errors.pincode}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm rounded-2xl border border-gray-200/60 dark:border-white/[0.06] p-5 sm:p-6">
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Payment Method
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      form.paymentMethod === "cod"
                        ? "border-yellow-400 bg-yellow-50/50 dark:bg-yellow-400/5"
                        : "border-gray-200 dark:border-white/[0.1] hover:border-gray-300"
                    }`}
                  >
                    <input type="radio" name="paymentMethod" value="cod" checked={form.paymentMethod === "cod"} onChange={handleChange} className="sr-only" />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${form.paymentMethod === "cod" ? "border-yellow-500" : "border-gray-300"}`}>
                      {form.paymentMethod === "cod" && <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Cash on Delivery</p>
                      <p className="text-xs text-gray-500">Pay when you receive</p>
                    </div>
                  </label>
                  <label
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      form.paymentMethod === "online"
                        ? "border-yellow-400 bg-yellow-50/50 dark:bg-yellow-400/5"
                        : "border-gray-200 dark:border-white/[0.1] hover:border-gray-300"
                    }`}
                  >
                    <input type="radio" name="paymentMethod" value="online" checked={form.paymentMethod === "online"} onChange={handleChange} className="sr-only" />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${form.paymentMethod === "online" ? "border-yellow-500" : "border-gray-300"}`}>
                      {form.paymentMethod === "online" && <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Online Payment</p>
                      <p className="text-xs text-gray-500">UPI, Card, Net Banking</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Order Notes */}
              <div className="bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm rounded-2xl border border-gray-200/60 dark:border-white/[0.06] p-5 sm:p-6">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Order Notes (Optional)</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Any special instructions for delivery..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.1] text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/20 transition-all resize-none"
                />
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm rounded-2xl border border-gray-200/60 dark:border-white/[0.06] p-5 sm:p-6 lg:sticky lg:top-24">
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">
                  Order Summary ({getCartCount()} items)
                </h2>

                {/* Items list */}
                <div className="space-y-3 max-h-64 overflow-y-auto mb-4 pr-1">
                  {items.map((item) => (
                    <div key={item.product._id} className="flex items-center gap-3">
                      <img
                        src={resolveProductImage(item.product)}
                        alt={item.product.name}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-gray-200 dark:border-white/10"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.product.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity} x ₹{item.product.price}</p>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white flex-shrink-0">
                        ₹{item.product.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 dark:border-white/[0.06] pt-3 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>Subtotal</span>
                    <span className="font-semibold">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>Delivery Fee</span>
                    <span className="font-semibold">
                      {deliveryFee === 0 ? <span className="text-green-500">FREE</span> : `₹${deliveryFee}`}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-white/[0.06] pt-2 flex justify-between">
                    <span className="font-bold text-gray-900 dark:text-white text-base">Total</span>
                    <span className="font-extrabold text-gray-900 dark:text-white text-lg">₹{total}</span>
                  </div>
                </div>

                {apiError && (
                  <div className="mt-3 text-sm text-red-500 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-3 py-2">
                    {apiError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-5 py-3.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold text-sm rounded-full hover:scale-[1.02] hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:hover:scale-100"
                >
                  {submitting ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Placing Order...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Place Order — ₹{total}
                    </>
                  )}
                </button>

                <p className="text-[10px] text-gray-400 text-center mt-3">
                  By placing your order, you agree to our Terms & Conditions.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
