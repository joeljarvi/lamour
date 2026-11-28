"use client";

import { useCart } from "@/lib/contexts/CartContext";
import type { ShippingZone } from "@/lib/shipping";

// "Välj" on a subscription plan: puts it in the cart (replacing any other
// subscription there) and opens the cart
export default function AddPlanToCart({
  plan,
  period,
  label,
  className,
}: {
  plan: { _id: string; title: string; price: number; zone: ShippingZone };
  // How often it's billed, as shown in the cart (e.g. "/ år")
  period: string;
  label: string;
  className?: string;
}) {
  const { addToCart, setDrawerOpen } = useCart();
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        addToCart({
          id: plan._id,
          title: plan.title,
          price: `${plan.price} SEK`,
          subscription: { period, zone: plan.zone },
        });
        setDrawerOpen(true);
      }}
    >
      {label}
    </button>
  );
}
