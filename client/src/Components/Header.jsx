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

// Zepto-style top category strip — each `category` must match a real DB category name
// returned by /api/products/categories. The `name` is the short display label.
const CATEGORY_STRIP = [
  { name: "All",        category: null,                              icon: "🛒" },
  { name: "Fresh",      category: "Vegetables",                      icon: "🥬" },
  { name: "Fruits",     category: "Fruits",                          icon: "🍎" },
  { name: "Dairy",      category: "Milk",                            icon: "🥛" },
  { name: "Bakery",     category: "Breads & Bakery",                 icon: "🍞" },
  { name: "Snacks",     category: "Chips & Namkeens",                icon: "🍿" },
  { name: "Drinks",     category: "Cold Drinks",                     icon: "🥤" },
  { name: "Cafe",       category: "Tea & Coffee",                    icon: "☕" },
  { name: "Spices",     category: "Sugar & Spices",                  icon: "🌶️" },
  { name: "Oils",       category: "Oil & Ghee",                      icon: "🫒" },
  { name: "Sweets",     category: "Chocolate & Candies",             icon: "🍫" },
  { name: "Beauty",     category: "Top Picks for Skin & Hair Care",  icon: "💄" },
  { name: "Oral Care",  category: "Top Picks for Oral Care",         icon: "🪥" },
  { name: "Frozen",     category: "Frozen",                          icon: "❄️" },
  { name: "Ready Eat",  category: "Ready To Cook & Eat",             icon: "🍱" },
];

const buildCategoryHref = (category) =>
  category ? `/store?category=${encodeURIComponent(category)}` : "/store";

const LOCATIONS = [
  "Mumbai, Maharashtra",
  "Delhi NCR",
  "Bengaluru, Karnataka",
  "Hyderabad, Telangana",
  "Chennai, Tamil Nadu",
  "Pune, Maharashtra",
];

const LOCATION_STORAGE_KEY = "spmart_location";

// Fetch the visitor's approximate City/State from their public IP.
// Uses ipapi.co — no API key, free for low-traffic sites. Falls back to
// ipwho.is so we degrade gracefully if one provider rate-limits us.
async function detectLocation() {
  const providers = [
    {
      url: "https://ipapi.co/json/",
      parse: (d) => (d?.city && d?.region ? `${d.city}, ${d.region}` : null),
    },
    {
      url: "https://ipwho.is/",
      parse: (d) =>
        d?.success && d?.city && d?.region ? `${d.city}, ${d.region}` : null,
    },
  ];
  for (const p of providers) {
    try {
      const res = await fetch(p.url, { cache: "no-store" });
      if (!res.ok) continue;
      const data = await res.json();
      const loc = p.parse(data);
      if (loc) return loc;
    } catch { /* try next provider */ }
  }
  return null;
}

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  // Read any previously chosen / detected location from localStorage so it
  // persists across reloads. Falls back to the first static city only if
  // we've never resolved one before.
  const [selectedLocation, setSelectedLocation] = useState(() => {
    try {
      return localStorage.getItem(LOCATION_STORAGE_KEY) || LOCATIONS[0];
    } catch {
      return LOCATIONS[0];
    }
  });
  const [detectedLocation, setDetectedLocation] = useState(null);
  const [detecting, setDetecting] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const { getCartCount, openCart } = useCart();
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

  // Auto-detect the visitor's City/State from their IP on first load.
  // We only override the selected location if the user hasn't picked one
  // before — manual choices always win.
  useEffect(() => {
    let cancelled = false;
    const hasStored = (() => {
      try { return !!localStorage.getItem(LOCATION_STORAGE_KEY); }
      catch { return false; }
    })();

    (async () => {
      setDetecting(true);
      const loc = await detectLocation();
      if (cancelled) return;
      if (loc) {
        setDetectedLocation(loc);
        if (!hasStored) {
          // First-time visitor — use the auto-detected one as default.
          setSelectedLocation(loc);
          try { localStorage.setItem(LOCATION_STORAGE_KEY, loc); } catch {}
        }
      }
      setDetecting(false);
    })();

    return () => { cancelled = true; };
  }, []);

  // Picking a location anywhere in the UI flows through this so we always
  // persist it as the manual choice.
  const handleLocationPick = (loc) => {
    setSelectedLocation(loc);
    setLocationOpen(false);
    try { localStorage.setItem(LOCATION_STORAGE_KEY, loc); } catch {}
  };

  // Static cities + detected city (if not already in the list).
  // Keeps the dropdown short and avoids duplicates like "Mumbai, Maharashtra"
  // appearing twice when the visitor is already in Mumbai.
  const mergedLocations = (() => {
    if (!detectedLocation) return LOCATIONS;
    const has = LOCATIONS.some(
      (l) => l.toLowerCase() === detectedLocation.toLowerCase()
    );
    return has ? LOCATIONS : [detectedLocation, ...LOCATIONS];
  })();

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

  // Lock body scroll when mobile drawer is open.
  // Avoid padding-right compensation: it can shift fixed elements (drawer)
  // away from the viewport edge in some containing-block conditions.
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    const prevTouchAction = document.body.style.touchAction;
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.touchAction = prevTouchAction;
    };
  }, [isOpen]);

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
                <p className="text-[10px] sm:text-[11px] text-gray-700 truncate leading-tight mt-0.5 flex items-center gap-1">
                  {detecting && !localStorage.getItem(LOCATION_STORAGE_KEY) ? (
                    <>
                      <svg className="w-2.5 h-2.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span>Detecting…</span>
                    </>
                  ) : (
                    <span className="truncate">{selectedLocation}</span>
                  )}
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

              {/* Hamburger — opens mobile drawer. Last position. */}
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                aria-label="Open menu"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-gray-300 flex items-center justify-center text-gray-800 shadow-sm hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
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
              <div className="p-3 border-b border-gray-100 flex items-center justify-between gap-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Choose Delivery Location
                </p>
                {detectedLocation && (
                  <button
                    onClick={() => handleLocationPick(detectedLocation)}
                    className="text-[10px] font-extrabold text-violet-600 hover:text-violet-700 inline-flex items-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 4a4 4 0 110 8 4 4 0 010-8z" opacity=".3" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    Use my location
                  </button>
                )}
              </div>
              <ul className="max-h-72 overflow-y-auto">
                {mergedLocations.map((loc) => {
                  const isDetected = detectedLocation && loc.toLowerCase() === detectedLocation.toLowerCase();
                  return (
                    <li key={loc}>
                      <button
                        onClick={() => handleLocationPick(loc)}
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
                        <span className="truncate flex-1">{loc}</span>
                        {isDetected && (
                          <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                            You
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
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
              <p className="text-[11px] text-gray-500 dark:text-white/50 -mt-1 truncate max-w-[180px] flex items-center gap-1">
                {detecting && !selectedLocation ? (
                  <>
                    <svg className="w-2.5 h-2.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Detecting…
                  </>
                ) : (
                  <span className="truncate">{selectedLocation}</span>
                )}
              </p>

              {locationOpen && (
                <div className="absolute left-0 top-full mt-1 w-72 rounded-2xl bg-white dark:bg-[#11141d] border border-gray-200 dark:border-white/10 shadow-xl overflow-hidden z-50">
                  <div className="p-3 border-b border-gray-100 dark:border-white/10 flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-gray-500 dark:text-white/50 uppercase tracking-wider">
                      Choose Delivery Location
                    </p>
                    {detectedLocation && (
                      <button
                        onClick={() => handleLocationPick(detectedLocation)}
                        className="text-[10px] font-extrabold text-violet-600 dark:text-violet-300 hover:text-violet-700 inline-flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 4a4 4 0 110 8 4 4 0 010-8z" opacity=".3" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        Use my location
                      </button>
                    )}
                  </div>
                  <ul className="max-h-72 overflow-y-auto">
                    {mergedLocations.map((loc) => {
                      const isDetected = detectedLocation && loc.toLowerCase() === detectedLocation.toLowerCase();
                      return (
                        <li key={loc}>
                          <button
                            onClick={() => handleLocationPick(loc)}
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
                            <span className="truncate flex-1">{loc}</span>
                            {isDetected && (
                              <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-300 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                You
                              </span>
                            )}
                          </button>
                        </li>
                      );
                    })}
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

              {/* Cart — opens slide-out drawer */}
              <button
                type="button"
                onClick={openCart}
                className="relative flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                aria-label="Open cart"
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
                {CATEGORY_STRIP.map((item) => {
                  // Strip only renders on `/` — "All" is the only realistic active state.
                  const isActive = item.category === null;
                  return (
                    <Link
                      key={item.name}
                      to={buildCategoryHref(item.category)}
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
      {/* Overlay — always mounted; opacity transitions for smooth open/close */}
      <div
        onClick={() => setIsOpen(false)}
        aria-hidden={!isOpen}
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] lg:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      <aside
        aria-hidden={!isOpen}
        className={`fixed top-0 bottom-0 right-0 w-[320px] max-w-[88vw] z-[70] lg:hidden transition-transform duration-300 ease-out bg-white dark:bg-[#0d1117] shadow-2xl flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* ── COMPACT GRADIENT HEADER ───────────────────────────────
            Combines: logo + close + sign-out + profile + location all in
            one tight strip so the nav below gets maximum space.            */}
        <div className="relative flex-shrink-0 bg-gradient-to-br from-violet-600 via-violet-500 to-fuchsia-500 px-4 pt-3 pb-3 text-white">
          {/* Row 1: logo + sign-out (if logged in) + close */}
          <div className="flex items-center justify-between mb-2.5">
            <Logo size="sm" />
            <div className="flex items-center gap-1.5">
              {user && (
                <button
                  onClick={() => { logout(); setIsOpen(false); }}
                  aria-label="Sign out"
                  title="Sign out"
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white bg-white/15 hover:bg-rose-500/30 backdrop-blur-sm transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close menu"
                className="w-9 h-9 rounded-full flex items-center justify-center text-white bg-white/15 hover:bg-white/25 backdrop-blur-sm transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.4}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Row 2: profile card OR sign-in/up */}
          {user ? (
            <Link
              to="/account"
              className="flex items-center gap-2.5 p-2 rounded-xl bg-white/15 hover:bg-white/20 backdrop-blur-sm transition-colors mb-2"
            >
              <div className="w-9 h-9 rounded-full bg-white text-violet-600 flex items-center justify-center font-extrabold text-sm flex-shrink-0 shadow-md">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-bold truncate leading-tight">{user.name}</p>
                <p className="text-[10px] text-white/80 truncate leading-tight">{user.email}</p>
              </div>
              <svg className="w-3.5 h-3.5 text-white/80 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.4}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <div className="mb-2">
              <p className="text-sm font-extrabold leading-tight">Welcome to SP Mart</p>
              <p className="text-[11px] text-white/85 mt-0.5 leading-tight">Sign in for faster checkout</p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Link to="/login" className="py-1.5 rounded-lg text-center text-xs font-bold bg-white/15 hover:bg-white/25 text-white backdrop-blur-sm transition-colors">
                  Sign In
                </Link>
                <Link to="/signup" className="py-1.5 rounded-lg text-center text-xs font-extrabold bg-white text-violet-700 hover:bg-violet-50 transition-colors">
                  Sign Up
                </Link>
              </div>
            </div>
          )}

          {/* Row 3: location chip — inside the gradient, very compact */}
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm">
            <svg className="w-3.5 h-3.5 text-white/85 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.4}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider">Deliver to:</span>
            <span className="text-[11px] font-bold text-white truncate flex-1">{selectedLocation}</span>
          </div>
        </div>

        {/* ── SCROLLABLE BODY ──────────────────────────────────────── */}
        <nav className="flex-1 min-h-0 overflow-y-auto overscroll-contain no-scrollbar px-3 pt-2 pb-2">
          {/* Primary nav */}
          <div className="space-y-0.5">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.name}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-2 py-1.5 rounded-xl text-[13px] font-semibold transition-all ${
                    isActive
                      ? "bg-violet-50 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300"
                      : "text-gray-700 dark:text-white/85 hover:bg-gray-50 dark:hover:bg-white/5"
                  }`
                }
              >
                <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-500/10 dark:to-fuchsia-500/10 flex items-center justify-center text-sm shadow-sm">
                  {item.name === "Home" && "🏠"}
                  {item.name === "Store" && "🛍️"}
                  {item.name === "About" && "ℹ️"}
                  {item.name === "Contact" && "✉️"}
                </span>
                <span className="flex-1">{item.name}</span>
                <svg className="w-3 h-3 text-gray-400 dark:text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.4}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </NavLink>
            ))}
          </div>

          {/* Section heading */}
          <div className="flex items-center gap-2 mt-3 mb-1.5 px-2">
            <p className="text-[9px] font-extrabold text-gray-500 dark:text-white/50 uppercase tracking-wider">
              Shop by Category
            </p>
            <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
          </div>

          {/* Category grid — 4-col compact (fits more in less space) */}
          <div className="grid grid-cols-4 gap-1.5">
            {CATEGORY_STRIP.map((item) => (
              <Link
                key={item.name}
                to={buildCategoryHref(item.category)}
                className="flex flex-col items-center justify-center gap-0.5 p-1.5 rounded-lg bg-gray-50 dark:bg-white/5 hover:bg-violet-50 dark:hover:bg-violet-500/10 active:scale-[0.96] transition-all"
              >
                <span className="text-lg leading-none">{item.icon}</span>
                <span className="text-[9px] font-semibold text-gray-700 dark:text-white/85 truncate w-full text-center leading-tight">
                  {item.name}
                </span>
              </Link>
            ))}
          </div>
        </nav>

        {/* ── BOTTOM CTA — single button only, ultra-compact ──────── */}
        <div className="flex-shrink-0 px-3 pt-2 pb-[max(env(safe-area-inset-bottom),10px)] border-t border-gray-200/70 dark:border-white/[0.06] bg-white dark:bg-[#0d1117]">
          <button
            type="button"
            onClick={() => { setIsOpen(false); openCart(); }}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white text-sm font-extrabold shadow-md shadow-violet-500/30 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.4}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            View Cart{cartCount > 0 && ` · ${cartCount}`}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Header;
