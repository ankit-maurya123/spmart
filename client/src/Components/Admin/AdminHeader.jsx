import { useLocation, useNavigate, Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { useAdminProfile } from "../../hooks/useAdmin";

const PAGE_TITLES = {
  "/admin": "Dashboard",
  "/admin/products": "Products",
  "/admin/reviews": "Reviews",
  "/admin/categories": "Categories",
  "/admin/users": "Users",
  "/admin/orders": "Orders",
  "/admin/analytics": "Analytics",
  "/admin/profile": "Profile",
  "/admin/settings": "Settings",
};

export default function AdminHeader({ onToggleSidebar }) {
  const { darkMode, toggleTheme } = useTheme();
  const { admin, logout } = useAdminAuth();
  const { data: profile } = useAdminProfile();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const title = PAGE_TITLES[pathname] || "Admin";

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 z-30 h-16 flex items-center justify-between px-4 sm:px-6 bg-white/70 dark:bg-[#0a0a1a]/80 backdrop-blur-2xl border-b border-gray-200/60 dark:border-white/[0.06]">
      {/* Left: hamburger + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h1>
      </div>

      {/* Right: theme toggle + logout + avatar */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
          title={darkMode ? "Light mode" : "Dark mode"}
        >
          {darkMode ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        <button
          onClick={handleLogout}
          className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          title="Logout"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>

        <Link
          to="/admin/profile"
          className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden ring-2 ring-transparent hover:ring-cyan-400/40 transition-all"
          title="Profile"
        >
          {profile?.avatar ? (
            <img src={profile.avatar} alt="Admin" className="w-full h-full object-cover" />
          ) : (
            (profile?.name || admin?.email || "A").charAt(0).toUpperCase()
          )}
        </Link>
      </div>
    </header>
  );
}
