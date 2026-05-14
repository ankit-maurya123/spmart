import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useUserAuth } from "../../context/UserAuthContext";
import usePageMeta from "../../hooks/usePageMeta";

const NAV = [
  { to: "/account",               end: true,  label: "Overview",       icon: "📊" },
  { to: "/account/profile",                  label: "Personal Info",   icon: "👤" },
  { to: "/account/orders",                   label: "My Orders",       icon: "📦" },
  { to: "/account/addresses",                label: "Addresses",       icon: "📍" },
  { to: "/account/wishlist",                 label: "Wishlist",        icon: "❤️" },
  { to: "/account/wallet",                   label: "Wallet",          icon: "💰" },
  { to: "/account/coupons",                  label: "Coupons",         icon: "🎟️" },
  { to: "/account/notifications",            label: "Notifications",   icon: "🔔" },
  { to: "/account/password",                 label: "Change Password", icon: "🔒" },
  { to: "/account/support",                  label: "Help & Support",  icon: "💬" },
];

const AccountLayout = () => {
  usePageMeta({ title: "My Account", noIndex: true });
  const { user, logout } = useUserAuth();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const Sidebar = ({ onNavigate }) => (
    <div className="flex flex-col h-full">
      {/* User card */}
      <div className="p-5 sm:p-6 bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white text-violet-700 flex items-center justify-center text-lg font-extrabold flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-white/70 font-bold">Hello,</p>
            <p className="text-base font-extrabold truncate">{user?.name || "Friend"}</p>
            <p className="text-[11px] text-white/70 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto p-2">
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                isActive
                  ? "bg-violet-50 text-violet-700 font-extrabold"
                  : "text-gray-700 hover:bg-gray-50 font-semibold"
              }`
            }
          >
            <span className="text-lg w-7 text-center">{n.icon}</span>
            <span className="flex-1">{n.label}</span>
            <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </NavLink>
        ))}

        <button
          onClick={handleLogout}
          className="mt-2 w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-50 transition-colors"
        >
          <span className="text-lg w-7 text-center">↩️</span>
          <span className="flex-1 text-left">Sign Out</span>
        </button>
      </nav>
    </div>
  );

  return (
    <div className="pt-4 sm:pt-6 pb-12 min-h-screen">
      <div className="max-w-[1280px] mx-auto px-3 sm:px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block lg:col-span-3 xl:col-span-3">
            <div className="sticky top-32 bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <Sidebar />
            </div>
          </aside>

          {/* Mobile: section selector button */}
          <div className="lg:hidden">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="w-full flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-2xl hover:border-violet-300 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-extrabold flex-shrink-0">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-[11px] uppercase tracking-wider text-gray-500 font-bold">My Account</p>
                <p className="text-sm font-extrabold text-gray-900 truncate">{user?.name}</p>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Main content */}
          <main className="lg:col-span-9 xl:col-span-9 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileNavOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] lg:hidden"
            onClick={() => setMobileNavOpen(false)}
          />
          <aside className="fixed top-0 bottom-0 left-0 w-[300px] max-w-[85vw] bg-white z-[70] lg:hidden overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-3 border-b border-gray-100">
              <p className="text-sm font-extrabold text-gray-900">Account Menu</p>
              <button
                onClick={() => setMobileNavOpen(false)}
                className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <Sidebar onNavigate={() => setMobileNavOpen(false)} />
          </aside>
        </>
      )}
    </div>
  );
};

export default AccountLayout;
