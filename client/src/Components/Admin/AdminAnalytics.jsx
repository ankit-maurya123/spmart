import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"];

const STATUS_COLORS = {
  Pending: "#eab308",
  Confirmed: "#3b82f6",
  Processing: "#6366f1",
  Shipped: "#a855f7",
  Delivered: "#10b981",
  Cancelled: "#ef4444",
};

/* ─── Skeleton loaders ─────────────────────────── */

function StatSkeleton() {
  return (
    <div className="rounded-2xl bg-[#0f1129] border border-white/[0.06] p-5 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <div className="h-3 w-24 bg-gray-700 rounded" />
          <div className="h-8 w-20 bg-gray-700 rounded" />
          <div className="h-3 w-28 bg-gray-700 rounded" />
        </div>
        <div className="w-12 h-12 bg-gray-700 rounded-xl" />
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="rounded-2xl bg-[#0f1129] border border-white/[0.06] p-6 animate-pulse">
      <div className="h-5 w-44 bg-gray-700 rounded mb-6" />
      <div className="h-72 bg-gray-800/50 rounded-xl" />
    </div>
  );
}

/* ─── Custom dark tooltip ──────────────────────── */

function DarkTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a3e] border border-white/10 rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-xs text-gray-400 mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: p.color || p.stroke }}>
          {p.name}: {typeof p.value === "number" && p.name?.toLowerCase().includes("revenue") ? `₹${p.value.toLocaleString()}` : p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

/* ─── Stat card matching screenshot ────────────── */

function AnalyticStatCard({ label, value, growth, icon, iconBg, iconColor }) {
  const isPositive = growth >= 0;
  return (
    <div className="rounded-2xl bg-[#0f1129]/80 backdrop-blur-sm border border-white/[0.06] p-5 hover:border-white/[0.12] transition-all duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-400 mb-2">{label}</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{value}</p>
          <div className="flex items-center gap-1.5 mt-2.5">
            <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold ${
              isPositive
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-red-500/10 text-red-400"
            }`}>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                {isPositive ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                )}
              </svg>
              {Math.abs(growth)}%
            </span>
            <span className="text-[10px] text-gray-500">vs last month</span>
          </div>
        </div>
        <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center`}>
          <svg className={`w-6 h-6 ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
          </svg>
        </div>
      </div>
    </div>
  );
}

/* ─── Funnel bar ───────────────────────────────── */

function FunnelBar({ label, value, percentage, color, max }) {
  const width = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-white">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-white">{value.toLocaleString()}</span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-gray-300">{percentage}%</span>
        </div>
      </div>
      <div className="h-2.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${width}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

/* ─── Main component ───────────────────────────── */

export default function AdminAnalytics() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "analytics"],
    queryFn: async () => {
      const { data } = await axios.get("/api/admin/analytics");
      return data;
    },
  });

  const s = data?.stats || {};

  return (
    <div className="space-y-6">
      {/* Page header matching screenshot */}
      <div>
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1m-6 0h6" />
          </svg>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-cyan-400 font-medium">Analytics</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Analytics Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">Detailed analytics and insights for your business performance.</p>
      </div>

      {/* ═══════ 4 STAT CARDS ═══════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
        ) : (
          <>
            <AnalyticStatCard
              label="Total Customers"
              value={s.totalCustomers?.toLocaleString() || "0"}
              growth={s.customerGrowth || 0}
              icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              iconBg="bg-cyan-500/10"
              iconColor="text-cyan-400"
            />
            <AnalyticStatCard
              label="Total Revenue"
              value={`₹${(s.totalRevenue || 0).toLocaleString()}`}
              growth={s.revenueGrowth || 0}
              icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              iconBg="bg-emerald-500/10"
              iconColor="text-emerald-400"
            />
            <AnalyticStatCard
              label="Avg. Order Value"
              value={`₹${(s.avgOrderValue || 0).toLocaleString()}`}
              growth={s.avgOrderGrowth || 0}
              icon="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              iconBg="bg-orange-500/10"
              iconColor="text-orange-400"
            />
            <AnalyticStatCard
              label="Total Orders"
              value={(s.totalOrders || 0).toLocaleString()}
              growth={s.orderGrowth || 0}
              icon="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              iconBg="bg-purple-500/10"
              iconColor="text-purple-400"
            />
          </>
        )}
      </div>

      {/* ═══════ ROW 2: ORDER GROWTH + DAILY REVENUE ═══════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {isLoading ? (
          <>
            <ChartSkeleton />
            <ChartSkeleton />
          </>
        ) : (
          <>
            {/* Order Growth Area Chart */}
            <div className="rounded-2xl bg-[#0f1129]/80 backdrop-blur-sm border border-white/[0.06] p-5 sm:p-6">
              <h3 className="text-base font-bold text-white mb-4">Order Growth</h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={data?.orderTrend || []}>
                  <defs>
                    <linearGradient id="gradOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradCustomers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="label" tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<DarkTooltip />} />
                  <Area type="monotone" dataKey="orders" name="Orders" stroke="#10b981" strokeWidth={2} fill="url(#gradOrders)" />
                  <Area type="monotone" dataKey="customers" name="New Customers" stroke="#06b6d4" strokeWidth={2} fill="url(#gradCustomers)" />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="line"
                    formatter={(v) => <span className="text-xs text-gray-400">{v}</span>}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Daily Revenue Bar Chart */}
            <div className="rounded-2xl bg-[#0f1129]/80 backdrop-blur-sm border border-white/[0.06] p-5 sm:p-6">
              <h3 className="text-base font-bold text-white mb-4">Revenue (Last 7 Days)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data?.dailyRevenue || []} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="label" tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<DarkTooltip />} />
                  <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="orders" name="Orders" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>

      {/* ═══════ ROW 3: CATEGORY PIE + SALES FUNNEL ═══════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {isLoading ? (
          <>
            <ChartSkeleton />
            <ChartSkeleton />
          </>
        ) : (
          <>
            {/* Category Sales Pie Chart */}
            <div className="rounded-2xl bg-[#0f1129]/80 backdrop-blur-sm border border-white/[0.06] p-5 sm:p-6">
              <h3 className="text-base font-bold text-white mb-4">Category Sales</h3>
              {(data?.categorySales?.length || 0) > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={data.categorySales}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        innerRadius={0}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={{ stroke: "rgba(255,255,255,0.2)" }}
                      >
                        {data.categorySales.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const d = payload[0];
                          return (
                            <div className="bg-[#1a1a3e] border border-white/10 rounded-xl px-4 py-3 shadow-2xl">
                              <p className="text-xs text-gray-400 mb-1">{d.name}</p>
                              <p className="text-sm font-bold text-white">₹{d.value.toLocaleString()}</p>
                              <p className="text-xs text-gray-400">{d.payload.count} items sold</p>
                            </div>
                          );
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Legend table */}
                  <div className="mt-4 space-y-2">
                    {data.categorySales.map((cat, i) => (
                      <div key={cat.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                          <span className="text-xs font-medium" style={{ color: PIE_COLORS[i % PIE_COLORS.length] }}>{cat.name}</span>
                        </div>
                        <span className="text-xs font-bold text-white">₹{cat.value.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500 text-sm">
                  No category sales data yet
                </div>
              )}
            </div>

            {/* Sales Funnel */}
            <div className="rounded-2xl bg-[#0f1129]/80 backdrop-blur-sm border border-white/[0.06] p-5 sm:p-6">
              <h3 className="text-base font-bold text-white mb-6">Sales Funnel</h3>
              {(() => {
                const f = data?.funnel || {};
                const maxVal = Math.max(f.totalProducts || 1, f.totalOrders || 1, f.totalItemsSold || 1, f.deliveredOrders || 1);
                const funnelMax = f.totalProducts || 1;
                const items = [
                  { label: "Products Listed", value: f.totalProducts || 0, color: "#3b82f6", pct: 100 },
                  { label: "Total Orders", value: f.totalOrders || 0, color: "#10b981", pct: f.totalProducts ? Math.round((f.totalOrders / f.totalProducts) * 100) : 0 },
                  { label: "Items Sold", value: f.totalItemsSold || 0, color: "#f59e0b", pct: f.totalProducts ? Math.round((f.totalItemsSold / (f.totalProducts * 10)) * 100) : 0 },
                  { label: "Delivered", value: f.deliveredOrders || 0, color: "#ef4444", pct: f.totalOrders ? Math.round((f.deliveredOrders / f.totalOrders) * 100) : 0 },
                  { label: "Revenue", value: f.totalRevenue || 0, color: "#8b5cf6", pct: 100 },
                ];
                return (
                  <div className="space-y-5">
                    {items.map((item) => (
                      <FunnelBar
                        key={item.label}
                        label={item.label}
                        value={item.label === "Revenue" ? item.value : item.value}
                        percentage={item.pct > 100 ? 100 : item.pct}
                        color={item.color}
                        max={item.label === "Revenue" ? item.value : Math.max(funnelMax, item.value)}
                      />
                    ))}
                  </div>
                );
              })()}
            </div>
          </>
        )}
      </div>

      {/* ═══════ ROW 4: PAYMENT + ORDER STATUS ═══════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {isLoading ? (
          <>
            <ChartSkeleton />
            <ChartSkeleton />
          </>
        ) : (
          <>
            {/* Payment Methods */}
            <div className="rounded-2xl bg-[#0f1129]/80 backdrop-blur-sm border border-white/[0.06] p-5 sm:p-6">
              <h3 className="text-base font-bold text-white mb-4">Payment Analytics</h3>
              {(data?.paymentMethods?.length || 0) > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={data.paymentMethods}
                        cx="50%"
                        cy="50%"
                        outerRadius={85}
                        innerRadius={50}
                        dataKey="value"
                        nameKey="name"
                        paddingAngle={4}
                      >
                        {data.paymentMethods.map((_, i) => (
                          <Cell key={i} fill={i === 0 ? "#f59e0b" : "#3b82f6"} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const d = payload[0];
                          return (
                            <div className="bg-[#1a1a3e] border border-white/10 rounded-xl px-4 py-3 shadow-2xl">
                              <p className="text-xs text-gray-400 mb-1">{d.name}</p>
                              <p className="text-sm font-bold text-white">{d.value} orders</p>
                              <p className="text-xs text-gray-400">₹{d.payload.revenue.toLocaleString()}</p>
                            </div>
                          );
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex items-center justify-center gap-6 mt-2">
                    {data.paymentMethods.map((p, i) => (
                      <div key={p.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: i === 0 ? "#f59e0b" : "#3b82f6" }} />
                        <span className="text-xs text-gray-400">{p.name}</span>
                        <span className="text-xs font-bold text-white">{p.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-52 text-gray-500 text-sm">No payment data yet</div>
              )}
            </div>

            {/* Order Status Distribution */}
            <div className="rounded-2xl bg-[#0f1129]/80 backdrop-blur-sm border border-white/[0.06] p-5 sm:p-6">
              <h3 className="text-base font-bold text-white mb-4">Order Status</h3>
              {(data?.statusDistribution?.length || 0) > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={data.statusDistribution} layout="vertical" barSize={20}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                    <XAxis type="number" tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} width={80} />
                    <Tooltip content={<DarkTooltip />} />
                    <Bar dataKey="value" name="Orders" radius={[0, 6, 6, 0]}>
                      {data.statusDistribution.map((entry) => (
                        <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || "#6b7280"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-52 text-gray-500 text-sm">No order data yet</div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ═══════ ROW 5: TOP PRODUCTS + RECENT ORDERS ═══════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {isLoading ? (
          <>
            <ChartSkeleton />
            <ChartSkeleton />
          </>
        ) : (
          <>
            {/* Top Selling Products */}
            <div className="rounded-2xl bg-[#0f1129]/80 backdrop-blur-sm border border-white/[0.06] p-5 sm:p-6">
              <h3 className="text-base font-bold text-white mb-4">Top Selling Products</h3>
              {(data?.topProducts?.length || 0) > 0 ? (
                <div className="space-y-3">
                  {data.topProducts.map((product, i) => (
                    <div key={product._id || i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-colors">
                      {/* Rank */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        i === 0 ? "bg-yellow-500/20 text-yellow-400" :
                        i === 1 ? "bg-gray-400/20 text-gray-300" :
                        i === 2 ? "bg-orange-500/20 text-orange-400" :
                        "bg-white/[0.06] text-gray-500"
                      }`}>
                        #{i + 1}
                      </div>

                      {/* Image */}
                      <div className="w-10 h-10 rounded-lg bg-white/[0.06] flex-shrink-0 overflow-hidden">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{product.name}</p>
                        <p className="text-[10px] text-gray-500">{product.category}</p>
                      </div>

                      {/* Stats */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-white">₹{product.revenue.toLocaleString()}</p>
                        <p className="text-[10px] text-gray-500">{product.sold} sold</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-52 text-gray-500 text-sm">No sales data yet</div>
              )}
            </div>

            {/* Recent Orders */}
            <div className="rounded-2xl bg-[#0f1129]/80 backdrop-blur-sm border border-white/[0.06] p-5 sm:p-6">
              <h3 className="text-base font-bold text-white mb-4">Recent Orders</h3>
              {(data?.recentOrders?.length || 0) > 0 ? (
                <div className="space-y-3">
                  {data.recentOrders.map((order) => {
                    const statusColors = {
                      pending: "bg-yellow-500/10 text-yellow-400",
                      confirmed: "bg-blue-500/10 text-blue-400",
                      processing: "bg-indigo-500/10 text-indigo-400",
                      shipped: "bg-purple-500/10 text-purple-400",
                      delivered: "bg-emerald-500/10 text-emerald-400",
                      cancelled: "bg-red-500/10 text-red-400",
                    };
                    return (
                      <div key={order.orderNumber} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">{order.orderNumber}</p>
                          <p className="text-[10px] text-gray-500">{order.customer} &middot; {order.itemCount} items</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold text-white">₹{order.total.toLocaleString()}</p>
                          <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${statusColors[order.status] || ""}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-52 text-gray-500 text-sm">No orders yet</div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ═══════ ROW 6: QUICK STATS SUMMARY ═══════ */}
      {!isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Products", value: s.totalProducts || 0, icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4", color: "text-cyan-400" },
            { label: "Reviews", value: s.totalReviews || 0, icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z", color: "text-yellow-400" },
            { label: "Avg Rating", value: s.avgRating?.toFixed(1) || "0.0", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-emerald-400" },
            { label: "Customers", value: s.totalCustomers || 0, icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z", color: "text-purple-400" },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl bg-[#0f1129]/80 backdrop-blur-sm border border-white/[0.06] p-4 flex items-center gap-3">
              <svg className={`w-5 h-5 ${item.color} flex-shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              <div>
                <p className="text-lg font-bold text-white">{typeof item.value === "number" ? item.value.toLocaleString() : item.value}</p>
                <p className="text-[10px] text-gray-500">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
