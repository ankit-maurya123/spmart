import { createContext, useContext, useState, useEffect, useCallback } from "react";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem("spmart-cart");
    return saved ? JSON.parse(saved) : [];
  });

  const [toast, setToast] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen((v) => !v), []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const prev = document.body.style.overflow;
    if (isCartOpen) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [isCartOpen]);

  useEffect(() => {
    localStorage.setItem("spmart-cart", JSON.stringify(items));
  }, [items]);

  const showToast = useCallback((message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  }, []);

  const addToCart = useCallback((product, quantity = 1) => {
    // Block adding when the product is out of stock or doesn't exist.
    if (product?.stock === 0) {
      showToast(`"${product.name}" is out of stock`);
      return;
    }
    setItems((prev) => {
      const existing = prev.find((item) => item.product._id === product._id);
      const nextQty = (existing?.quantity || 0) + quantity;

      // Cap at available stock if known.
      if (typeof product.stock === "number" && nextQty > product.stock) {
        showToast(`Only ${product.stock} of "${product.name}" available`);
        return existing
          ? prev.map((i) =>
              i.product._id === product._id ? { ...i, quantity: product.stock } : i
            )
          : prev.concat({ product, quantity: product.stock });
      }

      if (existing) {
        showToast(`Updated "${product.name}" quantity in cart`);
        return prev.map((item) =>
          item.product._id === product._id
            ? { ...item, quantity: nextQty }
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
      prev.map((item) => {
        if (item.product._id !== productId) return item;
        // Cap at available stock if we know it.
        const stock = item.product?.stock;
        const next = typeof stock === "number" ? Math.min(quantity, stock) : quantity;
        return { ...item, quantity: next };
      })
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
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal, getCartCount, isCartOpen, openCart, closeCart, toggleCart }}
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
