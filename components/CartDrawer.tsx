"use client";

import { motion, AnimatePresence } from "motion/react";
import { useCart } from "@/lib/contexts/CartContext";
import LLButton from "./LLButton";
import Stretch from "./Stretch";
import { Button } from "./ui/button";
import { useTranslations } from "next-intl";

export default function CartDrawer() {
  const t = useTranslations("Cart");
  const {
    items,
    removeFromCart,
    clearCart,
    totalItems,
    drawerOpen,
    setDrawerOpen,
  } = useCart();

  const subtotal = items.reduce((sum, item) => {
    const numeric = parseFloat(
      item.price.replace(/[^0-9.,]/g, "").replace(",", "."),
    );
    return sum + (isNaN(numeric) ? 0 : numeric * item.quantity);
  }, 0);

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-foreground/0 "
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer panel */}
          <motion.div
            className="fixed top-0 right-0 z-50 h-full w-full lg:max-w-1/3 bg-pergament flex flex-col shadow-md"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Header */}
            <div className="flex items-center justify-between pt-12 px-12  h-14 lg:h-24   w-full">
              <Button variant="link" size="xs" className="w-min">
                {t("title", { count: totalItems })}
              </Button>
              <Button
                variant="link"
                size="xs"
                className="w-min"
                onClick={() => setDrawerOpen(false)}
                aria-label={t("closeLabel")}
              >
                {t("close")}
              </Button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-12  gap-6  flex flex-col ">
              {items.length === 0 ? (
                <p className="font-baskervilleNeoText text-xs tracking-[3%] text-neutral-700 leading-[1.5]">
                  {t("empty")}
                </p>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    // Title on top, remove (x) below it
                    className="flex flex-col items-start gap-12 bg-background p-6 w-full"
                  >
                    {/* Title on the left, price on the right */}
                    <div className="flex w-full justify-between items-baseline gap-6">
                      <span className="font-baskervilleNeoDisplay text-xs uppercase tracking-[24%] whitespace-nowrap">
                        LL{item.title}
                      </span>
                      <span className="font-baskervilleNeoDisplay text-xs uppercase tracking-[24%] whitespace-nowrap">
                        {item.price} x {item.quantity}
                      </span>
                    </div>

                    <Button
                      variant="link"
                      size="xs"
                      className="font-baskervilleNeoDisplay text-xs uppercase tracking-[24%]"
                      onClick={() => removeFromCart(item.id)}
                      aria-label={t("remove", { title: item.title })}
                    >
                      Rensa korg (<span className="lowercase">x</span>)
                    </Button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-12 flex flex-col gap-6 ">
                <div className="flex justify-center gap-6 items-baseline h-14 lg:h-24">
                  <span className="font-baskervilleNeoDisplay text-xs uppercase tracking-[48%]">
                    {t("subtotal")}
                  </span>
                  <span className="font-baskervilleNeoDisplay text-xs uppercase tracking-[48%]">
                    {subtotal % 1 === 0 ? subtotal : subtotal.toFixed(2)} kr
                  </span>
                </div>

                <Button variant="outline" size="default" className="">
                  {t("checkout")}
                </Button>

                <Button
                  variant="link"
                  size="xs"
                  className="hidden "
                  onClick={clearCart}
                >
                  {t("clear")}
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
