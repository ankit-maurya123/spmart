import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./context/ThemeContext";
import { CartProvider } from "./context/CartContext";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import { ManagerAuthProvider } from "./context/ManagerAuthContext";
import { UserAuthProvider } from "./context/UserAuthContext";

// ── Critical-path (eager) ────────────────────────────────────────
// These are always needed on first paint, so keep them in the main bundle.
import Layout from "./Components/Layout";
import RequireAuth from "./Components/RequireAuth";
import Home from "./Components/Pages/Home";
import NotFound from "./Components/Pages/NotFound";

// ── Lazy routes — split into separate chunks per feature ─────────
// Public marketing
const Store           = lazy(() => import("./Components/Pages/Store"));
const ProductDetails  = lazy(() => import("./Components/Pages/ProductDetails"));
const About           = lazy(() => import("./Components/Pages/About"));
const Contact         = lazy(() => import("./Components/Pages/Contact"));

// Auth + checkout (rarely visited on first load)
const UserLogin       = lazy(() => import("./Components/Pages/UserLogin"));
const UserSignup      = lazy(() => import("./Components/Pages/UserSignup"));
const Checkout        = lazy(() => import("./Components/Pages/Checkout"));
const OrderConfirmation = lazy(() => import("./Components/Pages/OrderConfirmation"));

// Account area — only loaded after sign-in
const AccountLayout         = lazy(() => import("./Components/Account/AccountLayout"));
const AccountOverview       = lazy(() => import("./Components/Account/AccountOverview"));
const AccountProfile        = lazy(() => import("./Components/Account/AccountProfile"));
const AccountOrders         = lazy(() => import("./Components/Account/AccountOrders"));
const AccountAddresses      = lazy(() => import("./Components/Account/AccountAddresses"));
const AccountWishlist       = lazy(() => import("./Components/Account/AccountWishlist"));
const AccountWallet         = lazy(() => import("./Components/Account/AccountWallet"));
const AccountCoupons        = lazy(() => import("./Components/Account/AccountCoupons"));
const AccountNotifications  = lazy(() => import("./Components/Account/AccountNotifications"));
const AccountChangePassword = lazy(() => import("./Components/Account/AccountChangePassword"));
const AccountSupport        = lazy(() => import("./Components/Account/AccountSupport"));

// Admin area — completely separate chunk; never ships to public visitors
const AdminLogin     = lazy(() => import("./Components/Admin/AdminLogin"));
const AdminLayout    = lazy(() => import("./Components/Admin/AdminLayout"));
const Dashboard      = lazy(() => import("./Components/Admin/Dashboard"));
const AdminProducts  = lazy(() => import("./Components/Admin/AdminProducts"));
const AdminReviews   = lazy(() => import("./Components/Admin/AdminReviews"));
const AdminCategories = lazy(() => import("./Components/Admin/AdminCategories"));
const AdminProfile   = lazy(() => import("./Components/Admin/AdminProfile"));
const AdminSettings  = lazy(() => import("./Components/Admin/AdminSettings"));
const AdminOrders    = lazy(() => import("./Components/Admin/AdminOrders"));
const AdminAnalytics = lazy(() => import("./Components/Admin/AdminAnalytics"));
const AdminUsers     = lazy(() => import("./Components/Admin/AdminUsers"));

// Order Manager Panel — separate chunk + auth, view-only products + full order management
const ManagerLogin     = lazy(() => import("./Components/Manager/ManagerLogin"));
const ManagerLayout    = lazy(() => import("./Components/Manager/ManagerLayout"));
const ManagerDashboard = lazy(() => import("./Components/Manager/ManagerDashboard"));
const ManagerOrders    = lazy(() => import("./Components/Manager/ManagerOrders"));
const ManagerProducts  = lazy(() => import("./Components/Manager/ManagerProducts"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

/* ── Route loader fallback ─────────────────────────────────────── */
function RouteFallback() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4">
      <div className="flex items-center gap-3 text-violet-600">
        <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="text-sm font-bold">Loading…</span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <CartProvider>
          <UserAuthProvider>
          <AdminAuthProvider>
          <ManagerAuthProvider>
            <BrowserRouter>
              <Suspense fallback={<RouteFallback />}>
                <Routes>
                  <Route path="/login" element={<UserLogin />} />
                  <Route path="/signup" element={<UserSignup />} />
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="store" element={<Store />} />
                    <Route path="product/:id" element={<ProductDetails />} />
                    <Route path="about" element={<About />} />
                    <Route path="contact" element={<Contact />} />
                    <Route path="checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
                    <Route path="order-confirmation/:orderNumber" element={<RequireAuth><OrderConfirmation /></RequireAuth>} />
                    <Route path="account" element={<RequireAuth><AccountLayout /></RequireAuth>}>
                      <Route index element={<AccountOverview />} />
                      <Route path="profile"       element={<AccountProfile />} />
                      <Route path="orders"        element={<AccountOrders />} />
                      <Route path="addresses"     element={<AccountAddresses />} />
                      <Route path="wishlist"      element={<AccountWishlist />} />
                      <Route path="wallet"        element={<AccountWallet />} />
                      <Route path="coupons"       element={<AccountCoupons />} />
                      <Route path="notifications" element={<AccountNotifications />} />
                      <Route path="password"      element={<AccountChangePassword />} />
                      <Route path="support"       element={<AccountSupport />} />
                    </Route>
                    <Route path="*" element={<NotFound />} />
                  </Route>
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="reviews" element={<AdminReviews />} />
                    <Route path="categories" element={<AdminCategories />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="analytics" element={<AdminAnalytics />} />
                    <Route path="profile" element={<AdminProfile />} />
                    <Route path="settings" element={<AdminSettings />} />
                  </Route>

                  {/* Order Manager Panel — separate login + emerald theme */}
                  <Route path="/manager/login" element={<ManagerLogin />} />
                  <Route path="/manager" element={<ManagerLayout />}>
                    <Route index element={<ManagerDashboard />} />
                    <Route path="orders" element={<ManagerOrders />} />
                    <Route path="products" element={<ManagerProducts />} />
                  </Route>
                </Routes>
              </Suspense>
            </BrowserRouter>
          </ManagerAuthProvider>
          </AdminAuthProvider>
          </UserAuthProvider>
        </CartProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
