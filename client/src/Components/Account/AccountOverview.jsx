import React from "react";
import { Link } from "react-router-dom";
import { useUserAuth } from "../../context/UserAuthContext";
import { useMyOrders } from "../../hooks/useOrders";
import { useWishlist } from "../../hooks/useWishlist";
import { useAddresses } from "../../hooks/useAddresses";
import usePageMeta from "../../hooks/usePageMeta";

const StatCard = ({ icon, label, value, to, color }) => (
  <Link
    to={to}
    className={`group bg-white border border-gray-200 hover:border-violet-300 hover:shadow-md rounded-2xl p-4 sm:p-5 transition-all flex items-center gap-3`}
  >
    <span className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center text-2xl flex-shrink-0`}>
      {icon}
    </span>
    <div className="min-w-0 flex-1">
      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{label}</p>
      <p className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight">{value}</p>
    </div>
    <svg className="w-5 h-5 text-gray-300 group-hover:text-violet-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  </Link>
);

const QuickAction = ({ to, icon, label, desc }) => (
  <Link
    to={to}
    className="bg-white border border-gray-200 hover:border-violet-300 hover:shadow-sm rounded-2xl p-4 transition-all flex items-center gap-3"
  >
    <span className="text-2xl">{icon}</span>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-bold text-gray-900">{label}</p>
      <p className="text-[11px] text-gray-500 leading-tight">{desc}</p>
    </div>
  </Link>
);

const AccountOverview = () => {
  usePageMeta({ title: "Account Overview", noIndex: true });
  const { user } = useUserAuth();
  const { data: orders } = useMyOrders();
  const { data: wishlist } = useWishlist();
  const { data: addresses } = useAddresses();

  const ordersCount = orders?.length || 0;
  const wishlistCount = wishlist?.length || 0;
  const addressesCount = addresses?.length || 0;

  const recent = orders?.slice(0, 3) || [];

  const STATUS_COLOR = {
    pending:    "bg-yellow-50 text-yellow-700",
    confirmed:  "bg-blue-50 text-blue-700",
    processing: "bg-violet-50 text-violet-700",
    shipped:    "bg-cyan-50 text-cyan-700",
    delivered:  "bg-green-50 text-green-700",
    cancelled:  "bg-rose-50 text-rose-700",
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Hero greeting */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-fuchsia-600 to-rose-500 p-5 sm:p-7">
        <div className="absolute -top-16 -right-12 w-52 h-52 rounded-full bg-yellow-300/30 blur-3xl pointer-events-none" />
        <div className="relative">
          <p className="text-[11px] uppercase tracking-wider text-white/70 font-bold">Welcome back</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Hi, {user?.name?.split(" ")[0] || "Friend"} 👋
          </h1>
          <p className="text-sm text-white/80 mt-1">Manage your orders, addresses, and preferences from one place.</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <StatCard icon="📦" label="My Orders"   value={ordersCount}     to="/account/orders"    color="bg-violet-50" />
        <StatCard icon="❤️" label="Wishlist"    value={wishlistCount}   to="/account/wishlist"  color="bg-rose-50" />
        <StatCard icon="📍" label="Addresses"   value={addressesCount}  to="/account/addresses" color="bg-amber-50" />
      </div>

      {/* Recent orders */}
      <section className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-extrabold text-gray-900">Recent Orders</h2>
          <Link to="/account/orders" className="text-sm font-bold text-violet-600 hover:underline">
            View all →
          </Link>
        </div>

        {!orders ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-4xl mb-2">📦</p>
            <p className="text-sm font-bold text-gray-700">No orders yet</p>
            <p className="text-xs text-gray-400 mb-4">Start shopping to see your orders here.</p>
            <Link
              to="/store"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm rounded-full"
            >
              Shop Now
            </Link>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {recent.map((o) => (
              <li key={o._id}>
                <Link
                  to={`/order-confirmation/${o.orderNumber}`}
                  className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-violet-300 hover:bg-violet-50/40 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center text-lg flex-shrink-0">📦</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-extrabold text-gray-900 truncate">{o.orderNumber}</p>
                    <p className="text-[11px] text-gray-500">
                      {o.items?.length || 0} item{o.items?.length !== 1 ? "s" : ""} · ₹{o.total}
                    </p>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${STATUS_COLOR[o.status] || "bg-gray-50 text-gray-700"}`}>
                    {o.status}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Quick actions */}
      <section>
        <h2 className="text-base font-extrabold text-gray-900 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <QuickAction to="/account/profile"       icon="✏️" label="Edit Profile"     desc="Name, phone, DOB" />
          <QuickAction to="/account/addresses"     icon="📍" label="Add Address"      desc="Save for checkout" />
          <QuickAction to="/account/notifications" icon="🔔" label="Notifications"   desc="Manage alerts" />
          <QuickAction to="/account/support"       icon="💬" label="Get Help"         desc="Contact support" />
        </div>
      </section>
    </div>
  );
};

export default AccountOverview;
