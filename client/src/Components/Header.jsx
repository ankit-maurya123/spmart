import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useCart } from "../context/CartContext";
import { useUserAuth } from "../context/UserAuthContext";
import Logo from "./ui/Logo";

const NAV_ITEMS = [
  { name: "Home", to: "/" },
  { name: "Store", to: "/store" },
  { name: "About", to: "/about" },
  { name: "Contact", to: "/contact" },
];

const MOBILE_NAV = [
  { name: "Home", to: "/", color: "text-cyan-500", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { name: "Store", to: "/store", color: "text-yellow-500", icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" },
  { name: "About", to: "/about", color: "text-purple-500", icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { name: "Contact", to: "/contact", color: "text-green-500", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
];

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { darkMode, toggleTheme } = useTheme();
  const { getCartCount } = useCart();
  const { user, logout } = useUserAuth();
  const cartCount = getCartCount();
  const userMenuRef = useRef(null);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-4 bg-white/70 dark:bg-[#0a0a1a]/80 backdrop-blur-2xl border-b border-gray-200/60 dark:border-white/[0.06] transition-colors duration-300">
        <div className="max-w-[1200px] mx-auto flex justify-between items-center h-14 sm:h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <Logo size="lg" />
          </Link>

          {/* Desktop Menu */}
          <ul className="hidden md:flex items-center space-x-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.name}>
                <Link to={item.to} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-300">
                  {item.name}
                </Link>
              </li>
            ))}
            {/* Theme Toggle */}
            <li>
              <button
                onClick={toggleTheme}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-300"
              >
                {darkMode ? (
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
            </li>
            {/* Cart */}
            <li>
              <Link to="/cart" className="ml-1 px-5 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold text-sm rounded-full hover:scale-105 hover:shadow-lg transition-all duration-300 flex items-center gap-2 relative">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
                Cart
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">{cartCount}</span>
                )}
              </Link>
            </li>
            {/* User Auth */}
            <li>
              {user ? (
                <div className="relative ml-1" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white text-sm font-bold hover:scale-105 hover:shadow-lg hover:shadow-orange-500/20 transition-all ring-2 ring-transparent hover:ring-orange-400/40"
                  >
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </button>
                  {/* Dropdown */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#1a1a2e] rounded-2xl border border-gray-200/60 dark:border-white/[0.08] shadow-xl shadow-gray-200/40 dark:shadow-black/30 py-2 z-50">
                      <div className="px-4 py-2.5 border-b border-gray-100 dark:border-white/[0.06]">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors flex items-center gap-2.5"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="ml-1 w-10 h-10 rounded-xl flex items-center justify-center text-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-300"
                  title="Sign In"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </Link>
              )}
            </li>
          </ul>

          {/* Mobile Icons */}
          <div className="flex items-center gap-1.5 md:hidden">
            {/* Theme toggle mobile */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
            >
              {darkMode ? (
                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
            {/* Cart */}
            <Link to="/cart" className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all relative">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">{cartCount}</span>
              )}
            </Link>
            {/* User icon (mobile) */}
            {user ? (
              <button
                onClick={() => setIsOpen(true)}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold"
              >
                {user.name?.charAt(0).toUpperCase() || "U"}
              </button>
            ) : (
              <Link to="/login" className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
            )}
            {/* Hamburger */}
            <button
              className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
              onClick={() => setIsOpen(true)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] md:hidden" onClick={() => setIsOpen(false)} />
      )}

      {/* Mobile Menu */}
      <div className={`fixed top-0 left-0 h-full w-[75vw] max-w-[280px] bg-white dark:bg-gray-900/95 backdrop-blur-xl p-5 transform ${isOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out md:hidden z-[70] border-r border-gray-200 dark:border-white/10`}>
        <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 absolute top-3 right-3 transition-all text-gray-600 dark:text-white" onClick={() => setIsOpen(false)}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-6 mt-1">
          <Logo size="sm" />
        </div>

        {/* User info section in mobile menu */}
        {user && (
          <div className="mb-4 px-3 py-3 rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-200/60 dark:border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        <ul className="space-y-1">
          {MOBILE_NAV.map((item) => (
            <li key={item.name}>
              <Link
                to={item.to}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all text-sm"
              >
                <svg className={`w-5 h-5 ${item.color} flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                {item.name}
              </Link>
            </li>
          ))}
          <li className="pt-3">
            <Link to="/cart" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold text-sm">
              Cart{cartCount > 0 && ` (${cartCount})`}
            </Link>
          </li>
          {/* Auth links in mobile */}
          {user ? (
            <li className="pt-1">
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all text-sm font-medium"
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </li>
          ) : (
            <>
              <li className="pt-1">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all text-sm"
                >
                  <svg className="w-5 h-5 text-orange-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  to="/signup"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all text-sm"
                >
                  <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Create Account
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </>
  );
};

export default Header;
