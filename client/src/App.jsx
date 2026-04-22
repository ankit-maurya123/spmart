import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./context/ThemeContext";
import { CartProvider } from "./context/CartContext";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import { UserAuthProvider } from "./context/UserAuthContext";
import Layout from "./Components/Layout";
import Home from "./Components/Pages/Home";
import Store from "./Components/Pages/Store";
import ProductDetails from "./Components/Pages/ProductDetails";
import About from "./Components/Pages/About";
import Contact from "./Components/Pages/Contact";
import Cart from "./Components/Pages/Cart";
import Checkout from "./Components/Pages/Checkout";
import OrderConfirmation from "./Components/Pages/OrderConfirmation";
import NotFound from "./Components/Pages/NotFound";
import UserLogin from "./Components/Pages/UserLogin";
import UserSignup from "./Components/Pages/UserSignup";
import AdminLogin from "./Components/Admin/AdminLogin";
import AdminLayout from "./Components/Admin/AdminLayout";
import Dashboard from "./Components/Admin/Dashboard";
import AdminProducts from "./Components/Admin/AdminProducts";
import AdminReviews from "./Components/Admin/AdminReviews";
import AdminCategories from "./Components/Admin/AdminCategories";
import AdminProfile from "./Components/Admin/AdminProfile";
import AdminSettings from "./Components/Admin/AdminSettings";
import AdminOrders from "./Components/Admin/AdminOrders";
import AdminAnalytics from "./Components/Admin/AdminAnalytics";
import AdminUsers from "./Components/Admin/AdminUsers";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <CartProvider>
          <UserAuthProvider>
          <AdminAuthProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<UserLogin />} />
                <Route path="/signup" element={<UserSignup />} />
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="store" element={<Store />} />
                  <Route path="product/:id" element={<ProductDetails />} />
                  <Route path="about" element={<About />} />
                  <Route path="contact" element={<Contact />} />
                  <Route path="cart" element={<Cart />} />
                  <Route path="checkout" element={<Checkout />} />
                  <Route path="order-confirmation/:orderNumber" element={<OrderConfirmation />} />
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
              </Routes>
            </BrowserRouter>
          </AdminAuthProvider>
          </UserAuthProvider>
        </CartProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
