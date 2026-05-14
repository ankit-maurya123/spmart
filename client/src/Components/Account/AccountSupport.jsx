import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useUserAuth } from "../../context/UserAuthContext";
import axios from "axios";
import usePageMeta from "../../hooks/usePageMeta";

const FAQS = [
  {
    q: "How do I track my order?",
    a: "Open My Orders, tap any order to see live status (Pending → Confirmed → Shipped → Delivered).",
  },
  {
    q: "Can I cancel my order after placing it?",
    a: "Yes, while the order is still in Pending or Confirmed status. Reach out to support or contact the rider once the order is shipped.",
  },
  {
    q: "What is the return policy?",
    a: "Sealed grocery items are eligible for replacement within 7 days if there's a quality issue. Email support@spmart.com with order ID and photos.",
  },
  {
    q: "How do I apply a coupon?",
    a: "Coupons can be applied on the cart screen during checkout. Find available coupons under Account → Coupons.",
  },
  {
    q: "What payment methods are supported?",
    a: "We accept Cash on Delivery and online payments (UPI, cards, netbanking). Wallet integration is coming soon.",
  },
  {
    q: "How do I change my delivery address?",
    a: "Manage saved addresses under Account → Addresses. Set a default one for faster checkout.",
  },
];

const TOPICS = [
  { key: "order",    label: "Order issue" },
  { key: "delivery", label: "Delivery problem" },
  { key: "payment",  label: "Payment / refund" },
  { key: "account",  label: "Account & login" },
  { key: "other",    label: "Something else" },
];

const AccountSupport = () => {
  usePageMeta({ title: "Help & Support", noIndex: true });
  const { user } = useUserAuth();
  const [openFaq, setOpenFaq] = useState(0);

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    topic: "order",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await axios.post("/api/contact", {
        name: form.name,
        email: form.email,
        message: `[${form.topic}] ${form.message}`,
      });
      setSuccess(true);
      setForm({ ...form, message: "" });
      setTimeout(() => setSuccess(false), 4000);
    } catch (e) {
      setError(e?.response?.data?.error || "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">Help & Support</h1>
        <p className="text-sm text-gray-500">We're here to help — pick a question or send us a message.</p>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: "📦", label: "Order Help",   to: "/account/orders" },
          { icon: "📞", label: "Call Us",      href: "tel:+919999000000" },
          { icon: "✉️", label: "Email Us",     href: "mailto:support@spmart.com" },
          { icon: "💬", label: "Live Chat",    href: "#chat" },
        ].map((q) => {
          const Comp = q.to ? Link : "a";
          return (
            <Comp
              key={q.label}
              {...(q.to ? { to: q.to } : { href: q.href })}
              className="flex flex-col items-center gap-1 p-3 bg-white border border-gray-200 hover:border-violet-300 hover:shadow-sm rounded-2xl transition-all text-center"
            >
              <span className="text-2xl">{q.icon}</span>
              <span className="text-xs font-bold text-gray-800">{q.label}</span>
            </Comp>
          );
        })}
      </div>

      {/* FAQ */}
      <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="p-5 sm:p-6 pb-3 border-b border-gray-100">
          <h2 className="text-base font-extrabold text-gray-900">Frequently Asked Questions</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {FAQS.map((f, i) => {
            const open = openFaq === i;
            return (
              <div key={i}>
                <button
                  onClick={() => setOpenFaq(open ? -1 : i)}
                  aria-expanded={open}
                  aria-controls={`support-faq-${i}`}
                  className="w-full flex items-center justify-between gap-3 p-4 sm:p-5 text-left hover:bg-gray-50"
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
                  <div id={`support-faq-${i}`} role="region" className="px-4 sm:px-5 pb-4 sm:pb-5 -mt-1">
                    <p className="text-sm text-gray-600 leading-relaxed">{f.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Contact form */}
      <section className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-7">
        <h2 className="text-base font-extrabold text-gray-900 mb-1">Send us a message</h2>
        <p className="text-xs text-gray-500 mb-4">We typically respond within a few hours.</p>

        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Your Name"  required value={form.name}  onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="Your Email" required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>

          <div>
            <span className="block text-xs font-bold text-gray-700 mb-1.5">Topic</span>
            <div className="flex flex-wrap gap-2">
              {TOPICS.map((t) => {
                const active = form.topic === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setForm({ ...form, topic: t.key })}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
                      active
                        ? "bg-violet-600 text-white"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="block">
            <span className="block text-xs font-bold text-gray-700 mb-1.5">Message<span className="text-rose-500 ml-0.5">*</span></span>
            <textarea
              required
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Describe your issue…"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-violet-400 resize-none"
            />
          </label>

          {error && <p className="text-sm font-bold text-rose-500">{error}</p>}
          {success && (
            <p className="text-sm font-bold text-green-600 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Thanks — we'll be in touch shortly!
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white text-sm font-extrabold rounded-xl disabled:opacity-60"
          >
            {submitting ? "Sending…" : "Send Message"}
          </button>
        </form>
      </section>
    </div>
  );
};

const Input = ({ label, required, ...rest }) => (
  <label className="block">
    <span className="block text-xs font-bold text-gray-700 mb-1.5">
      {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
    </span>
    <input
      {...rest}
      required={required}
      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-violet-400"
    />
  </label>
);

export default AccountSupport;
