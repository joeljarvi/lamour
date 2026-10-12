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
            className="fixed top-0 right-0 z-50 h-full w-full max-w-md bg-[#B3F7FE]  flex flex-col shadow-md"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4  h-14 lg:h-20  w-full">
              <span className="lowercase text-lg lg:text-xl w-full font-baskervilleSC tracking-widest flex items-center">
                {t("title", { count: totalItems })}
              </span>
              <Button
                variant="ghost"
                className="hover:opacity-50 transition-opacity px-4 w-min whitespace-nowrap bg-transparent hover:bg-transparent hover:text-foreground/80 "
                onClick={() => setDrawerOpen(false)}
                aria-label={t("closeLabel")}
              >
                {t("close")}
              </Button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-4 gap-4 pt-4 flex flex-col ">
              {items.length === 0 ? (
                <p className="font-baskervilleSC tracking-widest text-foreground/50  lowercase text-lg lg:text-xl pt-0 px-4">
                  {t("empty")}
                </p>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-baseline  justify-between bg-background pb-4 pt-4 px-4"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-baskervilleSC text-4xl uppercase tracking-wider">
                        {item.title}
                      </span>
                      <span className="font-baskervilleSC lowercase text-lg lg:text-xl tracking-widest text-foreground flex px-4 items-baseline">
                        {item.price} x {item.quantity}
                      </span>
                    </div>
                    <button
                      className="hover:opacity-50 transition-opacity px-4 w-min font-baskervilleSC whitespace-nowrap bg-transparent hover:bg-transparent text-4xl items-start uppercase tracking-wider hover:text-foreground/80  ml-4"
                      onClick={() => removeFromCart(item.id)}
                      aria-label={t("remove", { title: item.title })}
                    >
                      (<span className="lowercase">x</span>)
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-6 flex flex-col gap-4 pb-6">
                <div className="flex justify-between items-baseline h-14 lg:h-20">
                  <span className="font-baskervilleSC    text-lg lg:text-xl  lowercase tracking-widest">
                    {t("subtotal")}
                  </span>
                  <span className="font-baskervilleSC    text-lg lg:text-xl  lowercase tracking-widest">
                    {subtotal % 1 === 0 ? subtotal : subtotal.toFixed(2)} kr
                  </span>
                </div>

                <Button variant="default" className="">
                  {t("checkout")}
                </Button>

                <button
                  className="font-baskervilleSC hidden lowercase text-sm  text-foreground/50 hover:text-foreground transition-colors tracking-wider text-center "
                  onClick={clearCart}
                >
                  {t("clear")}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
