"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { Minus, Plus } from "lucide-react";
import { useCart } from "@/lib/contexts/CartContext";
import { useIssues } from "@/lib/contexts/IssuesContext";
import { urlFor } from "@/lib/sanity/image";
import LLButton from "./LLButton";
import Stretch from "./Stretch";
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

          {/* Drawer panel */}
          <motion.div
            className="fixed top-0 right-0 z-100 h-full max-w-[calc(100vw-2rem)] lg:max-w-1/3 bg-background flex px-6 flex-col shadow-md"
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
                className="w-min text-foreground"
              >
                {t("title", { count: totalItems })}
              </Button>
              <Button
                variant="link"
                size="xs"
                className="w-min justify-end text-foreground  after:content-none"
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
              <div className="flex-1 overflow-y-auto scrollbar-none p-0  gap-0  flex flex-col border-t border-t-neutral-400 ">
                {items.length === 0 ? (
                  <p className="pStyle text-neutral-700 leading-[1.5] p-3">
                    {t("empty")}
                  </p>
                ) : (
                  items.map((item) => {
                    const issue = issues.find((i) => i._id === item.id);
                    return (
                      // Two columns: the cover on the left; on the right the
                      // title, the amount (− / +) and, bottom right, the price
                      <div
                        key={item.id}
                        className="relative grid grid-cols-2 w-full border-x border-x-neutral-500 border-b border-b-neutral-400"
                      >
                        {/* Remove, top right: the same square as − / + */}
                        <Button
                          variant="secondary"
                          size="xs"
                          className="absolute top-0 right-0 size-12 lg:size-12 aspect-square p-0 tracking-normal leading-none justify-center items-center  text-neutral-700 bg-background"
                          onClick={() => removeFromCart(item.id)}
                          aria-label={t("remove", { title: item.title })}
                        >
                          <span className="lowercase">( x )</span>
                        </Button>
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
                              className="p-12 w-full  h-auto bg-neutral-100"
                            />
                          )}
                        </div>

                        <div className="flex flex-col gap-3 p-0 min-w-0 h-full w-full border-l border-l-neutral-500">
                          <div className="flex flex-col justify-between h-full">
                            {/* Clear of the remove button (pr-14) */}
                            <span className="h2Style whitespace-normal leading-loose p-6 pr-14">
                              LL{item.title}
                            </span>

                            {/* Price, right below the title */}
                            <span className="font-baskervilleNeoDisplay text-xs uppercase tracking-[24%] whitespace-nowrap px-6 py-3">
                              {item.price}
                            </span>
                          </div>
                          {/* Amount, with − and + (− at one removes it), at the bottom */}
                          <div className="mt-auto flex items-center gap-0 w-full justify-between border-t border-t-neutral-400">
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
                            <span className="font-baskervilleNeoDisplay text-xs tabular-nums text-center h-full flex items-center justify-center border-x border-x-neutral-400 w-full">
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
              <div className="pb-6 pt-12 flex flex-col gap-6 border-t border-t-neutral-400 ">
                <div className="flex justify-center gap-6 items-baseline ">
                  <span className="h2Style">{t("subtotal")}</span>
                  <span className="h2Style">
                    {subtotal % 1 === 0 ? subtotal : subtotal.toFixed(2)} kr
                  </span>
                </div>

                <Button
                  variant="default"
                  size="default"
                  className="bg-foreground text-background font-baskervilleNeoText"
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
