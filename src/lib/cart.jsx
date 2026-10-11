import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);
const KEY = "yanai3d_cart";

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const addToCart = (model, colors, customText = "") => {
    const key = `${model.id}__${colors.map((c) => c.name).join("__")}__${customText}`;
    setItems((prev) => {
      const found = prev.find((i) => i.key === key);
      if (found) return prev.map((i) => (i.key === key ? { ...i, quantity: i.quantity + 1 } : i));
      return [
        ...prev,
        {
          key,
          modelId: model.id,
          modelName: model.name,
          price: model.price,
          img: model.img,
          colors,
          customText,
          quantity: 1,
        },
      ];
    });
  };

  const removeFromCart = (key) => setItems((p) => p.filter((i) => i.key !== key));
  const updateQuantity = (key, delta) =>
    setItems((p) =>
      p.map((i) => (i.key === key ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i))
    );
  const clearCart = () => setItems([]);

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, count, total }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
