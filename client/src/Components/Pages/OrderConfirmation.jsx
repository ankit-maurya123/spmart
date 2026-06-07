import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useOrder, useCancelOrder } from "../../hooks/useOrders";
import { useCart } from "../../context/CartContext";
import { resolveProductImage } from "../../lib/imageMap";
import usePageMeta from "../../hooks/usePageMeta";

const STATUS_STEPS = ["pending", "confirmed", "processing", "shipped", "delivered"];
const STATUS_LABEL = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Packing",
  shipped: "Shipped",
  delivered: "Delivered",
};

const PAYMENT_PILL = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  refunded: "bg-rose-100 text-rose-800",
};

/* ── Page ──────────────────────────────────────────────────────── */
export default function OrderConfirmation() {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  usePageMeta({
    title: orderNumber ? `Order ${orderNumber}` : "Order Confirmation",
    description: "Track your SPMart order status — pending, confirmed, shipped or delivered.",
    noIndex: true,
  });

  const { data: order, isLoading, error } = useOrder(orderNumber);
  const cancelMut = useCancelOrder();

  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelError, setCancelError] = useState("");

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="pt-4 sm:pt-6 pb-12 min-h-screen">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 space-y-4 animate-pulse">
          <div className="h-32 bg-gray-100 rounded-3xl" />
          <div className="h-24 bg-gray-100 rounded-2xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="h-32 bg-gray-100 rounded-2xl" />
            <div className="h-32 bg-gray-100 rounded-2xl" />
          </div>
          <div className="h-64 bg-gray-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error || !order) {
    return (
      <div className="pt-6 sm:pt-10 pb-12 min-h-screen">
        <div className="max-w-md mx-auto px-4 text-center py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-rose-50 mb-5">
            <svg className="w-10 h-10 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.6}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-sm text-gray-500 mb-6">
            We couldn't find order <span className="font-bold">{orderNumber}</span>.
          </p>
          <Link
            to="/store"
            className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-extrabold text-sm rounded-full transition-colors"
          >
            Browse Store
          </Link>
        </div>
      </div>
    );
  }

  const currentStep = STATUS_STEPS.indexOf(order.status);
  const isCancelled = order.status === "cancelled";
  const isDelivered = order.status === "delivered";
  const canCancel = ["pending", "confirmed"].includes(order.status);

  const handleCancel = async () => {
    setCancelError("");
    try {
      await cancelMut.mutateAsync({
        orderNumber: order.orderNumber,
        reason: cancelReason.trim(),
      });
      setConfirmCancel(false);
      setCancelReason("");
    } catch (err) {
      setCancelError(err?.response?.data?.error || "Failed to cancel order.");
    }
  };

  const handleReorder = () => {
    order.items.forEach((it) => {
      // Synthesize a minimal product shape that CartContext expects
      addToCart(
        {
          _id: it.productId,
          name: it.name,
          price: it.price,
          image: it.image,
          imageKey: it.imageKey,
          category: it.category,
        },
        it.quantity
      );
    });
    navigate("/store");
  };

  return (
    <div className="pt-4 sm:pt-6 pb-12 min-h-screen">
      <div className="max-w-3xl mx-auto px-3 sm:px-4">

        {/* ── Hero status banner ───────────────────────────── */}
        <section
          className={`relative overflow-hidden rounded-3xl p-5 sm:p-7 mb-5 text-white ${
            isCancelled
              ? "bg-gradient-to-br from-rose-500 via-rose-600 to-rose-700"
              : isDelivered
              ? "bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600"
              : "bg-gradient-to-br from-violet-600 via-fuchsia-600 to-rose-500"
          }`}
        >
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-yellow-200/30 blur-3xl pointer-events-none" />
          <div className="relative flex items-start gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              {isCancelled ? (
                <svg className="w-8 h-8 sm:w-9 sm:h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-8 h-8 sm:w-9 sm:h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] uppercase tracking-wider text-white/70 font-bold">
                {isCancelled ? "Order Cancelled" : isDelivered ? "Order Delivered" : "Order Placed"}
              </p>
              <h1 className="text-xl sm:text-2xl font-extrabold leading-tight mt-0.5">
                {isCancelled
                  ? "We're sorry this didn't work out."
                  : isDelivered
                  ? "Thanks for shopping with us!"
                  : "Thank you for your order!"}
              </h1>
              <p className="text-sm text-white/85 mt-1.5">
                Order number{" "}
                <span className="font-bold text-yellow-200">{order.orderNumber}</span>
              </p>
              <p className="text-[11px] text-white/70 mt-0.5">
                Placed{" "}
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}{" "}
                · {new Date(order.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        </section>

        {/* ── Status tracker ─────────────────────────────── */}
        {!isCancelled && (
          <section className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 mb-4">
            <div className="flex items-center justify-between gap-3 mb-5">
              <h3 className="text-base font-extrabold text-gray-900">Order Status</h3>
              <span className={`text-[10px] font-extrabold uppercase px-2 py-1 rounded-full ${
                isDelivered ? "bg-green-100 text-green-700" : "bg-violet-100 text-violet-700"
              }`}>
                {STATUS_LABEL[order.status] || order.status}
              </span>
            </div>

            <div className="relative">
              {/* Track */}
              <div className="absolute top-4 left-4 right-4 h-1 bg-gray-200 rounded-full" />
              <div
                className="absolute top-4 left-4 h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-700"
                style={{
                  width: `calc(${(currentStep / (STATUS_STEPS.length - 1)) * 100}% - ${(currentStep / (STATUS_STEPS.length - 1)) * 32}px)`,
                }}
              />

              <ol className="relative grid grid-cols-5 gap-1">
                {STATUS_STEPS.map((step, i) => {
                  const done = i < currentStep;
                  const active = i === currentStep;
                  return (
                    <li key={step} className="flex flex-col items-center">
                      <span
                        className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                          done
                            ? "bg-violet-600 text-white"
                            : active
                            ? "bg-fuchsia-500 text-white ring-4 ring-fuchsia-100 animate-pulse"
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
                      <span
                        className={`mt-1.5 text-[10px] font-bold leading-tight text-center ${
                          done || active ? "text-gray-800" : "text-gray-400"
                        }`}
                      >
                        {STATUS_LABEL[step]}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>

            {order.status !== "delivered" && (
              <p className="text-xs text-gray-500 text-center mt-4">
                Expected delivery in <span className="font-extrabold text-gray-800">10-15 min</span>
              </p>
            )}
          </section>
        )}

        {/* ── Customer + Address + Payment + Date cards ──── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <DetailCard title="Customer">
            <p className="text-sm font-extrabold text-gray-900 truncate">{order.customer.name}</p>
            <p className="text-[11px] text-gray-500 mt-0.5 truncate">{order.customer.email}</p>
            <p className="text-[11px] text-gray-500">{order.customer.phone}</p>
          </DetailCard>

          <DetailCard title="Shipping Address">
            <p className="text-sm text-gray-800 leading-snug">
              {order.shippingAddress.address},<br />
              {order.shippingAddress.city}, {order.shippingAddress.state} – {order.shippingAddress.pincode}
            </p>
          </DetailCard>

          <DetailCard title="Payment">
            <p className="text-sm font-extrabold text-gray-900 capitalize">
              {order.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}
            </p>
            <span
              className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                PAYMENT_PILL[order.paymentStatus] || "bg-gray-100 text-gray-700"
              }`}
            >
              {order.paymentStatus}
            </span>
          </DetailCard>

          <DetailCard title="Order Total">
            <p className="text-2xl font-extrabold text-gray-900 leading-none">₹{order.total}</p>
            <p className="text-[11px] text-gray-500 mt-1">
              {order.items.length} item{order.items.length !== 1 ? "s" : ""} · Incl. all taxes
            </p>
          </DetailCard>
        </div>

        {/* ── Items ─────────────────────────────────────── */}
        <section className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 mb-4">
          <h3 className="text-base font-extrabold text-gray-900 mb-4">
            Items Ordered ({order.items.length})
          </h3>
          <ul className="space-y-3">
            {order.items.map((it, i) => (
              <li key={i} className="flex items-center gap-3 pb-3 last:pb-0 border-b border-gray-100 last:border-0">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gray-50 border border-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                  <img
                    src={resolveProductImage(it)}
                    alt={it.name}
                    loading="lazy"
                    className="w-full h-full object-contain p-1"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-gray-900 truncate">{it.name}</p>
                  <p className="text-[11px] text-gray-500">
                    ₹{it.price} × {it.quantity}
                  </p>
                </div>
                <span className="text-sm font-extrabold text-gray-900 flex-shrink-0">
                  ₹{it.price * it.quantity}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-4 pt-4 border-t border-gray-100 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-bold text-gray-900">₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery</span>
              <span className="font-bold">
                {order.deliveryFee === 0
                  ? <span className="text-green-600">FREE</span>
                  : <span className="text-gray-900">₹{order.deliveryFee}</span>}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-100">
              <span className="font-extrabold text-gray-900">Total</span>
              <span className="font-extrabold text-gray-900 text-base">₹{order.total}</span>
            </div>
          </div>
        </section>

        {/* ── Notes (if any) ──────────────────────────── */}
        {order.notes && (
          <section className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700 mb-1">
              Order Notes
            </p>
            <p className="text-sm text-amber-900">{order.notes}</p>
          </section>
        )}

        {/* ── Actions ─────────────────────────────────── */}
        <section className="flex flex-wrap items-center justify-center gap-2.5 mb-4">
          {canCancel && (
            <button
              onClick={() => setConfirmCancel(true)}
              className="px-5 py-2.5 rounded-full border-2 border-rose-200 text-rose-600 font-extrabold text-sm hover:bg-rose-50 transition-colors"
            >
              Cancel Order
            </button>
          )}

          {(isDelivered || isCancelled) && (
            <button
              onClick={handleReorder}
              className="px-5 py-2.5 rounded-full bg-violet-600 hover:bg-violet-700 text-white font-extrabold text-sm transition-colors inline-flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.4}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reorder
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="px-5 py-2.5 rounded-full border border-gray-200 bg-white text-gray-700 font-extrabold text-sm hover:border-gray-300 hover:bg-gray-50 transition-colors inline-flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Invoice
          </button>

          <Link
            to="/account/orders"
            className="px-5 py-2.5 rounded-full border border-gray-200 bg-white text-gray-700 font-extrabold text-sm hover:border-gray-300 hover:bg-gray-50 transition-colors"
          >
            My Orders
          </Link>

          <Link
            to="/store"
            className="px-5 py-2.5 rounded-full border border-gray-200 bg-white text-gray-700 font-extrabold text-sm hover:border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Continue Shopping
          </Link>
        </section>
      </div>

      {/* ── Cancel confirmation modal ───────────────── */}
      {confirmCancel && (
        <>
          <div
            className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm"
            onClick={() => !cancelMut.isPending && setConfirmCancel(false)}
          />
          <div className="fixed inset-x-3 top-1/2 -translate-y-1/2 z-[90] sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:max-w-md w-auto sm:w-full">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-5 sm:p-6">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.4}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-gray-900">Cancel this order?</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Order <span className="font-bold">{order.orderNumber}</span> will be cancelled. This can't be undone.
                    </p>
                  </div>
                </div>

                <label className="block">
                  <span className="block text-xs font-bold text-gray-700 mb-1.5">
                    Reason <span className="text-gray-400 font-normal">(optional)</span>
                  </span>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    rows={3}
                    placeholder="Tell us why so we can do better next time…"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-400 resize-none"
                  />
                </label>

                {cancelError && (
                  <p className="text-xs font-bold text-rose-500 mt-2">{cancelError}</p>
                )}
              </div>

              <div className="flex items-center gap-2 px-5 sm:px-6 py-3 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={() => setConfirmCancel(false)}
                  disabled={cancelMut.isPending}
                  className="flex-1 py-2.5 rounded-xl font-extrabold text-sm text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  Keep Order
                </button>
                <button
                  onClick={handleCancel}
                  disabled={cancelMut.isPending}
                  className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-sm transition-colors disabled:opacity-60"
                >
                  {cancelMut.isPending ? "Cancelling…" : "Cancel Order"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Small detail card helper ──────────────────────────────────── */
function DetailCard({ title, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5">
      <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-2">
        {title}
      </p>
      {children}
    </div>
  );
}
