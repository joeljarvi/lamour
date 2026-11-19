"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/contexts/CartContext";

// Empties the cart once shown (on the thank-you page after paying)
export default function ClearCart() {
  const { clearCart } = useCart();
  useEffect(() => {
    clearCart();
    // Once, when the page opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
