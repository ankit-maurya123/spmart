import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import MobileBottomNav from "./MobileBottomNav";

const Layout = () => {
  const [showTop, setShowTop] = useState(false);
  const location = useLocation();
  // Category strip only renders on the home page, so the spacer shrinks on every other route.
  const isHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 300);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen transition-colors duration-300">
      <Header />

      {/* Spacer to clear the fixed header.
          Mobile collapses the search row into a tappable icon, so only the location row + (optional)
          category strip on home contribute to header height. Desktop is unchanged. */}
      <div
        aria-hidden
        className={
          isHome
            ? "h-[114px] sm:h-[120px] md:h-[112px]"
            : "h-[52px] sm:h-[58px] md:h-[68px]"
        }
      />

      {/* Page content — pad bottom on mobile so it clears the bottom nav (60px nav) */}
      <div className="pb-20 md:pb-0">
        <Outlet />
      </div>

      <Footer />

      {/* ===== Scroll to top button ===== */}
      <button
        onClick={scrollToTop}
        aria-label="Scroll to top"
        className={`fixed bottom-24 right-4 md:bottom-6 md:right-6 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-full brand-pill-btn flex items-center justify-center transition-all duration-300 ${
          showTop
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <svg
          className="w-5 h-5 sm:w-6 sm:h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      </button>

      {/* ===== Mobile bottom nav (with floating cart pill) ===== */}
      <MobileBottomNav />
    </div>
  );
};

export default Layout;
