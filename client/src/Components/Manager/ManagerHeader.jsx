import { useLocation, useNavigate } from "react-router-dom";
import { useManagerAuth } from "../../context/ManagerAuthContext";

const PAGE_TITLES = {
  "/manager": "Dashboard",
  "/manager/orders": "Orders",
  "/manager/products": "Products",
};

export default function ManagerHeader({ onToggleSidebar }) {
  const { manager, logout } = useManagerAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Match the most specific path first
  const title =
    Object.keys(PAGE_TITLES)
      .sort((a, b) => b.length - a.length)
      .find((p) => pathname.startsWith(p)) || "/manager";

  const handleLogout = () => {
    logout();
    navigate("/manager/login");
  };

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 z-30 h-16 flex items-center justify-between px-3 sm:px-6 bg-white/80 backdrop-blur-2xl border-b border-emerald-100/60">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle navigation"
          className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-base sm:text-lg font-extrabold text-gray-900 truncate">
          {PAGE_TITLES[title] || "Manager"}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Role pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
            {manager?.role || "Manager"}
          </span>
        </div>

        {/* User pill */}
        <div className="flex items-center gap-2 pl-1 pr-1 py-1 rounded-full border border-gray-200 bg-white">
          <span className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-extrabold">
            {(manager?.email || "M").charAt(0).toUpperCase()}
          </span>
          <span className="hidden sm:block text-xs font-bold text-gray-700 max-w-[120px] truncate pr-2">
            {manager?.email}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="p-2 rounded-lg text-gray-600 hover:text-rose-500 hover:bg-rose-50 transition-colors"
          title="Logout"
          aria-label="Logout"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </header>
  );
}
