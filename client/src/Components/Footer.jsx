import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Logo from "./ui/Logo";

/**
 * Modern e-commerce footer.
 *
 * Layout — top to bottom:
 *   1. Trust strip       — Free Delivery / Easy Returns / Secure Pay / 100% Authentic
 *   2. Newsletter hero   — full-width gradient card, bigger CTA
 *   3. Main grid         — Brand+Social | Shop | Help | Contact
 *                          (accordion-collapsed on mobile to keep things tight)
 *   4. App + Payment row — store badges + accepted payment icons
 *   5. Bottom bar        — copyright + policy links
 *
 * Mobile pad-bottom: `pb-24 md:pb-10` so content isn't hidden behind
 * the floating MobileBottomNav (~60px).
 */

const TRUST_ITEMS = [
  {
    label: "Free Delivery",
    sub: "On orders over ₹499",
    color: "from-emerald-100 to-teal-100 text-emerald-700",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H3v11h2m13-7h4l3 5v2h-3" />
      </svg>
    ),
  },
  {
    label: "Easy Returns",
    sub: "7-day no-questions",
    color: "from-blue-100 to-cyan-100 text-blue-700",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
      </svg>
    ),
  },
  {
    label: "Secure Payments",
    sub: "100% protected",
    color: "from-violet-100 to-purple-100 text-violet-700",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  {
    label: "100% Authentic",
    sub: "Quality guaranteed",
    color: "from-amber-100 to-orange-100 text-amber-700",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M21 12c0 1.105-1.343 2.097-3.5 2.5-.402.075-.834.13-1.284.17C15.34 14.795 13.748 15 12 15c-1.748 0-3.34-.205-4.216-.33-.45-.04-.882-.095-1.284-.17C4.343 14.097 3 13.105 3 12V7c0-1.105 1.343-2.097 3.5-2.5C7.66 4.18 9.748 4 12 4s4.34.18 5.5.5C19.657 4.903 21 5.895 21 7v5z" />
      </svg>
    ),
  },
];

const SECTIONS = [
  {
    title: "Shop",
    links: [
      { label: "All Products", to: "/store" },
      { label: "Daily Essentials", to: "/store?category=Daily%20Essential" },
      { label: "Fresh Vegetables", to: "/store?category=Vegetables" },
      { label: "Spices & Masala", to: "/store?category=Spices" },
      { label: "Oil & Ghee", to: "/store?category=Oil" },
    ],
  },
  {
    title: "Help & Info",
    links: [
      { label: "About Us", to: "/about" },
      { label: "Contact Support", to: "/contact" },
      { label: "Track Your Order", to: "/account/orders" },
      { label: "Return Policy", to: "/contact" },
      { label: "FAQ", to: "/contact" },
    ],
  },
];

const PAYMENT_BADGES = [
  { label: "UPI",        bg: "bg-white", text: "text-violet-600" },
  { label: "VISA",       bg: "bg-white", text: "text-blue-700" },
  { label: "Mastercard", bg: "bg-white", text: "text-orange-500" },
  { label: "RuPay",      bg: "bg-white", text: "text-emerald-600" },
  { label: "COD",        bg: "bg-white", text: "text-gray-700" },
];

const Footer = () => {
  const [subscribeEmail, setSubscribeEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!subscribeEmail.trim() || subscribing) return;
    setSubscribing(true);
    try {
      await axios.post("/api/contact/subscribe", { email: subscribeEmail.trim() });
      setSubscribeEmail("");
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
    } catch {
      // silent fail
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="relative mt-16 sm:mt-20 pb-24 md:pb-10 overflow-hidden bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-[#0a0a1a] dark:via-[#0d0d1f] dark:to-[#0a0a1a] text-gray-800 dark:text-white border-t border-gray-200/80 dark:border-white/[0.06] transition-colors duration-300">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full bg-gradient-to-br from-yellow-200/30 via-orange-200/20 to-rose-200/20 blur-3xl dark:from-yellow-400/10 dark:via-orange-400/5 dark:to-rose-400/10" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 w-[380px] h-[380px] rounded-full bg-gradient-to-tr from-cyan-200/30 via-emerald-200/20 to-teal-200/20 blur-3xl dark:from-cyan-400/10 dark:via-emerald-400/5 dark:to-teal-400/10" />

      <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 pt-8 sm:pt-12">
        {/* ╭─ Trust strip ─╮ */}
        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mb-7 sm:mb-10">
          {TRUST_ITEMS.map((t) => (
            <li
              key={t.label}
              className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3.5 rounded-2xl bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm border border-gray-200/70 dark:border-white/[0.06] hover:shadow-sm transition-shadow"
            >
              <span className={`flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center`}>
                {t.icon}
              </span>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white leading-tight truncate">{t.label}</p>
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 leading-tight truncate">{t.sub}</p>
              </div>
            </li>
          ))}
        </ul>

        {/* ╭─ Newsletter hero ─╮ */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-yellow-400 via-orange-500 to-rose-500 p-5 sm:p-8 mb-8 sm:mb-12 shadow-lg">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/15 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />

          <div className="relative grid sm:grid-cols-2 gap-5 items-center">
            <div className="text-white">
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.18em] font-extrabold text-white/85">SPMart Newsletter</p>
              <h3 className="text-xl sm:text-2xl font-extrabold mt-1 leading-tight">
                Save ₹100 on your first order ✨
              </h3>
              <p className="text-xs sm:text-sm text-white/90 mt-1.5 leading-relaxed">
                Subscribe for exclusive deals, fresh arrivals & monthly grocery tips.
              </p>
            </div>

            <form onSubmit={handleSubscribe} className="w-full">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 bg-white rounded-2xl p-1.5 sm:pr-1.5 shadow-md focus-within:ring-2 focus-within:ring-white/70">
                <input
                  type="email"
                  required
                  value={subscribeEmail}
                  onChange={(e) => setSubscribeEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 min-w-0 bg-transparent px-3 sm:px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={subscribing}
                  className="px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-extrabold whitespace-nowrap hover:scale-[1.02] active:scale-95 transition-transform disabled:opacity-70"
                >
                  {subscribing ? "Joining…" : subscribed ? "✓ Joined" : "Subscribe"}
                </button>
              </div>
              <p className="text-[10px] sm:text-[11px] text-white/80 mt-2 pl-1">
                No spam, unsubscribe anytime.
              </p>
            </form>
          </div>
        </section>

        {/* ╭─ Main grid: Brand + columns ─╮
            On mobile each column collapses into a <details> accordion to save space. */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr_1fr_1.1fr] gap-6 lg:gap-10 mb-8">
          {/* Brand */}
          <div>
            <Logo size="md" />
            <p className="mt-3 text-gray-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              Your trusted neighbourhood grocery store — fresh vegetables, oils, spices and daily essentials, delivered to your doorstep with care.
            </p>

            {/* Social */}
            <div className="mt-4">
              <p className="text-[10px] uppercase tracking-wider font-extrabold text-gray-500 dark:text-gray-400 mb-2">Follow Us</p>
              <div className="flex gap-2">
                <SocialIcon href="#" label="Facebook" hover="hover:bg-[#1877f2]">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </SocialIcon>
                <SocialIcon href="#" label="Instagram" hover="hover:bg-gradient-to-tr hover:from-yellow-400 hover:via-pink-500 hover:to-purple-600">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </SocialIcon>
                <SocialIcon href="#" label="Twitter" hover="hover:bg-black">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </SocialIcon>
                <SocialIcon href="#" label="YouTube" hover="hover:bg-[#ff0000]">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </SocialIcon>
                <SocialIcon href="#" label="WhatsApp" hover="hover:bg-[#25d366]">
                  <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </SocialIcon>
              </div>
            </div>
          </div>

          {/* Shop / Help — collapsible on mobile */}
          {SECTIONS.map((s) => (
            <FooterColumn key={s.title} title={s.title} links={s.links} />
          ))}

          {/* Contact — always visible */}
          <FooterColumn
            title="Reach Us"
            customBody={
              <ul className="space-y-2.5 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2.5">
                  <span className="mt-0.5 w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <a href="mailto:support@spmart.com" className="break-all hover:text-gray-900 dark:hover:text-white transition-colors">support@spmart.com</a>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-0.5 w-7 h-7 rounded-lg bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </span>
                  <a href="tel:+911234567890" className="hover:text-gray-900 dark:hover:text-white transition-colors">+91 12345 67890</a>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-0.5 w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-300 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </span>
                  <span>SPMart HQ, Your City, India</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-0.5 w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-300 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  <span>Mon–Sun, 8am – 10pm</span>
                </li>
              </ul>
            }
          />
        </div>

        {/* ╭─ App + Payment row ─╮ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 py-5 sm:py-6 border-t border-gray-200/80 dark:border-white/[0.06]">
          {/* App downloads */}
          <div>
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-gray-500 dark:text-gray-400 mb-2">Get the App</p>
            <div className="flex gap-2.5 flex-wrap">
              <a href="#" className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-900 text-white hover:scale-[1.02] active:scale-95 transition-transform">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.731-4.49l2.561 1.482a1 1 0 010 1.732l-2.563 1.484-2.668-2.668 2.67-2.67zM5.864 2.658L16.802 8.99l-2.303 2.303L5.864 2.658z" />
                </svg>
                <div className="text-left leading-tight">
                  <p className="text-[9px] opacity-80">GET IT ON</p>
                  <p className="text-xs font-extrabold">Google Play</p>
                </div>
              </a>
              <a href="#" className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-900 text-white hover:scale-[1.02] active:scale-95 transition-transform">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                <div className="text-left leading-tight">
                  <p className="text-[9px] opacity-80">DOWNLOAD ON</p>
                  <p className="text-xs font-extrabold">App Store</p>
                </div>
              </a>
            </div>
          </div>

          {/* Payment methods */}
          <div className="sm:text-right">
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-gray-500 dark:text-gray-400 mb-2">We Accept</p>
            <div className="flex flex-wrap gap-1.5 sm:justify-end">
              {PAYMENT_BADGES.map((p) => (
                <span
                  key={p.label}
                  className={`inline-flex items-center px-2.5 py-1.5 rounded-md ${p.bg} dark:bg-white ${p.text} border border-gray-200 text-[10px] font-extrabold tracking-wide shadow-sm`}
                >
                  {p.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ╭─ Bottom bar ─╮ */}
        <div className="border-t border-gray-200/80 dark:border-white/[0.06] pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} <span className="font-extrabold text-gray-700 dark:text-gray-200">SPMart</span>. Crafted with{" "}
            <span className="text-rose-500" aria-hidden>♥</span> in India.
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
            <li><Link to="/contact" className="hover:text-gray-900 dark:hover:text-white transition-colors">Privacy</Link></li>
            <li className="opacity-40">·</li>
            <li><Link to="/contact" className="hover:text-gray-900 dark:hover:text-white transition-colors">Terms</Link></li>
            <li className="opacity-40">·</li>
            <li><Link to="/contact" className="hover:text-gray-900 dark:hover:text-white transition-colors">Refund Policy</Link></li>
            <li className="opacity-40">·</li>
            <li><Link to="/contact" className="hover:text-gray-900 dark:hover:text-white transition-colors">Shipping</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

/* ── A footer column that collapses into a tappable accordion on mobile,
      and renders normally on lg+ screens. Uses native <details>/<summary>
      so it works without extra JS, is keyboard-accessible, and animates
      cleanly via `group-open:` Tailwind variants. ─────────────────────── */
function FooterColumn({ title, links, customBody }) {
  return (
    <details className="group border-b border-gray-200/70 dark:border-white/[0.06] lg:border-0 py-2 lg:py-0" open>
      <summary className="flex items-center justify-between cursor-pointer lg:cursor-default list-none lg:pointer-events-none">
        <h3 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-white tracking-tight">
          {title}
        </h3>
        <svg
          className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-180 lg:hidden"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </summary>

      <div className="mt-3">
        {customBody ? (
          customBody
        ) : (
          <ul className="space-y-2 sm:space-y-2.5">
            {links.map((l) => (
              <li key={l.label}>
                <Link
                  to={l.to}
                  className="group/link inline-flex items-center text-gray-600 dark:text-gray-400 text-xs sm:text-sm hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                >
                  <span className="w-0 h-1 rounded-full bg-yellow-500 mr-0 group-hover/link:w-1.5 group-hover/link:mr-2 transition-all duration-200" />
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </details>
  );
}

/* ── Small social-icon button ───────────────────────────────────────── */
function SocialIcon({ href, label, hover, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={`w-9 h-9 rounded-xl bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-white hover:text-white ${hover} flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-md`}
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        {children}
      </svg>
    </a>
  );
}

export default Footer;
