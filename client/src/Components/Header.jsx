import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useUserAuth } from "../context/UserAuthContext";
import Logo from "./ui/Logo";

// Mobile drawer nav (kept from previous design)
const NAV_ITEMS = [
  { name: "Home", to: "/" },
  { name: "Store", to: "/store" },
  { name: "About", to: "/about" },
  { name: "Contact", to: "/contact" },
];

// Zepto-style top category strip
const CATEGORY_STRIP = [
  { name: "All",         to: "/store",                    icon: "🛒" },
  { name: "Cafe",        to: "/store?category=Beverages", icon: "☕" },
  { name: "Home",        to: "/store?category=Essentials",icon: "🏠" },
  { name: "Fresh",       to: "/store?category=Vegetables",icon: "🥬" },
  { name: "Snacks",      to: "/store?category=Snacks",    icon: "🍿" },
  { name: "Dairy",       to: "/store?category=Dairy",     icon: "🥛" },
  { name: "Spices",      to: "/store?category=Spices",    icon: "🌶️" },
  { name: "Oils",        to: "/store?category=Oil",       icon: "🫒" },
  { name: "Beauty",      to: "/store",                    icon: "💄" },
  { name: "Fashion",     to: "/store",                    icon: "👕" },
];

const LOCATIONS = [
  "Mumbai, Maharashtra",
  "Delhi NCR",
  "Bengaluru, Karnataka",
  "Hyderabad, Telangana",
  "Chennai, Tamil Nadu",
  "Pune, Maharashtra",
];

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(LOCATIONS[0]);
  const [scrolled, setScrolled] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const { getCartCount } = useCart();
  const { user, logout } = useUserAuth();
  const cartCount = getCartCount();
  const userMenuRef = useRef(null);
  const locationRef = useRef(null);
  const mobileSearchInputRef = useRef(null);
  const location = useLocation();

  // Auto-focus the mobile search input when opened
  useEffect(() => {
    if (mobileSearchOpen) mobileSearchInputRef.current?.focus();
  }, [mobileSearchOpen]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
      if (locationRef.current && !locationRef.current.contains(e.target)) {
        setLocationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close panels on route change
  useEffect(() => {
    setIsOpen(false);
    setUserMenuOpen(false);
    setLocationOpen(false);
    setMobileSearchOpen(false);
  }, [location.pathname]);

  // Detect scroll for elevation
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchValue.trim()) return;
    window.location.href = `/store?search=${encodeURIComponent(searchValue.trim())}`;
  };

  return (
    <>
      {/* ===== Zepto-style Header ===== */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 bg-white dark:bg-[#0d1117] border-b transition-all duration-300 ${
          scrolled
            ? "border-gray-200 dark:border-white/10 shadow-sm"
            : "border-transparent"
        }`}
      >
        {/* ── MOBILE-ONLY top section (lavender, location + profile + search) ── */}
        <div className="md:hidden relative bg-violet-100">
          {/* Row 1: Location + Profile */}
          <div className="flex items-center justify-between gap-2 px-3 sm:px-4 pt-2.5 sm:pt-3 pb-2">
            <button
              onClick={() => setLocationOpen((v) => !v)}
              className="flex items-center gap-1 text-left min-w-0 flex-1"
              aria-label="Choose location"
            >
              <div className="min-w-0 max-w-full">
                <p className="text-[13px] sm:text-sm font-extrabold text-gray-900 flex items-center gap-1 leading-tight">
                  <span className="truncate">Select Location</span>
                  <svg
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 transition-transform ${locationOpen ? "rotate-180" : ""}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.6}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </p>
                <p className="text-[10px] sm:text-[11px] text-gray-700 truncate leading-tight mt-0.5">
                  {selectedLocation}
                </p>
              </div>
            </button>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Search icon — opens inline search */}
              <button
                type="button"
                onClick={() => setMobileSearchOpen((v) => !v)}
                aria-label={mobileSearchOpen ? "Close search" : "Open search"}
                aria-expanded={mobileSearchOpen}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-gray-300 flex items-center justify-center text-gray-800 shadow-sm hover:bg-gray-50 transition-colors"
              >
                {mobileSearchOpen ? (
                  <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </button>

              <Link
                to={user ? "/account" : "/login?redirect=%2Faccount"}
                aria-label={user ? "Account" : "Sign in"}
              >
                {user ? (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-xs sm:text-sm font-extrabold shadow-md">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                ) : (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-gray-300 flex items-center justify-center text-gray-800 shadow-sm">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </Link>
            </div>
          </div>

          {/* Row 2: Search — inline, collapsible. Visible only when toggled open. */}
          {mobileSearchOpen && (
            <div className="px-3 sm:px-4 pb-2.5 sm:pb-3 animate-fade-in-down">
              <form
                onSubmit={onSearchSubmit}
                className="flex items-center gap-2 h-10 sm:h-11 px-3 sm:px-3.5 rounded-xl bg-white shadow-sm"
              >
                <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={mobileSearchInputRef}
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder='Search "kurkure"'
                  className="flex-1 min-w-0 bg-transparent text-[13px] sm:text-sm text-gray-800 placeholder-gray-500 focus:outline-none"
                />
                {searchValue && (
                  <button
                    type="button"
                    onClick={() => setSearchValue("")}
                    aria-label="Clear search"
                    className="w-6 h-6 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center flex-shrink-0"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.4}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </form>
            </div>
          )}

          {/* Mobile location dropdown */}
          {locationOpen && (
            <div className="absolute left-3 right-3 top-full mt-1 rounded-2xl bg-white border border-gray-200 shadow-xl overflow-hidden z-50">
              <div className="p-3 border-b border-gray-100">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Choose Delivery Location
                </p>
              </div>
              <ul className="max-h-72 overflow-y-auto">
                {LOCATIONS.map((loc) => (
                  <li key={loc}>
                    <button
                      onClick={() => { setSelectedLocation(loc); setLocationOpen(false); }}
                      className={`w-full text-left px-4 py-3 text-sm flex items-center gap-2.5 ${
                        loc === selectedLocation
                          ? "bg-violet-50 text-violet-700 font-semibold"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="truncate">{loc}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* ── DESKTOP top row (logo + location + search + actions) ── */}
        <div className="hidden md:block max-w-[1280px] mx-auto px-3 sm:px-4">
          <div className="flex items-center gap-2 sm:gap-4 md:gap-6 py-2.5 sm:py-3">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <Logo size="md" />
            </Link>

            {/* Location selector — desktop */}
            <div className="hidden md:block relative" ref={locationRef}>
              <button
                onClick={() => setLocationOpen((v) => !v)}
                className="flex items-center gap-1.5 px-1 py-2 text-sm text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <span className="font-semibold">Select Location</span>
                <svg
                  className={`w-4 h-4 transition-transform ${locationOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <p className="text-[11px] text-gray-500 dark:text-white/50 -mt-1 truncate max-w-[180px]">
                {selectedLocation}
              </p>

              {locationOpen && (
                <div className="absolute left-0 top-full mt-1 w-72 rounded-2xl bg-white dark:bg-[#11141d] border border-gray-200 dark:border-white/10 shadow-xl overflow-hidden z-50">
                  <div className="p-3 border-b border-gray-100 dark:border-white/10">
                    <p className="text-xs font-bold text-gray-500 dark:text-white/50 uppercase tracking-wider">
                      Choose Delivery Location
                    </p>
                  </div>
                  <ul className="max-h-72 overflow-y-auto">
                    {LOCATIONS.map((loc) => (
                      <li key={loc}>
                        <button
                          onClick={() => {
                            setSelectedLocation(loc);
                            setLocationOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2.5 transition-colors ${
                            loc === selectedLocation
                              ? "bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 font-semibold"
                              : "text-gray-700 dark:text-white/80 hover:bg-gray-50 dark:hover:bg-white/5"
                          }`}
                        >
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="truncate">{loc}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Search bar (visible on all sizes; compact on mobile) */}
            <form
              onSubmit={onSearchSubmit}
              className="flex-1 min-w-0 flex items-center gap-2 h-10 sm:h-11 md:h-12 px-3 sm:px-4 rounded-lg sm:rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus-within:border-violet-400 dark:focus-within:border-violet-400 transition-colors"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 dark:text-white/50 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder='Search for "kurkure"'
                className="flex-1 min-w-0 bg-transparent text-xs sm:text-sm text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-white/40 focus:outline-none"
              />
            </form>

            {/* Right cluster */}
            <div className="flex items-center gap-1 sm:gap-2 md:gap-4 flex-shrink-0">
              {/* Login / User */}
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                    aria-label="Account menu"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-xs font-extrabold">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <span className="text-[10px] font-semibold text-gray-700 dark:text-white/80 hidden sm:block">
                      {user.name?.split(" ")[0] || "Account"}
                    </span>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white dark:bg-[#11141d] border border-gray-200 dark:border-white/10 shadow-xl overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-white/10 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-extrabold flex-shrink-0">
                          {user.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
                          <p className="text-[11px] text-gray-500 dark:text-white/50 truncate">{user.email}</p>
                        </div>
                      </div>
                      <div className="p-1.5">
                        <Link to="/account" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-gray-700 dark:text-white/80 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          My Account
                        </Link>
                        <Link to="/account" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-gray-700 dark:text-white/80 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                          </svg>
                          My Orders
                        </Link>
                        <button
                          onClick={() => { logout(); setUserMenuOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                  aria-label="Login"
                >
                  <svg className="w-6 h-6 text-gray-700 dark:text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-[10px] font-semibold text-gray-700 dark:text-white/80 hidden sm:block">
                    Login
                  </span>
                </Link>
              )}

              {/* Cart — redirects to login if not authed, then back to /cart */}
              <Link
                to={user ? "/cart" : "/login?redirect=%2Fcart"}
                className="relative flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                aria-label="Cart"
              >
                <div className="relative">
                  <svg className="w-6 h-6 text-gray-700 dark:text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                  </svg>
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 bg-violet-600 text-white rounded-full text-[10px] font-extrabold flex items-center justify-center border-2 border-white dark:border-[#0d1117]">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-semibold text-gray-700 dark:text-white/80 hidden sm:block">
                  Cart
                </span>
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsOpen(true)}
                className="lg:hidden w-9 h-9 rounded-full flex items-center justify-center text-gray-700 dark:text-white/80 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
                aria-label="Open menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

        </div>

        {/* ── Category strip — icons-above on mobile, inline on desktop. Home page only. ── */}
        {location.pathname === "/" && (
          <div className="bg-violet-100 md:bg-white md:border-t md:border-gray-100 dark:md:border-white/[0.06]">
            <div className="relative max-w-[1280px] mx-auto px-1 sm:px-4">
              <nav
                className="flex items-stretch gap-0 md:gap-2 overflow-x-auto no-scrollbar overscroll-x-contain snap-x snap-mandatory"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                {CATEGORY_STRIP.map((item, i) => {
                  const isActive = i === 0;
                  return (
                    <Link
                      key={item.name}
                      to={item.to}
                      className={`relative snap-start flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 px-2.5 sm:px-3 md:px-4 pt-2 pb-2 md:py-3.5 text-[11px] md:text-sm whitespace-nowrap transition-colors group min-w-[68px] sm:min-w-[72px] md:min-w-0 flex-shrink-0 ${
                        isActive
                          ? "text-gray-900 md:text-violet-600 font-extrabold md:font-bold"
                          : "text-gray-700 dark:text-white/80 hover:text-violet-600 font-semibold"
                      }`}
                    >
                      <span className={`text-[26px] md:text-lg leading-none ${isActive ? "" : "grayscale-[20%] group-hover:grayscale-0"}`}>
                        {item.icon}
                      </span>
                      {item.name}
                      {isActive && (
                        <span className="absolute bottom-0 left-2.5 right-2.5 md:left-0 md:right-0 h-[3px] md:h-0.5 bg-gray-900 md:bg-violet-600 rounded-t" />
                      )}
                    </Link>
                  );
                })}
              </nav>
              {/* Soft fade hint on the right edge — only on mobile */}
              <div className="md:hidden absolute top-0 right-0 bottom-0 w-6 bg-gradient-to-l from-violet-100 to-transparent pointer-events-none" />
            </div>
          </div>
        )}
      </header>

      {/* ===== Mobile Drawer ===== */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 right-0 w-[320px] max-w-[85vw] z-[70] lg:hidden transition-transform duration-300 bg-white dark:bg-[#0d1117] shadow-2xl ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full p-5 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <Logo size="sm" />
            <button
              onClick={() => setIsOpen(false)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-gray-600 dark:text-white/80 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
              aria-label="Close menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* User block */}
          {user && (
            <Link
              to="/account"
              className="flex items-center gap-3 p-3 rounded-2xl bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 mb-4"
            >
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-extrabold flex-shrink-0">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
                <p className="text-[11px] text-gray-500 dark:text-white/50 truncate">{user.email}</p>
              </div>
            </Link>
          )}

          {/* Location (mobile) */}
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 mb-4">
            <svg className="w-4 h-4 text-violet-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-gray-500 dark:text-white/50 uppercase tracking-wider">Delivering to</p>
              <p className="text-xs font-semibold text-gray-800 dark:text-white truncate">{selectedLocation}</p>
            </div>
          </div>

          {/* Nav links */}
          <nav className="space-y-1 flex-1 overflow-y-auto -mx-1 px-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.name}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-violet-100 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300"
                      : "text-gray-700 dark:text-white/85 hover:bg-gray-100 dark:hover:bg-white/5"
                  }`
                }
              >
                <span className="w-8 h-8 rounded-lg bg-white dark:bg-white/10 flex items-center justify-center text-base">
                  {item.name === "Home" && "🏠"}
                  {item.name === "Store" && "🛍️"}
                  {item.name === "About" && "ℹ️"}
                  {item.name === "Contact" && "✉️"}
                </span>
                {item.name}
              </NavLink>
            ))}

            <div className="h-px bg-gray-200/60 dark:bg-white/[0.06] my-3" />

            <p className="text-[10px] font-bold text-gray-500 dark:text-white/50 uppercase tracking-wider px-3 py-1.5">
              Shop by Category
            </p>
            {CATEGORY_STRIP.map((item) => (
              <Link
                key={item.name}
                to={item.to}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-white/85 hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
              >
                <span className="text-lg w-7">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Bottom actions */}
          <div className="pt-4 border-t border-gray-200/60 dark:border-white/[0.06] space-y-2">
            <Link
              to={user ? "/cart" : "/login?redirect=%2Fcart"}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-extrabold transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.4}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              View Cart{cartCount > 0 && ` (${cartCount})`}
            </Link>

            {user ? (
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-rose-500 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all"
              >
                Sign Out
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  className="py-2.5 rounded-xl text-center text-sm font-bold border border-gray-200 dark:border-white/10 text-gray-800 dark:text-white"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="py-2.5 rounded-xl text-center text-sm font-extrabold bg-violet-600 text-white"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Header;
