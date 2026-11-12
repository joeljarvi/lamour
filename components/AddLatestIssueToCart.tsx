"use client";

import { useCart } from "@/lib/contexts/CartContext";
import { useIssues } from "@/lib/contexts/IssuesContext";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

// "Lägg i korg" for the latest issue (issues come newest first), as a link
// button underlined on hover (or keyboard focus), sized by its
// surroundings. Nothing if there's no issue or it's sold out
export default function AddLatestIssueToCart({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { addToCart, setDrawerOpen } = useCart();
  const latest = useIssues()[0];
  if (!latest || latest.inStock === false) return null;

  return (
    <Button
      variant="link"
      className={cn(
        "inline-flex w-auto h-auto lg:h-auto px-0 align-baseline text-foreground underline-offset-3 decoration-4 hover:underline focus-visible:underline",
        className,
      )}
      onClick={() => {
        addToCart({
          id: latest._id,
          title: latest.title,
          price: latest.price != null ? `${latest.price} kr` : "0",
        });
        setDrawerOpen(true);
      }}
    >
      {children}
    </Button>
  );
}
