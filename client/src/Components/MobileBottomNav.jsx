import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useUserAuth } from "../context/UserAuthContext";

/**
 * Zepto-style bottom navigation for mobile.
 *  - Fixed at the bottom of the viewport on screens < md
 *  - 4 evenly-spaced nav items
 *  - Floating "Cart" pill anchored above the nav (only when cart has items)
 *  - Hidden on md+ (desktop uses the top header instead)
 */

const NAV = [
  {
    key: "home",
    label: "Home",
    to: "/",
    match: (p) => p === "/",
    icon: (active) => (
      <svg className="w-[22px] h-[22px]" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={active ? 0 : 1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    key: "categories",
    label: "Categories",
    to: "/store",
    match: (p) => p.startsWith("/store") || p.startsWith("/product"),
    icon: () => (
      <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm0 10a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10-10a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zm0 10a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    key: "orders",
    label: "Buy Again",
    to: "/account",
    match: (p) => p.startsWith("/account") && p.includes("orders"),
    icon: () => (
      <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
  },
  {
    key: "account",
    label: "Account",
    to: "/account",
    match: (p) => p === "/account",
    icon: () => (
      <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

const MobileBottomNav = () => {
  const location = useLocation();
  const { getCartCount } = useCart();
  const { user } = useUserAuth();
  const cartCount = getCartCount();

  // Account / Buy Again routes go via the auth gate when not signed in
  const guardedHref = (to) =>
    user ? to : `/login?redirect=${encodeURIComponent(to)}`;

  return (
    <>
      {/* ── Floating Cart pill (only when cart has items) ── */}
      {cartCount > 0 && location.pathname !== "/cart" && (
        <Link
          to={user ? "/cart" : "/login?redirect=%2Fcart"}
          className="md:hidden fixed left-1/2 -translate-x-1/2 bottom-[72px] z-40 flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white pl-3 pr-4 py-2.5 rounded-full shadow-2xl shadow-rose-500/30 transition-colors"
          aria-label={`View cart with ${cartCount} item${cartCount !== 1 ? "s" : ""}`}
        >
          <span className="w-9 h-9 rounded-full bg-white text-rose-500 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.4}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
          </span>
          <div className="leading-tight pr-1">
            <p className="text-sm font-extrabold">Cart</p>
            <p className="text-[10px] font-semibold opacity-90">
              {cartCount} item{cartCount !== 1 ? "s" : ""}
            </p>
          </div>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}

      {/* ── Bottom nav bar ── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 shadow-[0_-4px_12px_-6px_rgba(0,0,0,0.08)]"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <ul className="grid grid-cols-4 h-[64px]">
          {NAV.map((item) => {
            const active = item.match(location.pathname);
            const requiresAuth = item.key === "orders" || item.key === "account";
            const href = requiresAuth ? guardedHref(item.to) : item.to;
            return (
              <li key={item.key}>
                <Link
                  to={href}
                  className={`h-full flex flex-col items-center justify-center gap-1 transition-colors ${
                    active
                      ? "text-rose-500"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {/* Consistent 28x28 icon slot — keeps active home badge aligned with siblings */}
                  <span className="w-7 h-7 flex items-center justify-center">
                    {item.key === "home" && active ? (
                      <span className="w-7 h-7 rounded-lg bg-rose-500 text-white flex items-center justify-center text-[13px] font-extrabold shadow-sm">
                        S
                      </span>
                    ) : (
                      item.icon(active)
                    )}
                  </span>
                  <span className={`text-[11px] leading-none ${active ? "font-extrabold" : "font-semibold"}`}>
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
};

export default MobileBottomNav;
