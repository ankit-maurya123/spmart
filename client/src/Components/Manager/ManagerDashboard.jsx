import { Link } from "react-router-dom";
import { useManagerDashboard } from "../../hooks/useManager";
import { useManagerAuth } from "../../context/ManagerAuthContext";
import usePageMeta from "../../hooks/usePageMeta";

const StatCard = ({ icon, label, value, sub, color, to }) => {
  const Wrap = to ? Link : "div";
  return (
    <Wrap
      to={to}
      className={`group rounded-2xl bg-white border border-gray-200 p-4 sm:p-5 ${to ? "hover:shadow-md hover:border-emerald-300 transition-all" : ""}`}
    >
      <div className="flex items-center gap-3">
        <span className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">{label}</p>
          <p className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight">{value}</p>
          {sub && <p className="text-[10px] text-gray-500 mt-0.5 truncate">{sub}</p>}
        </div>
      </div>
    </Wrap>
  );
};

export default function ManagerDashboard() {
  usePageMeta({ title: "Manager Dashboard", noIndex: true });
  const { manager } = useManagerAuth();
  const { data, isLoading } = useManagerDashboard();

  const growth = (() => {
    if (!data) return null;
    if (data.yesterdayOrders === 0) return data.todayOrders > 0 ? "+100%" : "0%";
    const pct = Math.round(((data.todayOrders - data.yesterdayOrders) / data.yesterdayOrders) * 100);
    return pct >= 0 ? `+${pct}%` : `${pct}%`;
  })();

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Hero greeting */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-5 sm:p-7 text-white">
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-yellow-200/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full bg-emerald-200/30 blur-3xl pointer-events-none" />
        <div className="relative flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-white/70 font-bold">Order Panel</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-0.5">
              Hello, {manager?.email?.split("@")[0] || "Manager"} 👋
            </h1>
            <p className="text-sm text-white/85 mt-1">
              {isLoading ? "Loading today's snapshot…" : `${data?.todayOrders || 0} order${data?.todayOrders !== 1 ? "s" : ""} placed today.`}
            </p>
          </div>
          <Link
            to="/manager/orders"
            className="px-4 py-2.5 rounded-full bg-white text-emerald-700 text-xs sm:text-sm font-extrabold hover:scale-105 transition-transform inline-flex items-center gap-1.5 shadow-lg"
          >
            Manage Orders
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.6}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Today stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={<svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
          label="Today's Orders"
          value={isLoading ? "—" : data?.todayOrders ?? 0}
          sub={growth ? `${growth} vs yesterday` : ""}
          color="bg-cyan-50"
        />
        <StatCard
          icon={<svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V4m0 14v2" /><circle cx="12" cy="12" r="9" /></svg>}
          label="Today's Revenue"
          value={isLoading ? "—" : `₹${(data?.todayRevenue || 0).toLocaleString("en-IN")}`}
          sub={`Total: ₹${(data?.totalRevenue || 0).toLocaleString("en-IN")}`}
          color="bg-emerald-50"
        />
        <StatCard
          icon={<svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          label="Pending"
          value={isLoading ? "—" : data?.pending ?? 0}
          sub="Needs your attention"
          color="bg-amber-50"
          to="/manager/orders?status=pending"
        />
        <StatCard
          icon={<svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>}
          label="In Transit"
          value={isLoading ? "—" : (data?.processing || 0) + (data?.shipped || 0)}
          sub={`${data?.delivered || 0} delivered`}
          color="bg-violet-50"
          to="/manager/orders?status=shipped"
        />
      </div>

      {/* Status pipeline */}
      <section className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-base font-extrabold text-gray-900">Order Pipeline</h2>
          <Link to="/manager/orders" className="text-xs font-extrabold text-emerald-600 hover:underline">
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {[
            { key: "pending",    label: "Pending",    color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
            { key: "processing", label: "Processing", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
            { key: "shipped",    label: "Shipped",    color: "bg-purple-50 text-purple-700 border-purple-200" },
            { key: "delivered",  label: "Delivered",  color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
            { key: "cancelled",  label: "Cancelled",  color: "bg-rose-50 text-rose-700 border-rose-200" },
            { key: "totalOrders", label: "Total",     color: "bg-gray-50 text-gray-700 border-gray-200" },
          ].map((s) => (
            <Link
              key={s.key}
              to={s.key === "totalOrders" ? "/manager/orders" : `/manager/orders?status=${s.key}`}
              className={`block p-3 rounded-xl border-2 transition-all hover:scale-[1.02] ${s.color}`}
            >
              <p className="text-[10px] font-extrabold uppercase tracking-wider opacity-80">{s.label}</p>
              <p className="text-xl sm:text-2xl font-extrabold mt-1 leading-none">
                {isLoading ? "—" : data?.[s.key] ?? 0}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick info */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Link
          to="/manager/products"
          className="bg-white border border-gray-200 hover:border-emerald-300 hover:shadow-md rounded-2xl p-5 transition-all flex items-center gap-4"
        >
          <span className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-extrabold text-gray-900">{isLoading ? "—" : data?.totalProducts ?? 0} Products</p>
            <p className="text-xs text-gray-500 mt-0.5">Browse catalog · view-only</p>
          </div>
          <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        <Link
          to="/manager/products?stock=out"
          className={`rounded-2xl p-5 flex items-center gap-4 transition-all border ${
            (data?.outOfStockCount || 0) > 0
              ? "bg-rose-50 border-rose-200 hover:border-rose-300"
              : "bg-white border-gray-200 hover:border-emerald-300"
          }`}
        >
          <span className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
            (data?.outOfStockCount || 0) > 0 ? "bg-rose-100 text-rose-600" : "bg-emerald-50 text-emerald-600"
          }`}>
            {(data?.outOfStockCount || 0) > 0 ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-extrabold text-gray-900">
              {isLoading ? "—" : data?.outOfStockCount ?? 0} Out of Stock
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {(data?.outOfStockCount || 0) > 0
                ? "Notify the admin to restock"
                : "All products in stock — good job!"}
            </p>
          </div>
          <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </section>
    </div>
  );
}
