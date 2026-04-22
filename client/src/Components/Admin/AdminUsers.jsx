import { useState } from "react";
import { useAllUsers, useUserStats, useUserDetail, useDeleteUser } from "../../hooks/useAdmin";

// --- Stat Card ---
function StatCard({ label, value, icon, color, sub }) {
  return (
    <div className="bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm rounded-2xl border border-gray-200/60 dark:border-white/[0.06] p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
          </svg>
        </div>
      </div>
      <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

// --- Skeleton Row ---
function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {[...Array(6)].map((_, i) => (
        <td key={i} className="px-4 py-4">
          <div className="h-4 bg-gray-200 dark:bg-white/[0.06] rounded-lg w-3/4" />
        </td>
      ))}
    </tr>
  );
}

// --- User Detail Modal ---
function UserDetailModal({ userId, onClose }) {
  const { data, isLoading } = useUserDetail(userId);

  if (!userId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-[#12122a] rounded-3xl border border-gray-200/60 dark:border-white/[0.08] w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors z-10"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {isLoading ? (
          <div className="p-8 flex items-center justify-center">
            <svg className="w-8 h-8 animate-spin text-cyan-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : data ? (
          <div className="p-6">
            {/* User Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                {data.user.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">{data.user.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{data.user.email}</p>
                {data.user.phone && (
                  <p className="text-xs text-gray-400 mt-0.5">{data.user.phone}</p>
                )}
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-gray-50 dark:bg-white/[0.04] rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-gray-900 dark:text-white">{data.stats.totalOrders}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Orders</p>
              </div>
              <div className="bg-gray-50 dark:bg-white/[0.04] rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  ₹{Math.round(data.stats.totalSpent).toLocaleString()}
                </p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Spent</p>
              </div>
              <div className="bg-gray-50 dark:bg-white/[0.04] rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  ₹{Math.round(data.stats.avgOrder).toLocaleString()}
                </p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Avg Order</p>
              </div>
            </div>

            {/* Account Info */}
            <div className="space-y-3 mb-6">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Account Info</h3>
              <div className="bg-gray-50 dark:bg-white/[0.04] rounded-xl p-4 space-y-2.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">User ID</span>
                  <span className="font-mono text-xs text-gray-700 dark:text-gray-300">{data.user._id}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Joined</span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {new Date(data.user.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric"
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Last Updated</span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {new Date(data.user.updatedAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric"
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            {data.orders.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Recent Orders
                </h3>
                <div className="space-y-2">
                  {data.orders.map((order) => (
                    <div
                      key={order._id}
                      className="flex items-center justify-between bg-gray-50 dark:bg-white/[0.04] rounded-xl px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{order.orderNumber}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric"
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">₹{order.total}</p>
                        <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                          order.status === "delivered"
                            ? "bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400"
                            : order.status === "cancelled"
                            ? "bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400"
                            : order.status === "shipped"
                            ? "bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400"
                            : "bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

// --- Main Page ---
export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const { data: stats, isLoading: statsLoading } = useUserStats();
  const { data, isLoading } = useAllUsers({ search, sort, page, limit: 15 });
  const deleteUser = useDeleteUser();

  const handleDelete = async (userId) => {
    try {
      await deleteUser.mutateAsync(userId);
      setDeleteConfirm(null);
    } catch {
      // ignore
    }
  };

  const statCards = [
    {
      label: "Total Users",
      value: stats?.totalUsers ?? "—",
      icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
      color: "bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
    },
    {
      label: "New This Month",
      value: stats?.newThisMonth ?? "—",
      icon: "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z",
      color: "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400",
      sub: stats?.lastMonth !== undefined
        ? `${stats.lastMonth} last month`
        : undefined,
    },
    {
      label: "Active Buyers",
      value: stats?.activeUsers ?? "—",
      icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z",
      color: "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400",
      sub: "Users with orders",
    },
    {
      label: "Conversion Rate",
      value:
        stats?.totalUsers && stats?.activeUsers
          ? `${Math.round((stats.activeUsers / stats.totalUsers) * 100)}%`
          : "—",
      icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
      color: "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400",
      sub: "Signup → Purchase",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) =>
          statsLoading ? (
            <div key={s.label} className="bg-white/80 dark:bg-white/[0.04] rounded-2xl border border-gray-200/60 dark:border-white/[0.06] p-5 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-white/[0.06] rounded w-20 mb-3" />
              <div className="h-7 bg-gray-200 dark:bg-white/[0.06] rounded w-16" />
            </div>
          ) : (
            <StatCard key={s.label} {...s} />
          )
        )}
      </div>

      {/* Search & Sort Bar */}
      <div className="bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm rounded-2xl border border-gray-200/60 dark:border-white/[0.06] p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name, email, or phone..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.1] text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 transition-all"
            />
          </div>
          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.1] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-cyan-400 transition-all cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name A-Z</option>
            <option value="email">Email A-Z</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm rounded-2xl border border-gray-200/60 dark:border-white/[0.06] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200/60 dark:border-white/[0.06]">
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">Phone</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Joined</th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Orders</th>
                <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">Spent</th>
                <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
              {isLoading ? (
                [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
              ) : data?.users?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-white/[0.06] mb-3">
                      <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">No users found</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {search ? "Try a different search term" : "No users have registered yet"}
                    </p>
                  </td>
                </tr>
              ) : (
                data?.users?.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-gray-50/80 dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
                    onClick={() => setSelectedUser(user._id)}
                  >
                    {/* User */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {user.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    {/* Phone */}
                    <td className="px-4 py-3.5 text-gray-600 dark:text-gray-300 hidden sm:table-cell">
                      {user.phone || <span className="text-gray-300 dark:text-gray-600">—</span>}
                    </td>
                    {/* Joined */}
                    <td className="px-4 py-3.5 text-gray-600 dark:text-gray-300 hidden md:table-cell">
                      {new Date(user.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric"
                      })}
                    </td>
                    {/* Orders */}
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 rounded-full text-xs font-bold ${
                        user.orders > 0
                          ? "bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400"
                          : "bg-gray-100 dark:bg-white/[0.06] text-gray-400"
                      }`}>
                        {user.orders}
                      </span>
                    </td>
                    {/* Spent */}
                    <td className="px-4 py-3.5 text-right font-semibold text-gray-900 dark:text-white hidden sm:table-cell">
                      {user.totalSpent > 0 ? `₹${Math.round(user.totalSpent).toLocaleString()}` : "—"}
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedUser(user._id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 transition-colors"
                          title="View Details"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(user)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                          title="Delete User"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3.5 border-t border-gray-200/60 dark:border-white/[0.06]">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Showing {((page - 1) * 15) + 1}–{Math.min(page * 15, data.total)} of {data.total} users
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              {[...Array(data.pages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold transition-colors ${
                    page === i + 1
                      ? "bg-cyan-500 text-white"
                      : "text-gray-500 hover:bg-gray-100 dark:hover:bg-white/[0.06]"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                disabled={page === data.pages}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal userId={selectedUser} onClose={() => setSelectedUser(null)} />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white dark:bg-[#12122a] rounded-2xl border border-gray-200/60 dark:border-white/[0.08] w-full max-w-sm p-6 shadow-2xl">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Delete User</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Are you sure you want to delete
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-5">
                {deleteConfirm.name} ({deleteConfirm.email})?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.1] text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm._id)}
                  disabled={deleteUser.isPending}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {deleteUser.isPending ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
