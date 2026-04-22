import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const STATUS_STEPS = ["pending", "confirmed", "processing", "shipped", "delivered"];

export default function OrderConfirmation() {
  const { orderNumber } = useParams();

  const { data: order, isLoading, error } = useQuery({
    queryKey: ["order", orderNumber],
    queryFn: async () => {
      const { data } = await axios.get(`/api/orders/${orderNumber}`);
      return data;
    },
    enabled: !!orderNumber,
  });

  if (isLoading) {
    return (
      <div className="pt-20 md:pt-24 pb-12 min-h-screen flex items-center justify-center">
        <svg className="w-8 h-8 animate-spin text-yellow-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="pt-20 md:pt-24 pb-12 min-h-screen">
        <div className="max-w-lg mx-auto px-4 text-center py-16">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Order Not Found</h2>
          <p className="text-gray-500 text-sm mb-6">We couldn't find order "{orderNumber}".</p>
          <Link to="/store" className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold text-sm rounded-full">
            Back to Store
          </Link>
        </div>
      </div>
    );
  }

  const currentStep = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="pt-20 md:pt-24 pb-12 min-h-screen">
      <div className="max-w-3xl mx-auto px-4">
        {/* Success header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Thank you for your order. Your order number is{" "}
            <span className="font-bold text-yellow-600 dark:text-yellow-400">{order.orderNumber}</span>
          </p>
        </div>

        {/* Status tracker */}
        {order.status !== "cancelled" && (
          <div className="bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm rounded-2xl border border-gray-200/60 dark:border-white/[0.06] p-5 sm:p-6 mb-6">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Order Status</h3>
            <div className="flex items-center justify-between relative">
              {/* Progress line */}
              <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 dark:bg-white/10" />
              <div
                className="absolute top-4 left-0 h-0.5 bg-green-500 transition-all duration-500"
                style={{ width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` }}
              />
              {STATUS_STEPS.map((step, i) => (
                <div key={step} className="relative flex flex-col items-center z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    i <= currentStep
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-400"
                  }`}>
                    {i < currentStep ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span className={`text-[10px] mt-1.5 capitalize ${
                    i <= currentStep ? "text-green-600 dark:text-green-400 font-semibold" : "text-gray-400"
                  }`}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm rounded-2xl border border-gray-200/60 dark:border-white/[0.06] p-5">
            <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">Customer Details</h3>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{order.customer.name}</p>
            <p className="text-xs text-gray-500 mt-1">{order.customer.email}</p>
            <p className="text-xs text-gray-500">{order.customer.phone}</p>
          </div>
          <div className="bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm rounded-2xl border border-gray-200/60 dark:border-white/[0.06] p-5">
            <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">Shipping Address</h3>
            <p className="text-sm text-gray-900 dark:text-white">{order.shippingAddress.address}</p>
            <p className="text-xs text-gray-500 mt-1">
              {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
            </p>
          </div>
          <div className="bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm rounded-2xl border border-gray-200/60 dark:border-white/[0.06] p-5">
            <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">Payment</h3>
            <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">{order.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}</p>
            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
              order.paymentStatus === "paid" ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400" :
              order.paymentStatus === "refunded" ? "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400" :
              "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400"
            }`}>
              {order.paymentStatus}
            </span>
          </div>
          <div className="bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm rounded-2xl border border-gray-200/60 dark:border-white/[0.06] p-5">
            <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">Order Date</h3>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {new Date(order.createdAt).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(order.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>

        {/* Items */}
        <div className="bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm rounded-2xl border border-gray-200/60 dark:border-white/[0.06] p-5 sm:p-6 mb-6">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Items Ordered ({order.items.length})</h3>
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.name}</p>
                  <p className="text-xs text-gray-500">₹{item.price} x {item.quantity}</p>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 dark:border-white/[0.06] mt-4 pt-3 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>₹{order.subtotal}</span></div>
            <div className="flex justify-between text-gray-500">
              <span>Delivery</span>
              <span>{order.deliveryFee === 0 ? <span className="text-green-500">FREE</span> : `₹${order.deliveryFee}`}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 dark:text-white text-base border-t border-gray-200 dark:border-white/[0.06] pt-2">
              <span>Total</span><span>₹{order.total}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/store"
            className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold text-sm rounded-full hover:scale-105 hover:shadow-lg transition-all duration-300 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Continue Shopping
          </Link>
          <Link
            to="/"
            className="px-8 py-3 border border-gray-200 dark:border-white/[0.1] text-gray-700 dark:text-gray-300 font-semibold text-sm rounded-full hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
