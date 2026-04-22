import { createContext, useContext, useState, useEffect, useCallback } from "react";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem("spmart-cart");
    return saved ? JSON.parse(saved) : [];
  });

  const [toast, setToast] = useState(null);

  useEffect(() => {
    localStorage.setItem("spmart-cart", JSON.stringify(items));
  }, [items]);

  const showToast = useCallback((message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  }, []);

  const addToCart = useCallback((product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product._id === product._id);
      if (existing) {
        showToast(`Updated "${product.name}" quantity in cart`);
        return prev.map((item) =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      showToast(`"${product.name}" added to cart`);
      return [...prev, { product, quantity }];
    });
  }, [showToast]);

  const removeFromCart = useCallback((productId) => {
    setItems((prev) => {
      const item = prev.find((i) => i.product._id === productId);
      if (item) showToast(`"${item.product.name}" removed from cart`);
      return prev.filter((i) => i.product._id !== productId);
    });
  }, [showToast]);

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((item) =>
        item.product._id === productId ? { ...item, quantity } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    showToast("Cart cleared");
  }, [showToast]);

  const getCartTotal = useCallback(() => {
    return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [items]);

  const getCartCount = useCallback(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal, getCartCount }}
    >
      {children}

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold rounded-xl shadow-2xl animate-toast-in flex items-center gap-2">
          <svg className="w-5 h-5 text-green-400 dark:text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {toast}
        </div>
      )}
    </CartContext.Provider>
  );
};
