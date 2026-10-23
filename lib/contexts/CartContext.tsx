"use client";

import { createContext, useContext, useState } from "react";

export type CartItem = {
  id: string;
  title: string;
  price: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: string) => void;
  // One fewer; removes the item at zero
  decreaseQuantity: (id: string) => void;
  clearCart: () => void;
  totalItems: number;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
};

const CartContext = createContext<CartContextValue>({
  items: [],
  addToCart: () => {},
  removeFromCart: () => {},
  decreaseQuantity: () => {},
  clearCart: () => {},
  totalItems: 0,
  drawerOpen: false,
  setDrawerOpen: () => {},
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  function addToCart(item: Omit<CartItem, "quantity">) {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }

  function removeFromCart(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function decreaseQuantity(id: string) {
    setItems((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0),
    );
  }

  function clearCart() {
    setItems([]);
  }

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        decreaseQuantity,
        clearCart,
        totalItems,
        drawerOpen,
        setDrawerOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
