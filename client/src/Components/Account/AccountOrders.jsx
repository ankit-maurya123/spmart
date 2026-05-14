import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMyOrders } from "../../hooks/useOrders";
import { resolveProductImage } from "../../lib/imageMap";
import usePageMeta from "../../hooks/usePageMeta";

const STATUS_FILTERS = [
  { key: "all",       label: "All" },
  { key: "pending",   label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "processing",label: "Processing" },
  { key: "shipped",   label: "Shipped" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

const STATUS_PILL = {
  pending:    "bg-yellow-100 text-yellow-800",
  confirmed:  "bg-blue-100 text-blue-800",
  processing: "bg-violet-100 text-violet-800",
  shipped:    "bg-cyan-100 text-cyan-800",
  delivered:  "bg-green-100 text-green-800",
  cancelled:  "bg-rose-100 text-rose-800",
};

const AccountOrders = () => {
  usePageMeta({ title: "My Orders", noIndex: true });
  const { data: orders, isLoading } = useMyOrders();
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    if (!orders) return [];
    if (filter === "all") return orders;
    return orders.filter((o) => o.status === filter);
  }, [orders, filter]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">My Orders</h1>
          <p className="text-sm text-gray-500">
            {orders ? `${orders.length} total order${orders.length !== 1 ? "s" : ""}` : "Loading…"}
          </p>
        </div>
      </div>

      {/* Status filter pills */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
        {STATUS_FILTERS.map((s) => {
          const active = filter === s.key;
          return (
            <button
              key={s.key}
              onClick={() => setFilter(s.key)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-colors ${
                active
                  ? "bg-violet-600 text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-700 hover:border-violet-300"
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl p-4 animate-pulse">
              <div className="h-5 w-40 bg-gray-200 rounded mb-3" />
              <div className="h-4 w-2/3 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-1/2 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filtered.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
          <p className="text-5xl mb-3">📦</p>
          <h3 className="text-base font-extrabold text-gray-900">
            {filter === "all" ? "No orders yet" : `No ${filter} orders`}
          </h3>
          <p className="text-sm text-gray-500 mt-1 mb-5">
            {filter === "all"
              ? "Start shopping to see your orders here."
              : "Try a different filter to see more orders."}
          </p>
          <Link
            to="/store"
            className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-extrabold text-sm rounded-full"
          >
            Continue Shopping
          </Link>
        </div>
      )}

      {/* Orders list */}
      {!isLoading && filtered.length > 0 && (
        <ul className="space-y-3">
          {filtered.map((o) => (
            <li key={o._id}>
              <Link
                to={`/order-confirmation/${o.orderNumber}`}
                className="block bg-white border border-gray-200 hover:border-violet-300 hover:shadow-md rounded-2xl p-4 sm:p-5 transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Order</p>
                    <p className="text-sm sm:text-base font-extrabold text-gray-900 truncate">{o.orderNumber}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Placed on {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-1 rounded-full whitespace-nowrap ${STATUS_PILL[o.status] || "bg-gray-100 text-gray-700"}`}>
                    {o.status}
                  </span>
                </div>

                {/* Items preview */}
                <div className="flex items-center gap-2 mb-3">
                  {(o.items || []).slice(0, 4).map((it, i) => (
                    <div key={i} className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gray-50 border border-gray-200 overflow-hidden flex-shrink-0">
                      <img
                        src={resolveProductImage(it)}
                        alt={it.name}
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                  ))}
                  {(o.items?.length || 0) > 4 && (
                    <span className="text-xs font-bold text-gray-500">+{o.items.length - 4}</span>
                  )}
                </div>

                <div className="flex items-end justify-between gap-3 pt-3 border-t border-gray-100">
                  <div>
                    <p className="text-[11px] text-gray-500">
                      {o.items?.length || 0} item{o.items?.length !== 1 ? "s" : ""} ·{" "}
                      <span className="capitalize">{o.paymentMethod}</span>
                    </p>
                    <p className="text-base sm:text-lg font-extrabold text-gray-900 leading-none mt-0.5">
                      ₹{o.total}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-extrabold text-violet-600">
                    Track Order
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AccountOrders;
