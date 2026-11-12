"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";

import { useCart } from "@/lib/contexts/CartContext";
import { useIssues } from "@/lib/contexts/IssuesContext";
import { urlFor } from "@/lib/sanity/image";

import { Button } from "./ui/button";
import { useTranslations } from "next-intl";

export default function CartDrawer() {
  const t = useTranslations("Cart");
  // Cart items for issues share the issue's id: their cover
  const issues = useIssues();
  const {
    items,
    addToCart,
    decreaseQuantity,
    removeFromCart,
    totalItems,
    drawerOpen,
    setDrawerOpen,
  } = useCart();

  // More than one title in the cart: a compact list, one column without
  // the covers
  const compact = items.length > 1;

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
            className="fixed top-0 right-0 z-100 h-full w-[calc(100vw-2rem)] lg:w-1/3 bg-background flex px-6 flex-col shadow-md font-johnSans [&_button]:font-johnSans"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Header */}
            <div className="flex items-center justify-between pt-3 pb-3 px-0  h-16 lg:h-auto   w-full">
              <Button
                variant="link"
                size="xs"
                className="w-min font-johnSans text-foreground"
              >
                {t("title", { count: totalItems })}
              </Button>
              <Button
                variant="link"
                size="xs"
                className="w-min justify-end font-johnSans text-foreground text-xs tracking-[48%] after:content-none"
                onClick={() => setDrawerOpen(false)}
                aria-label={t("closeLabel")}
              >
                {t("close")}
              </Button>
            </div>

            {/* Items: scroll without a scrollbar, with a fade over the
                bottom edge (from the background up to transparent, like
                ReadMore) */}
            <div className="relative flex-1 min-h-0 flex flex-col">
              <div className="flex-1 overflow-y-auto scrollbar-none p-0  gap-0  flex flex-col">
                {items.length === 0 ? (
                  <p className="font-johnSans text-xs text-neutral-700 leading-[1.5] p-3">
                    {t("empty")}
                  </p>
                ) : (
                  items.map((item) => {
                    const issue = issues.find((i) => i._id === item.id);
                    return (
                      // Two columns: the cover on the left; on the right the
                      // title, the amount (− / +) and, bottom right, the price.
                      // With more than one title: one column, no cover
                      <div
                        key={item.id}
                        // One box for the list, as the Produktinfo table on the issue page:
                        // each item draws its sides and bottom line (the first
                        // also the top), the first with rounded top corners,
                        // the last with rounded bottom ones (overflow-hidden
                        // clips the cover to them)
                        className={`relative grid ${compact ? "grid-cols-1" : "grid-cols-2"} w-full overflow-hidden border-x border-b border-neutral-600 first:border-t`}
                      >
                        {!compact && (
                          <div>
                            {issue?.cover?.asset && (
                              <Image
                                src={urlFor(issue.cover).url()}
                                alt={issue.cover.alt ?? ""}
                                width={0}
                                height={0}
                                // Half its column, a quarter of the drawer (full
                                // width on mobile, a third of the screen on desktop)
                                sizes="(min-width: 1024px) 9vw, 25vw"
                                className="p-12 w-full  h-auto "
                              />
                            )}
                          </div>
                        )}

                        <div
                          className={`flex flex-col gap-3 p-0 min-w-0 h-full w-full ${compact ? "" : "border-l border-l-neutral-600"}`}
                        >
                          {/* Title (John Sans) and price. One column (more
                              than one title): on one row, the title on the
                              left, wrapping, the price on the right. Two
                              columns (with the cover): stacked, the title at
                              the top and the price at the bottom */}
                          <div
                            className={`flex justify-between gap-6 h-full p-6 ${compact ? "items-baseline" : "flex-col"}`}
                          >
                            <span className="min-w-0 font-johnSans text-xs uppercase tracking-[48%] whitespace-normal leading-loose">
                              {item.title}
                            </span>
                            <span className="shrink-0 font-johnSans text-xs uppercase tracking-[24%] whitespace-nowrap">
                              {item.price}
                            </span>
                          </div>
                          {/* Remove (X), then the amount with − and + (− at one removes it), at the bottom */}
                          <div className="mt-auto flex items-center gap-0 w-full justify-between border-t border-t-neutral-600">
                            {/* Remove: the same square as − / +, left of −,
                                a line between them */}
                            <Button
                              variant="secondary"
                              size="xs"
                              className="size-12 lg:size-12 aspect-square p-0 font-johnSans tracking-normal leading-none justify-center items-center text-neutral-700 bg-background hover:bg-secondary border-r border-r-neutral-600"
                              onClick={() => removeFromCart(item.id)}
                              aria-label={t("remove", { title: item.title })}
                            >
                              X
                            </Button>
                            <Button
                              variant="secondary"
                              size="xs"
                              // Square; no padding or letter-spacing (the xs
                              // size's tracking adds space after the sign,
                              // pushing it off centre)
                              className="size-12 lg:size-12 aspect-square p-0 tracking-normal leading-none justify-center items-center bg-background hover:bg-secondary "
                              onClick={() => decreaseQuantity(item.id)}
                              aria-label={t("decrease", { title: item.title })}
                            >
                              −
                            </Button>
                            <span className="font-johnSans text-xs tabular-nums text-center h-full flex items-center justify-center border-x border-x-neutral-600 w-full">
                              {item.quantity}
                            </span>
                            <Button
                              variant="secondary"
                              size="xs"
                              // Same square as −
                              className="size-12 lg:size-12 aspect-square p-0 tracking-normal leading-none justify-center items-center bg-background hover:bg-secondary "
                              onClick={() =>
                                addToCart({
                                  id: item.id,
                                  title: item.title,
                                  price: item.price,
                                })
                              }
                              aria-label={t("increase", { title: item.title })}
                            >
                              +
                            </Button>
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
              <div className="pb-6 pt-12 flex flex-col gap-6 border-t border-t-neutral-600 ">
                <div className="flex justify-center gap-6 items-baseline ">
                  <span className="font-johnSans text-xs uppercase tracking-[48%]">
                    {t("subtotal")}
                  </span>
                  <span className="font-johnSans text-xs uppercase tracking-[48%]">
                    {subtotal % 1 === 0 ? subtotal : subtotal.toFixed(2)} kr
                  </span>
                </div>

                <Button
                  variant="default"
                  size="default"
                  className="bg-foreground text-background font-johnSans"
                >
                  {t("checkout")}
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
