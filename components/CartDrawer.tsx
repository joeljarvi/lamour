"use client";

import { useEffect } from "react";

import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";

import { useCart } from "@/lib/contexts/CartContext";
import { useIssues } from "@/lib/contexts/IssuesContext";
import { urlFor } from "@/lib/sanity/image";

import { Button } from "./ui/button";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function CartDrawer() {
  const t = useTranslations("Cart");
  // Cart items for issues share the issue's id: their cover
  const issues = useIssues();
  const {
    items,
    addToCart,
    decreaseQuantity,
    removeFromCart,
    drawerOpen,
    setDrawerOpen,
  } = useCart();

  const subtotal = items.reduce((sum, item) => {
    const numeric = parseFloat(
      item.price.replace(/[^0-9.,]/g, "").replace(",", "."),
    );
    return sum + (isNaN(numeric) ? 0 : numeric * item.quantity);
  }, 0);

  // Closed with Escape (there's no close button: the backdrop or Escape)
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen, setDrawerOpen]);

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-100 bg-foreground/20 "
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer panel: all its text and buttons in John Sans (the
              buttons' sizes set their own font, so [&_button] overrides it) */}
          <motion.div
            className="fixed top-0 right-0 z-100 h-full w-[calc(100vw-2rem)] lg:w-[25vw] bg-background flex px-0 flex-col shadow-md font-baskervilleNeoText "
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Items: scroll without a scrollbar, with a fade over the
                bottom edge (from the background up to transparent, like
                ReadMore) */}
            <div className="relative flex-1 min-h-0 flex flex-col">
              <div className="flex-1 overflow-y-auto scrollbar-none p-6  gap-0  flex flex-col">
                {items.length === 0 ? (
                  <p className="font-baskervilleNeoText text-neutral-800 leading-[24px] p-[24px]">
                    {t("empty")}
                  </p>
                ) : (
                  items.map((item) => {
                    const cover = issues.find((i) => i._id === item.id)?.cover;
                    return (
                      // One item: a small cover (96px tall; issues only) on
                      // the left; beside it, as tall as it (or taller when
                      // the title wraps a lot), "1 x <title>" and the price
                      // at the top and, at the bottom right, level with the
                      // cover's bottom, remove (X) and − / + (− at one
                      // removes it; a subscription only X)
                      <div
                        key={item.id}
                        className="flex w-full items-stretch gap-3 py-3 border-b border-b-foreground"
                      >
                        {cover?.asset && (
                          <Image
                            src={urlFor(cover).height(192).url()}
                            alt=""
                            width={72}
                            height={96}
                            className="min-h-[72] w-auto shrink-0 self-start"
                          />
                        )}
                        <div className="flex min-h-[96px] min-w-0 flex-1 flex-col justify-between">
                          <div className="flex min-w-0 flex-col">
                            <span className="min-w-0 pStyle whitespace-normal">
                              <span className="tabular-nums">
                                {item.quantity}
                              </span>{" "}
                              x {item.title}
                            </span>
                            <span className="pStyle whitespace-nowrap">
                              {item.price}
                              {/* A subscription: how often (e.g. "/ år") */}
                              {item.subscription &&
                                ` ${item.subscription.period}`}
                            </span>
                          </div>
                          <div className="flex h-12 shrink-0 items-stretch justify-end gap-0">
                            <Button
                              variant="secondary"
                              size="xs"
                              className="h-full lg:h-full w-12 shrink-0 p-0 font-baskervilleNeoText tracking-normal leading-none justify-center items-center text-neutral-700 bg-background hover:bg-secondary"
                              onClick={() => removeFromCart(item.id)}
                              aria-label={t("remove", { title: item.title })}
                            >
                              X
                            </Button>
                            {!item.subscription && (
                              <>
                                <Button
                                  variant="secondary"
                                  size="xs"
                                  // Square; no padding or letter-spacing (the xs
                                  // size's tracking adds space after the sign,
                                  // pushing it off centre)
                                  className="h-full lg:h-full w-12 shrink-0 p-0 tracking-normal leading-none justify-center items-center bg-background hover:bg-secondary"
                                  onClick={() => decreaseQuantity(item.id)}
                                  aria-label={t("decrease", {
                                    title: item.title,
                                  })}
                                >
                                  −
                                </Button>
                                <Button
                                  variant="secondary"
                                  size="xs"
                                  className="h-full lg:h-full w-12 shrink-0 p-0 tracking-normal leading-none justify-center items-center bg-background hover:bg-secondary"
                                  onClick={() =>
                                    addToCart({
                                      id: item.id,
                                      title: item.title,
                                      price: item.price,
                                    })
                                  }
                                  aria-label={t("increase", {
                                    title: item.title,
                                  })}
                                >
                                  +
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-background/60 to-transparent"
              />
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="pb-6 pt-6 flex flex-col gap-6 px-6 ">
                <div className="flex justify-center gap-6 items-baseline ">
                  <span className="pStyle">{t("subtotal")}</span>
                  <span className="pStyle">
                    {subtotal % 1 === 0 ? subtotal : subtotal.toFixed(2)} kr
                  </span>
                </div>

                {/* "Fortsätt handla": closes the cart, back to the page */}
                <Button
                  variant="default"
                  size="default"
                  // 72px, as "Till kassan", outlined instead of filled
                  className="h-[72px] lg:h-[72px] border border-foreground bg-background text-foreground hover:bg-foreground hover:text-background pStyle"
                  onClick={() => setDrawerOpen(false)}
                >
                  {t("continueShopping")}
                </Button>
                {/* To the checkout page (closing the cart) */}
                <Button
                  variant="default"
                  size="default"
                  // 72px (3 rows of 24px)
                  className="h-[72px] lg:h-[72px] bg-foreground text-background pStyle"
                  asChild
                >
                  <Link href="/checkout" onClick={() => setDrawerOpen(false)}>
                    {t("checkout")}
                  </Link>
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
