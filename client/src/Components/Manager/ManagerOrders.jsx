import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  useManagerOrders,
  useManagerOrderStats,
  useManagerUpdateOrderStatus,
} from "../../hooks/useManager";
import { resolveProductImage } from "../../lib/imageMap";
import usePageMeta from "../../hooks/usePageMeta";

const STATUS_CONFIG = {
  pending:    { label: "Pending",    color: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-400" },
  confirmed:  { label: "Confirmed",  color: "bg-blue-100 text-blue-700",     dot: "bg-blue-400" },
  processing: { label: "Processing", color: "bg-indigo-100 text-indigo-700", dot: "bg-indigo-400" },
  shipped:    { label: "Shipped",    color: "bg-purple-100 text-purple-700", dot: "bg-purple-400" },
  delivered:  { label: "Delivered",  color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-400" },
  cancelled:  { label: "Cancelled",  color: "bg-rose-100 text-rose-700",     dot: "bg-rose-400" },
};

const PAYMENT_CONFIG = {
  pending:  { label: "Pending",  color: "bg-yellow-100 text-yellow-700" },
  paid:     { label: "Paid",     color: "bg-emerald-100 text-emerald-700" },
  refunded: { label: "Refunded", color: "bg-rose-100 text-rose-700" },
};

const PAYMENT_LABEL = {
  cod: "COD",
  online: "Online",
  upi: "UPI",
  card: "Card",
  wallet: "Wallet",
};

const STATUS_STEPS = ["pending", "confirmed", "processing", "shipped", "delivered"];

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function PaymentBadge({ status }) {
  const cfg = PAYMENT_CONFIG[status] || PAYMENT_CONFIG.pending;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

export default function ManagerOrders() {
  usePageMeta({ title: "Manage Orders", noIndex: true });
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [viewOrder, setViewOrder] = useState(null);

  const status = params.get("status") || "all";
  const payment = params.get("payment") || "all";

  const { data: orders, isLoading } = useManagerOrders({ status, search, sort, payment });
  const { data: stats } = useManagerOrderStats();
  const updateStatus = useManagerUpdateOrderStatus();

  const setStatus = (next) => {
    const nx = new URLSearchParams(params);
    if (next === "all") nx.delete("status"); else nx.set("status", next);
    setParams(nx, { replace: true });
  };

  const setPayment = (next) => {
    const nx = new URLSearchParams(params);
    if (next === "all") nx.delete("payment"); else nx.set("payment", next);
    setParams(nx, { replace: true });
  };

  // Refresh selected order in modal when list updates
  useEffect(() => {
    if (!viewOrder || !orders) return;
    const refreshed = orders.find((o) => o._id === viewOrder._id);
    if (refreshed) setViewOrder(refreshed);
  }, [orders]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStatusChange = (id, next) => {
    updateStatus.mutate({ id, status: next });
  };

  const counts = {
    all: stats?.totalOrders || 0,
    pending: stats?.pending || 0,
    confirmed: stats?.confirmed || 0,
    processing: stats?.processing || 0,
    shipped: stats?.shipped || 0,
    delivered: stats?.delivered || 0,
    cancelled: stats?.cancelled || 0,
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Filter explanation banner ─ tells the manager why the list is
          smaller than the raw DB count and what they're looking at. */}
      <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 flex items-start gap-3">
        <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="min-w-0">
          <p className="text-xs font-extrabold text-emerald-800">Real orders only</p>
          <p className="text-[11px] text-emerald-700 leading-snug">
            Showing COD orders and prepaid orders where payment is confirmed. Abandoned online carts are hidden.
          </p>
        </div>
      </div>

      {/* Payment-type pills ── flip between COD-only and Prepaid-only views. */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
        {[
          { key: "all",  label: "All Real Orders" },
          { key: "cod",  label: "Cash on Delivery" },
          { key: "paid", label: "Prepaid (Paid)" },
        ].map((p) => {
          const active = payment === p.key;
          return (
            <button
              key={p.key}
              onClick={() => setPayment(p.key)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-colors ${
                active
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-700 hover:border-emerald-300"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order #, name, email, phone…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm placeholder-gray-400 focus:outline-none focus:border-emerald-400 transition-colors"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-emerald-400 cursor-pointer"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="total_high">Total: High → Low</option>
          <option value="total_low">Total: Low → High</option>
        </select>
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
        {["all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled"].map((s) => {
          const active = status === s;
          return (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-extrabold whitespace-nowrap transition-all border ${
                active
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                  : "text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              <span className="capitalize">{s}</span>
              <span className="ml-1.5 text-[10px] opacity-70">({counts[s]})</span>
            </button>
          );
        })}
      </div>

      {/* Mobile cards (< md) */}
      <div className="md:hidden space-y-2.5">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-white border border-gray-200 p-4 animate-pulse">
              <div className="h-4 w-24 bg-gray-200 rounded mb-3" />
              <div className="h-3 w-full bg-gray-200 rounded mb-2" />
              <div className="h-3 w-2/3 bg-gray-200 rounded" />
            </div>
          ))
        ) : orders?.length > 0 ? (
          orders.map((o) => (
            <div key={o._id} className="rounded-2xl bg-white border border-gray-200 p-4 active:bg-gray-50/50 transition-colors">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Order</p>
                  <p className="font-extrabold text-gray-900 text-sm truncate">{o.orderNumber}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <StatusBadge status={o.status} />
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3 pb-3 border-b border-gray-100">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">Customer</p>
                  <p className="text-xs font-bold text-gray-900 truncate">{o.customer.name}</p>
                  <p className="text-[10px] text-gray-500 truncate">{o.customer.phone}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">Items</p>
                  <p className="text-xs font-bold text-gray-900">{o.items.length}</p>
                  <p className="text-[10px] text-gray-500 truncate">
                    {o.items[0]?.name}{o.items.length > 1 ? ` +${o.items.length - 1}` : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap mb-1">
                    <PaymentBadge status={o.paymentStatus} />
                    <span className="text-[10px] font-bold text-gray-500 uppercase">
                      {PAYMENT_LABEL[o.paymentMethod] || "—"}
                    </span>
                  </div>
                  <p className="text-lg font-extrabold text-gray-900 leading-none">₹{o.total}</p>
                </div>
                <button
                  onClick={() => setViewOrder(o)}
                  className="px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-extrabold transition-colors active:bg-emerald-100"
                >
                  Manage →
                </button>
              </div>
            </div>
          ))
        ) : (
          <EmptyState status={status} />
        )}
      </div>

      {/* Desktop table (md+) */}
      <div className="hidden md:block rounded-2xl bg-white border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/40">
                <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs uppercase tracking-wider">Order</th>
                <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs uppercase tracking-wider">Customer</th>
                <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs uppercase tracking-wider">Items</th>
                <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs uppercase tracking-wider hidden lg:table-cell">Payment</th>
                <th className="text-right px-4 py-3 font-bold text-gray-600 text-xs uppercase tracking-wider">Total</th>
                <th className="text-right px-4 py-3 font-bold text-gray-600 text-xs uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-28 bg-gray-200 rounded" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-12 bg-gray-200 rounded" /></td>
                    <td className="px-4 py-3"><div className="h-5 w-20 bg-gray-200 rounded-full" /></td>
                    <td className="px-4 py-3 hidden lg:table-cell"><div className="h-4 w-16 bg-gray-200 rounded" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-16 bg-gray-200 rounded ml-auto" /></td>
                    <td className="px-4 py-3"><div className="h-7 w-16 bg-gray-200 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : orders?.length > 0 ? (
                orders.map((o) => (
                  <tr key={o._id} className="hover:bg-gray-50/40 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-bold text-gray-900 text-xs">{o.orderNumber}</p>
                      <p className="text-[10px] text-gray-400">
                        {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 text-xs truncate max-w-[160px]">{o.customer.name}</p>
                      <p className="text-[10px] text-gray-400 truncate max-w-[160px]">{o.customer.phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-600">{o.items.length}</span>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex flex-col gap-1">
                        <PaymentBadge status={o.paymentStatus} />
                        <span className="text-[10px] text-gray-400 font-bold uppercase">
                          {PAYMENT_LABEL[o.paymentMethod] || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900">₹{o.total}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setViewOrder(o)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-extrabold hover:bg-emerald-100 transition-colors"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              ) : null}
            </tbody>
          </table>
        </div>
        {!isLoading && (!orders || orders.length === 0) && <EmptyState status={status} />}
      </div>

      {/* Modal */}
      {viewOrder && (
        <OrderManageModal
          order={viewOrder}
          onClose={() => setViewOrder(null)}
          onStatusChange={handleStatusChange}
          updating={updateStatus.isPending}
        />
      )}
    </div>
  );
}

/* ── Empty state ── */
function EmptyState({ status }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 py-12 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 mb-3">
        <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      </div>
      <p className="text-sm font-extrabold text-gray-900">No orders found</p>
      <p className="text-xs text-gray-500 mt-1">
        {status !== "all" ? `No ${status} orders right now.` : "Orders will appear here when customers place them."}
      </p>
    </div>
  );
}

/* ── Modal (bottom sheet on mobile, dialog on desktop) ── */
function OrderManageModal({ order, onClose, onStatusChange, updating }) {
  const step = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 sm:px-6 py-4 bg-white border-b border-gray-100">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-600">Manage Order</p>
            <h2 className="text-base sm:text-lg font-extrabold text-gray-900 truncate">{order.orderNumber}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-5 sm:px-6 py-5 space-y-5">
          {/* Tracker */}
          {order.status !== "cancelled" && (
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500 mb-3">Progress</p>
              <div className="relative">
                <div className="absolute top-4 left-4 right-4 h-1 bg-gray-200 rounded-full" />
                <div
                  className="absolute top-4 left-4 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-700"
                  style={{ width: `calc(${(step / (STATUS_STEPS.length - 1)) * 100}% - ${(step / (STATUS_STEPS.length - 1)) * 32}px)` }}
                />
                <ol className="relative grid grid-cols-5 gap-1">
                  {STATUS_STEPS.map((s, i) => {
                    const done = i < step;
                    const active = i === step;
                    return (
                      <li key={s} className="flex flex-col items-center">
                        <span
                          className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                            done
                              ? "bg-emerald-600 text-white"
                              : active
                              ? "bg-teal-500 text-white ring-4 ring-teal-100 animate-pulse"
                              : "bg-gray-200 text-gray-400"
                          }`}
                        >
                          {done ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            i + 1
                          )}
                        </span>
                        <span className={`mt-1.5 text-[10px] font-bold text-center capitalize leading-tight ${done || active ? "text-gray-800" : "text-gray-400"}`}>
                          {s}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>
          )}

          {/* ── Payment confirmation card — prominent so manager
                immediately knows if money has been collected. ── */}
          <PaymentConfirmCard order={order} />

          {/* Status + date row */}
          <div className="flex items-center flex-wrap gap-2">
            <StatusBadge status={order.status} />
            <span className="text-xs text-gray-400 ml-auto">
              {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              {" · "}
              {new Date(order.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>

          {/* Status update grid */}
          <div className="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-4">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 mb-2">Update Status</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.keys(STATUS_CONFIG).map((s) => {
                const isCurrent = order.status === s;
                return (
                  <button
                    key={s}
                    onClick={() => onStatusChange(order._id, s)}
                    disabled={isCurrent || updating}
                    className={`px-3 py-2.5 rounded-xl text-xs font-extrabold transition-all border-2 ${
                      isCurrent
                        ? "border-emerald-500 bg-emerald-500 text-white cursor-default"
                        : "border-gray-200 bg-white text-gray-700 hover:border-emerald-400 hover:text-emerald-700 disabled:opacity-50"
                    }`}
                  >
                    {STATUS_CONFIG[s].label}
                    {isCurrent && " ✓"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Customer + Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <DetailBox title="Customer">
              <p className="text-sm font-extrabold text-gray-900">{order.customer.name}</p>
              <p className="text-xs text-gray-500 mt-0.5 truncate">{order.customer.email}</p>
              <p className="text-xs text-gray-500">{order.customer.phone}</p>
              <a
                href={`tel:${order.customer.phone}`}
                className="inline-flex items-center gap-1 mt-2 text-xs font-extrabold text-emerald-600 hover:underline"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call Customer
              </a>
            </DetailBox>
            <DetailBox title="Delivery Address">
              <p className="text-sm text-gray-800 leading-snug">
                {order.shippingAddress.address},<br />
                {order.shippingAddress.city}, {order.shippingAddress.state} – {order.shippingAddress.pincode}
              </p>
            </DetailBox>
          </div>

          {/* Items */}
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500 mb-2">
              Items ({order.items.length})
            </p>
            <ul className="space-y-2">
              {order.items.map((it, i) => (
                <li key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <img
                    src={resolveProductImage(it)}
                    alt={it.name}
                    loading="lazy"
                    className="w-11 h-11 rounded-lg object-contain bg-white border border-gray-200 p-1 flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-gray-900 truncate">{it.name}</p>
                    <p className="text-[11px] text-gray-500">
                      {it.category} · Qty {it.quantity} × ₹{it.price}
                    </p>
                  </div>
                  <span className="text-sm font-extrabold text-gray-900 flex-shrink-0">
                    ₹{it.price * it.quantity}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Totals */}
          <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-bold text-gray-900">₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery</span>
              <span className="font-bold">
                {order.deliveryFee === 0 ? <span className="text-green-600">FREE</span> : `₹${order.deliveryFee}`}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="font-extrabold text-gray-900">Total</span>
              <span className="font-extrabold text-gray-900 text-base">₹{order.total}</span>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 mb-1">Notes</p>
              <p className="text-xs text-amber-900 leading-relaxed">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailBox({ title, children }) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3.5">
      <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-2">{title}</p>
      {children}
    </div>
  );
}

/* ── Prominent Payment Confirmation Card ────────────────────────
   Answers "is payment confirmed?" at a glance:
   - GREEN  → payment confirmed, money in
   - AMBER  → payment pending (COD or awaiting confirmation)
   - ROSE   → refunded (cancelled paid order)
*/
function PaymentConfirmCard({ order }) {
  const status = order.paymentStatus;
  const method = order.paymentMethod;
  const isPaid = status === "paid";
  const isRefunded = status === "refunded";
  const isCOD = method === "cod";

  const cfg = isRefunded
    ? {
        wrap: "from-rose-500 via-rose-600 to-rose-700",
        accent: "text-rose-100",
        label: "Payment Refunded",
        message: "Money returned to customer.",
        icon: (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.4}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        ),
      }
    : isPaid
    ? {
        wrap: "from-emerald-500 via-emerald-600 to-teal-600",
        accent: "text-emerald-100",
        label: "Payment Confirmed",
        message: "Money received successfully.",
        icon: (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.6}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ),
      }
    : isCOD
    ? {
        wrap: "from-amber-400 via-orange-500 to-amber-600",
        accent: "text-amber-50",
        label: "Cash on Delivery",
        message: `Collect ₹${order.total} from customer on delivery.`,
        icon: (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V4m0 14v2m6-6a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      }
    : {
        wrap: "from-yellow-400 via-yellow-500 to-amber-500",
        accent: "text-yellow-50",
        label: "Payment Pending",
        message: "Awaiting confirmation from gateway.",
        icon: (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      };

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${cfg.wrap} p-4 sm:p-5 text-white shadow-lg`}>
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="relative flex items-start gap-3">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
          {cfg.icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className={`text-[10px] uppercase tracking-wider font-extrabold ${cfg.accent} leading-none`}>
            {PAYMENT_LABEL[method] || method?.toUpperCase() || "—"}
          </p>
          <h3 className="text-base sm:text-lg font-extrabold mt-1 leading-tight">{cfg.label}</h3>
          <p className="text-xs sm:text-sm text-white/85 mt-0.5 leading-tight">{cfg.message}</p>
          <div className="flex items-end justify-between gap-3 mt-3 pt-3 border-t border-white/20">
            <div>
              <p className="text-[10px] text-white/70 font-bold uppercase tracking-wider">Amount</p>
              <p className="text-2xl sm:text-3xl font-extrabold leading-none">₹{order.total}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-white/70 font-bold uppercase tracking-wider">Status</p>
              <p className="text-xs font-extrabold uppercase tracking-wider">{status}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
