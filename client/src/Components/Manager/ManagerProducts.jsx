import { useState } from "react";
import { Link } from "react-router-dom";
import {
  useManagerProducts,
  useManagerCategories,
  useManagerProductOrders,
} from "../../hooks/useManager";
import { resolveProductImage } from "../../lib/imageMap";
import usePageMeta from "../../hooks/usePageMeta";

const STATUS_PILL = {
  pending:    "bg-yellow-100 text-yellow-700",
  confirmed:  "bg-blue-100 text-blue-700",
  processing: "bg-indigo-100 text-indigo-700",
  shipped:    "bg-purple-100 text-purple-700",
  delivered:  "bg-emerald-100 text-emerald-700",
  cancelled:  "bg-rose-100 text-rose-700",
};
const PAYMENT_PILL = {
  paid:     "bg-emerald-100 text-emerald-700",
  pending:  "bg-amber-100 text-amber-700",
  refunded: "bg-rose-100 text-rose-700",
};
const PAYMENT_LABEL = { cod: "COD", online: "Online", upi: "UPI", card: "Card", wallet: "Wallet" };

const STOCK_FILTERS = [
  { key: "",    label: "All Stock" },
  { key: "in",  label: "In Stock" },
  { key: "low", label: "Low (≤5)" },
  { key: "out", label: "Out of Stock" },
];

export default function ManagerProducts() {
  usePageMeta({ title: "Products (View)", noIndex: true });

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [stock, setStock] = useState("");
  const [viewProduct, setViewProduct] = useState(null);

  const { data: products, isLoading } = useManagerProducts({
    search: search.trim() || undefined,
    category: category === "all" ? undefined : category,
    stock: stock || undefined,
  });
  const { data: categories } = useManagerCategories();

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* View-only notice */}
      <div className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 flex items-start gap-3">
        <span className="text-base flex-shrink-0">👁️</span>
        <div className="min-w-0">
          <p className="text-xs font-extrabold text-amber-800">View-Only Mode</p>
          <p className="text-[11px] text-amber-700 leading-snug">
            You can browse, search and check stock — but only the admin can add, edit, or delete products.
          </p>
        </div>
      </div>

      {/* Search + Category */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm placeholder-gray-400 focus:outline-none focus:border-emerald-400 transition-colors"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-emerald-400 cursor-pointer min-w-[160px]"
        >
          <option value="all">All Categories</option>
          {categories?.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Stock filter pills */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
        {STOCK_FILTERS.map((f) => {
          const active = stock === f.key;
          return (
            <button
              key={f.key || "all"}
              onClick={() => setStock(f.key)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-colors ${
                active
                  ? "bg-emerald-600 text-white"
                  : "bg-white border border-gray-200 text-gray-700 hover:border-emerald-300"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Results count */}
      {!isLoading && (
        <p className="text-xs text-gray-500">
          Showing <span className="font-bold text-gray-900">{products?.length || 0}</span> product{products?.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {isLoading
          ? Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-100" />
                <div className="p-3 space-y-2">
                  <div className="h-3 w-2/3 bg-gray-100 rounded" />
                  <div className="h-3 w-1/2 bg-gray-100 rounded" />
                  <div className="h-5 w-16 bg-gray-100 rounded" />
                </div>
              </div>
            ))
          : products?.length > 0
          ? products.map((p) => {
              const s = typeof p.stock === "number" ? p.stock : 100;
              const isOut = s === 0;
              const isLow = s > 0 && s <= 5;
              return (
                <button
                  key={p._id}
                  type="button"
                  onClick={() => setViewProduct(p)}
                  className="text-left bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-emerald-300 transition-all flex flex-col"
                >
                  <div className="relative aspect-square bg-white overflow-hidden">
                    <img
                      src={resolveProductImage(p)}
                      alt={p.name}
                      loading="lazy"
                      className={`w-full h-full object-contain p-2 ${isOut ? "grayscale opacity-70" : ""}`}
                    />
                    {/* Stock badge */}
                    <span
                      className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider ${
                        isOut
                          ? "bg-rose-100 text-rose-700"
                          : isLow
                          ? "bg-amber-100 text-amber-700 animate-pulse"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {isOut ? "Out of Stock" : isLow ? `Only ${s} left` : `${s} in stock`}
                    </span>
                  </div>
                  <div className="p-2.5 flex-1 flex flex-col">
                    <p className="text-[10px] text-gray-400 truncate">{p.category}</p>
                    <p className="text-xs font-bold text-gray-900 line-clamp-2 min-h-[2.2em] mt-0.5">{p.name}</p>
                    <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-gray-100">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-extrabold text-white bg-emerald-600">
                        ₹{p.price}
                      </span>
                      {p.weight && (
                        <span className="text-[10px] text-gray-500 truncate">{p.weight}</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          : null}
      </div>

      {!isLoading && (!products || products.length === 0) && (
        <div className="bg-white rounded-2xl border border-gray-200 py-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 mb-3">
            <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-sm font-extrabold text-gray-900">No products match</p>
          <p className="text-xs text-gray-500 mt-1">Try a different search or filter.</p>
        </div>
      )}

      {/* Product detail modal */}
      {viewProduct && (
        <ProductViewModal product={viewProduct} onClose={() => setViewProduct(null)} />
      )}
    </div>
  );
}

/* ── Product View Modal ── */
function ProductViewModal({ product, onClose }) {
  const s = typeof product.stock === "number" ? product.stock : 100;
  const isOut = s === 0;
  const isLow = s > 0 && s <= 5;

  // Fetch related order data — units sold, revenue, last orders.
  const { data: orderData, isLoading: ordersLoading } = useManagerProductOrders(product._id);

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-white border-b border-gray-100">
          <h2 className="text-base font-extrabold text-gray-900 truncate pr-3">{product.name}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600 flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Image */}
          <div className="relative aspect-square w-full max-w-[260px] mx-auto rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 overflow-hidden">
            <img
              src={resolveProductImage(product)}
              alt={product.name}
              className={`w-full h-full object-contain p-4 ${isOut ? "grayscale opacity-70" : ""}`}
            />
          </div>

          {/* Stock highlight */}
          <div className={`rounded-2xl p-4 border-2 ${
            isOut
              ? "bg-rose-50 border-rose-200"
              : isLow
              ? "bg-amber-50 border-amber-200"
              : "bg-emerald-50 border-emerald-200"
          }`}>
            <p className={`text-[10px] font-extrabold uppercase tracking-wider mb-1 ${
              isOut ? "text-rose-700" : isLow ? "text-amber-700" : "text-emerald-700"
            }`}>
              Stock Status
            </p>
            <p className={`text-2xl font-extrabold leading-none ${
              isOut ? "text-rose-700" : isLow ? "text-amber-700" : "text-emerald-700"
            }`}>
              {isOut ? "Out of Stock" : `${s} unit${s !== 1 ? "s" : ""}`}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {isOut
                ? "Notify admin to restock this item."
                : isLow
                ? "Running low — restock soon."
                : "Healthy stock level."}
            </p>
          </div>

          {/* ── Sales summary (real, live data) ── */}
          <SalesSummary data={orderData} loading={ordersLoading} />

          {/* Specs */}
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <Spec label="Price" value={`₹${product.price}`} bold />
            {product.oldPrice && <Spec label="MRP" value={`₹${product.oldPrice}`} strike />}
            <Spec label="Category" value={product.category} />
            {product.brand && <Spec label="Brand" value={product.brand} />}
            {product.weight && <Spec label="Pack" value={product.weight} />}
            {product.deliveryTime && <Spec label="Delivery" value={product.deliveryTime} />}
            <Spec label="Rating" value={`${product.rating?.toFixed(1) || "0.0"} ★`} />
            <Spec label="Item Code" value={product._id?.slice(-8).toUpperCase()} mono />
          </dl>

          {product.description && (
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500 mb-1">Description</p>
              <p className="text-sm text-gray-700 leading-relaxed">{product.description}</p>
            </div>
          )}

          {product.tags?.length > 0 && (
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500 mb-2">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {product.tags.map((t) => (
                  <span key={t} className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-100">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── Recent orders containing this product ── */}
          <RecentOrdersForProduct data={orderData} loading={ordersLoading} />
        </div>
      </div>
    </div>
  );
}

/* ── Sales summary card ── */
function SalesSummary({ data, loading }) {
  if (loading) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 p-4 animate-pulse">
        <div className="h-3 w-24 bg-emerald-100 rounded mb-3" />
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-2.5 w-12 bg-emerald-100 rounded" />
              <div className="h-5 w-16 bg-emerald-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  const d = data || {};
  return (
    <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 p-4">
      <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 mb-3">
        Sales Summary
      </p>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="text-[10px] text-gray-500 font-bold uppercase">Units Sold</p>
          <p className="text-lg font-extrabold text-gray-900 leading-none mt-0.5">{d.unitsSold || 0}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-500 font-bold uppercase">Revenue</p>
          <p className="text-lg font-extrabold text-emerald-700 leading-none mt-0.5">
            ₹{(d.revenue || 0).toLocaleString("en-IN")}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-gray-500 font-bold uppercase">Orders</p>
          <p className="text-lg font-extrabold text-gray-900 leading-none mt-0.5">{d.ordersCount || 0}</p>
        </div>
      </div>
      {d.lastSoldAt && (
        <p className="text-[11px] text-gray-500 mt-3 pt-3 border-t border-emerald-100">
          Last sold{" "}
          <span className="font-bold text-gray-800">
            {new Date(d.lastSoldAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        </p>
      )}
    </div>
  );
}

/* ── Recent orders for this product ── */
function RecentOrdersForProduct({ data, loading }) {
  if (loading) {
    return (
      <div>
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500 mb-2">
          Recent Orders
        </p>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const orders = data?.orders || [];
  if (orders.length === 0) {
    return (
      <div>
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500 mb-2">
          Recent Orders
        </p>
        <div className="rounded-xl bg-gray-50 border border-dashed border-gray-200 p-4 text-center">
          <p className="text-xs text-gray-500">No orders yet for this product.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500">
          Recent Orders ({orders.length})
        </p>
        <Link to="/manager/orders" className="text-[10px] font-extrabold text-emerald-600 hover:underline">
          All →
        </Link>
      </div>
      <ul className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {orders.map((o) => (
          <li key={o._id}>
            <Link
              to={`/manager/orders?search=${encodeURIComponent(o.orderNumber)}`}
              onClick={(e) => e.stopPropagation()}
              className="block rounded-xl border border-gray-100 hover:border-emerald-300 hover:bg-emerald-50/30 transition-colors p-3"
            >
              <div className="flex items-start justify-between gap-3 mb-1.5">
                <div className="min-w-0">
                  <p className="text-xs font-extrabold text-gray-900 truncate">{o.orderNumber}</p>
                  <p className="text-[10px] text-gray-500 truncate">
                    {o.customer?.name || "Customer"}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-extrabold text-gray-900 leading-none">
                    ₹{o.line?.subtotal || 0}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    {o.line?.quantity || 0} × ₹{o.line?.price || 0}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${STATUS_PILL[o.status] || "bg-gray-100 text-gray-700"}`}>
                  {o.status}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${PAYMENT_PILL[o.paymentStatus] || "bg-gray-100 text-gray-700"}`}>
                  {o.paymentStatus}
                </span>
                <span className="text-[9px] font-bold text-gray-500 uppercase">
                  {PAYMENT_LABEL[o.paymentMethod] || "—"}
                </span>
                <span className="ml-auto text-[10px] text-gray-400">
                  {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Spec({ label, value, mono = false, strike = false, bold = false }) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-xl p-2.5">
      <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">{label}</p>
      <p
        className={`text-sm text-gray-900 mt-0.5 truncate ${mono ? "font-mono" : ""} ${strike ? "line-through text-gray-400" : ""} ${bold ? "font-extrabold" : "font-bold"}`}
      >
        {value}
      </p>
    </div>
  );
}
