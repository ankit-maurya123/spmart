import {
  useDashboardStats,
  useRecentReviews,
  useMonthlyReviews,
  useTopProducts,
  useCategoryStats,
} from "../../hooks/useAdmin";
import { resolveProductImage } from "../../lib/imageMap";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const STAT_CARDS = [
  { key: "totalProducts", label: "Total Products", color: "from-cyan-500 to-blue-500", iconBg: "bg-cyan-100 dark:bg-cyan-500/20", iconColor: "text-cyan-600 dark:text-cyan-300", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
  { key: "totalOrders", label: "Total Orders", color: "from-indigo-500 to-purple-500", iconBg: "bg-indigo-100 dark:bg-indigo-500/20", iconColor: "text-indigo-600 dark:text-indigo-300", icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" },
  { key: "totalRevenue", label: "Revenue", color: "from-green-400 to-emerald-500", iconBg: "bg-green-100 dark:bg-green-500/20", iconColor: "text-green-600 dark:text-green-300", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", prefix: "₹" },
  { key: "totalReviews", label: "Total Reviews", color: "from-yellow-400 to-orange-500", iconBg: "bg-yellow-100 dark:bg-yellow-500/20", iconColor: "text-yellow-600 dark:text-yellow-300", icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" },
];

/* ── Reusable tiny components ─────────────────────────── */

function StarDisplay({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`w-3.5 h-3.5 ${s <= Math.round(rating) ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function StatSkeleton() {
  return (
    <div className="rounded-2xl bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm border border-gray-200/60 dark:border-white/[0.06] p-5 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-7 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="rounded-2xl bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm border border-gray-200/60 dark:border-white/[0.06] p-4 sm:p-6 animate-pulse">
      <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded mb-6" />
      <div className="h-64 bg-gray-200/50 dark:bg-gray-700/30 rounded-xl" />
    </div>
  );
}

function ListSkeleton({ rows = 5 }) {
  return (
    <div className="rounded-2xl bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm border border-gray-200/60 dark:border-white/[0.06] p-4 sm:p-6 animate-pulse">
      <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
      <div className="divide-y divide-gray-200/60 dark:divide-white/[0.06]">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-3">
            <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-medium" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
}

/* ── Card wrapper ─────────────────────────────────────── */

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm border border-gray-200/60 dark:border-white/[0.06] p-4 sm:p-6 ${className}`}>
      {children}
    </div>
  );
}

/* ── Main Dashboard ───────────────────────────────────── */

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentReviews, isLoading: reviewsLoading } = useRecentReviews();
  const { data: monthlyReviews, isLoading: monthlyLoading } = useMonthlyReviews();
  const { data: topProducts, isLoading: topLoading } = useTopProducts();
  const { data: categories, isLoading: catLoading } = useCategoryStats();

  return (
    <div className="space-y-6">
      {/* ── Row 1: Stat Cards ─────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statsLoading
          ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
          : STAT_CARDS.map((card) => (
              <div
                key={card.key}
                className="rounded-2xl bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm border border-gray-200/60 dark:border-white/[0.06] p-4 sm:p-5 transition-all duration-200 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{card.label}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">
                      {card.key === "avgRating"
                        ? stats?.[card.key]?.toFixed(1) ?? "0.0"
                        : card.key === "totalRevenue"
                        ? `₹${(stats?.[card.key] || 0).toLocaleString()}`
                        : stats?.[card.key] ?? 0}
                    </p>
                  </div>
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                    <svg className={`w-5 h-5 sm:w-6 sm:h-6 ${card.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
                    </svg>
                  </div>
                </div>
                <div className={`mt-3 h-1 rounded-full bg-gradient-to-r ${card.color} opacity-60`} />
              </div>
            ))}
      </div>

      {/* ── Row 2: Charts ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Area Chart — Reviews Trend */}
        {monthlyLoading ? (
          <ChartSkeleton />
        ) : (
          <Card>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
              Reviews Trend
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyReviews} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="reviewGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="reviews"
                    name="Reviews"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    fill="url(#reviewGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {/* Bar Chart — Products by Category */}
        {catLoading ? (
          <ChartSkeleton />
        ) : (
          <Card>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
              Products by Category
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categories} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Products" fill="#6b7280" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="avgRating" name="Avg Rating" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
      </div>

      {/* ── Row 3: Lists ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Reviews */}
        {reviewsLoading ? (
          <ListSkeleton />
        ) : (
          <Card>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
              Recent Reviews
            </h2>
            {!recentReviews?.length ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 py-6 text-center">No reviews yet.</p>
            ) : (
              <div className="divide-y divide-gray-200/60 dark:divide-white/[0.06]">
                {recentReviews.map((r) => (
                  <div key={r._id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {r.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{r.name}</span>
                        <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <StarDisplay rating={r.rating} />
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-1">{r.comment}</p>
                      {r.productId && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                          on <span className="text-cyan-600 dark:text-cyan-400">{r.productId.name}</span>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Top Products */}
        {topLoading ? (
          <ListSkeleton />
        ) : (
          <Card>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
              Top Products
            </h2>
            {!topProducts?.length ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 py-6 text-center">No products yet.</p>
            ) : (
              <div className="divide-y divide-gray-200/60 dark:divide-white/[0.06]">
                {topProducts.map((p, idx) => (
                  <div key={p._id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    {/* Rank badge */}
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {idx + 1}
                    </div>

                    {/* Product image */}
                    <img
                      src={resolveProductImage(p)}
                      alt={p.name}
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-gray-200 dark:border-white/10"
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{p.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <StarDisplay rating={p.rating} />
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {p.rating?.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    {/* Price + category */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        ${p.price}
                      </p>
                      <span className="text-xs text-gray-400 dark:text-gray-500">{p.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
