import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400", dot: "bg-yellow-400" },
  confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400", dot: "bg-blue-400" },
  processing: { label: "Processing", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400", dot: "bg-indigo-400" },
  shipped: { label: "Shipped", color: "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400", dot: "bg-purple-400" },
  delivered: { label: "Delivered", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400", dot: "bg-emerald-400" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400", dot: "bg-red-400" },
};

const PAYMENT_CONFIG = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400" },
  paid: { label: "Paid", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" },
  refunded: { label: "Refunded", color: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400" },
};

const STATUS_STEPS = ["pending", "confirmed", "processing", "shipped", "delivered"];

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function PaymentBadge({ status }) {
  const cfg = PAYMENT_CONFIG[status] || PAYMENT_CONFIG.pending;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

function StatCard({ icon, label, value, color, sub }) {
  return (
    <div className="rounded-2xl bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm border border-gray-200/60 dark:border-white/[0.06] p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
          {sub && <p className="text-[10px] text-gray-400">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

function OrderDetailModal({ order, onClose, onStatusChange, updating }) {
  if (!order) return null;

  const currentStep = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-[#0e0e24] border border-gray-200/60 dark:border-white/[0.06] shadow-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200/60 dark:border-white/[0.06]">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Order {order.orderNumber}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {new Date(order.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Status tracker */}
          {order.status !== "cancelled" && (
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">Order Progress</p>
              <div className="flex items-center justify-between relative">
                <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 dark:bg-white/10" />
                <div className="absolute top-4 left-0 h-0.5 bg-emerald-500 transition-all duration-500" style={{ width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` }} />
                {STATUS_STEPS.map((step, i) => (
                  <div key={step} className="relative flex flex-col items-center z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      i <= currentStep ? "bg-emerald-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-400"
                    }`}>
                      {i < currentStep ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      ) : (
                        i + 1
                      )}
                    </div>
                    <span className={`text-[10px] mt-1.5 capitalize ${i <= currentStep ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-gray-400"}`}>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status + Payment row */}
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={order.status} />
            <PaymentBadge status={order.paymentStatus} />
            <span className="text-xs text-gray-500 capitalize">
              {order.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}
            </span>
          </div>

          {/* Update Status */}
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Update Status</p>
            <div className="flex flex-wrap gap-2">
              {Object.keys(STATUS_CONFIG).map((s) => (
                <button
                  key={s}
                  onClick={() => onStatusChange(order._id, s)}
                  disabled={order.status === s || updating}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    order.status === s
                      ? "bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-500/30"
                      : "text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/[0.1] hover:border-cyan-400 hover:text-cyan-600 disabled:opacity-40"
                  }`}
                >
                  {STATUS_CONFIG[s].label}
                </button>
              ))}
            </div>
          </div>

          {/* Customer + Shipping */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.04] p-4">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Customer</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{order.customer.name}</p>
              <p className="text-xs text-gray-500 mt-1">{order.customer.email}</p>
              <p className="text-xs text-gray-500">{order.customer.phone}</p>
            </div>
            <div className="rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.04] p-4">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Shipping Address</p>
              <p className="text-sm text-gray-900 dark:text-white">{order.shippingAddress.address}</p>
              <p className="text-xs text-gray-500 mt-1">{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Items ({order.items.length})</p>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.04] p-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-white/[0.06] flex-shrink-0 overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.name}</p>
                    <p className="text-[10px] text-gray-500">{item.category} &middot; Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white flex-shrink-0">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.04] p-4 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>₹{order.subtotal}</span></div>
            <div className="flex justify-between text-gray-500">
              <span>Delivery</span>
              <span>{order.deliveryFee === 0 ? <span className="text-green-500">FREE</span> : `₹${order.deliveryFee}`}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 dark:text-white text-base border-t border-gray-200 dark:border-white/[0.06] pt-2">
              <span>Total</span><span>₹{order.total}</span>
            </div>
          </div>

          {order.notes && (
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Customer Notes</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-white/[0.03] rounded-xl p-3 border border-gray-100 dark:border-white/[0.04]">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-200/60 dark:border-white/[0.06]">
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function TableSkeleton() {
  return Array.from({ length: 6 }).map((_, i) => (
    <tr key={i} className="animate-pulse">
      <td className="px-4 py-3"><div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" /></td>
      <td className="px-4 py-3 hidden sm:table-cell"><div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded" /></td>
      <td className="px-4 py-3 hidden md:table-cell"><div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" /></td>
      <td className="px-4 py-3"><div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" /></td>
      <td className="px-4 py-3 hidden lg:table-cell"><div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" /></td>
      <td className="px-4 py-3 hidden lg:table-cell"><div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" /></td>
      <td className="px-4 py-3"><div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded ml-auto" /></td>
    </tr>
  ));
}

export default function AdminOrders() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewOrder, setViewOrder] = useState(null);

  // Fetch orders
  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin", "orders", statusFilter, search, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search) params.set("search", search);
      if (sortBy === "oldest") params.set("sort", "oldest");
      else if (sortBy === "total_high") params.set("sort", "total_high");
      else if (sortBy === "total_low") params.set("sort", "total_low");

      const { data } = await axios.get(`/api/admin/orders?${params}`);
      return data;
    },
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ["admin", "orders", "stats"],
    queryFn: async () => {
      const { data } = await axios.get("/api/admin/orders/stats");
      return data;
    },
  });

  // Update order status
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }) => {
      const { data } = await axios.put(`/api/admin/orders/${id}/status`, { status });
      return data;
    },
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      setViewOrder(updatedOrder);
    },
  });

  // Delete order
  const deleteOrder = useMutation({
    mutationFn: async (id) => {
      await axios.delete(`/api/admin/orders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
  });

  const handleStatusChange = (id, status) => {
    updateStatus.mutate({ id, status });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      deleteOrder.mutate(id, {
        onSuccess: () => setViewOrder(null),
      });
    }
  };

  const statusCounts = {
    all: stats?.totalOrders || 0,
    pending: stats?.pending || 0,
    confirmed: stats?.confirmed || 0,
    processing: stats?.processing || 0,
    shipped: stats?.shipped || 0,
    delivered: stats?.delivered || 0,
    cancelled: stats?.cancelled || 0,
  };

  return (
    <div className="space-y-5">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={<svg className="w-5 h-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
          label="Total Orders"
          value={stats?.totalOrders || 0}
          color="bg-cyan-50 dark:bg-cyan-500/10"
          sub={`${stats?.todayOrders || 0} today`}
        />
        <StatCard
          icon={<svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          label="Revenue"
          value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`}
          color="bg-emerald-50 dark:bg-emerald-500/10"
          sub={`Avg ₹${stats?.avgOrderValue || 0}`}
        />
        <StatCard
          icon={<svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          label="Pending"
          value={stats?.pending || 0}
          color="bg-yellow-50 dark:bg-yellow-500/10"
        />
        <StatCard
          icon={<svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>}
          label="Shipped"
          value={(stats?.shipped || 0) + (stats?.delivered || 0)}
          color="bg-purple-50 dark:bg-purple-500/10"
          sub={`${stats?.delivered || 0} delivered`}
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search order, name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.1] text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition-colors"
          />
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.1] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="total_high">Total: High → Low</option>
          <option value="total_low">Total: Low → High</option>
        </select>

        <span className="text-sm text-gray-500 dark:text-gray-400 ml-auto hidden sm:block">
          {orders?.length || 0} order{(orders?.length || 0) !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {["all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
              statusFilter === s
                ? "bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-500/30"
                : "text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/[0.08] hover:bg-gray-50 dark:hover:bg-white/[0.04]"
            }`}
          >
            <span className="capitalize">{s === "all" ? "All" : s}</span>
            <span className="ml-1.5 text-[10px] opacity-70">({statusCounts[s]})</span>
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm border border-gray-200/60 dark:border-white/[0.06] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200/60 dark:border-white/[0.06]">
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Order</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 hidden sm:table-cell">Customer</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 hidden md:table-cell">Items</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 hidden lg:table-cell">Payment</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400 hidden lg:table-cell">Total</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/60 dark:divide-white/[0.06]">
              {isLoading ? (
                <TableSkeleton />
              ) : orders?.length > 0 ? (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-xs">{order.orderNumber}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-xs truncate max-w-[140px]">{order.customer.name}</p>
                        <p className="text-[10px] text-gray-400 truncate max-w-[140px]">{order.customer.phone}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex flex-col gap-1">
                        <PaymentBadge status={order.paymentStatus} />
                        <span className="text-[10px] text-gray-400 capitalize">{order.paymentMethod === "cod" ? "COD" : "Online"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-right">
                      <span className="font-bold text-gray-900 dark:text-white">₹{order.total}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewOrder(order)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 transition-colors"
                          title="View order"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(order._id)}
                          disabled={deleteOrder.isPending}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-50"
                          title="Delete order"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : null}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {!isLoading && (!orders || orders.length === 0) && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-white/[0.06] mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">No orders found</p>
            <p className="text-sm text-gray-400 mt-1">
              {statusFilter !== "all" ? "Try a different filter." : "Orders will appear here when customers place them."}
            </p>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {viewOrder && (
        <OrderDetailModal
          order={viewOrder}
          onClose={() => setViewOrder(null)}
          onStatusChange={handleStatusChange}
          updating={updateStatus.isPending}
        />
      )}
    </div>
  );
}
