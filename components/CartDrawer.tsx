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
import { issueNumberLabel, issueTitle } from "@/lib/issueTitle";

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

  // Closed with Escape too (or "Stäng", or the backdrop)
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen, setDrawerOpen]);

  // Small capitals, text-2: the items' and the footer's text
  const SC = "text-2 tracking-normal [font-variant-caps:all-small-caps]";
  // A text button (no fill): "−", "+", "Ta bort", "Stäng"
  const TEXT_BTN =
    "[font-variant-caps:all-small-caps] cursor-pointer underline-offset-4 hover:underline disabled:cursor-default disabled:opacity-30 disabled:no-underline";
  const total = subtotal % 1 === 0 ? subtotal : subtotal.toFixed(2);

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          {/* Backdrop, over the page (and the navbar, except on desktop,
              where the navbar rises above the cart so "Korg" stays on top) */}
          <motion.div
            className="fixed inset-0 z-100 bg-foreground/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setDrawerOpen(false)}
          />

          {/* The drawer: the screen's full height, on the right (a quarter
              of the screen on desktop) */}
          <motion.div
            role="dialog"
            aria-label={t("closeLabel")}
            className="fixed top-0 right-0 bottom-0 z-100 w-[calc(100vw-2rem)] lg:w-1/4 bg-background flex flex-col shadow-md font-baskervilleNeoText text-1"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* "Stäng", top left */}
            <div className="flex px-5 pt-5 pb-2.5">
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label={t("closeLabel")}
                className={`${SC} ${TEXT_BTN}`}
              >
                {t("close")}
              </button>
            </div>

            {/* The items, scrolling (no scrollbar) */}
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none px-5">
              {items.length === 0 ? (
                <p className="py-3">{t("empty")}</p>
              ) : (
                <ul className="flex flex-col list-none">
                  {items.map((item) => {
                    const issue = issues.find((i) => i._id === item.id);
                    const cover = issue?.cover;
                    return (
                      // One item, lines above and below: the cover (always
                      // 128px tall, its width its own), 24px on the number
                      // and title top left, "− 1 + Ta bort", the price
                      // bottom right
                      <li
                        key={item.id}
                        className="flex gap-x-6 border-t border-foreground py-5  last:border-b"
                      >
                        {cover?.asset && (
                          <Image
                            src={urlFor(cover).width(400).url()}
                            alt=""
                            width={400}
                            height={550}
                            sizes="120px"
                            className="block h-32 w-auto shrink-0 shadow"
                          />
                        )}
                        <div
                          className={`flex min-w-0 flex-1 flex-col justify-between gap-3 ${SC}`}
                        >
                          <div className="flex flex-col">
                            <h3 className="flex gap-x-3">
                              {issue && (
                                <span className="shrink-0">
                                  {issueNumberLabel(issue)}
                                </span>
                              )}
                              <span className="min-w-0">
                                {issue ? issueTitle(issue.title) : item.title}
                                {/* A subscription: how often (e.g. "/ år") */}
                                {item.subscription &&
                                  ` ${item.subscription.period}`}
                              </span>
                            </h3>
                          </div>
                          {/* At the bottom, on one baseline: "− 1 +" and
                              "Ta bort" on the left, the price on the right */}
                          <div className="flex items-baseline justify-between gap-x-3">
                            {/* "− 1 +" (a subscription is always one), then
                                "Ta bort" */}
                            <div className="flex items-baseline gap-x-3">
                              {!item.subscription && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => decreaseQuantity(item.id)}
                                    aria-label={t("decrease", {
                                      title: item.title,
                                    })}
                                    className={TEXT_BTN}
                                  >
                                    −
                                  </button>
                                  <span className="text-2 [font-variant-caps:all-small-caps]">
                                    {item.quantity}
                                  </span>
                                  <button
                                    type="button"
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
                                    className={TEXT_BTN}
                                  >
                                    +
                                  </button>
                                </>
                              )}
                              <button
                                type="button"
                                onClick={() => removeFromCart(item.id)}
                                aria-label={t("remove", { title: item.title })}
                                className={`ml-3 ${TEXT_BTN}`}
                              >
                                {t("removeOne")}
                              </button>
                            </div>
                            <p>{item.price}</p>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* At the bottom: the subtotal, "Till kassan", "Fortsätt
                handla" */}
            {items.length > 0 && (
              <div className="flex flex-col gap-3 p-5">
                <p
                  className={`flex items-baseline justify-between border-t border-foreground pt-3 ${SC}`}
                >
                  <span>{t("subtotal")}</span>
                  <span>{total} SEK</span>
                </p>
                {/* The two buttons, 8px apart */}
                <div className="flex flex-col gap-2">
                  {/* To the checkout page (closing the cart) */}
                  <Button
                    variant="primary"
                    size="pill-lg"
                    // Filled from the start (pill-lg alone is clear until hovered)
                    className={`w-full bg-primary text-secondary hover:opacity-90 font-normal ${SC}`}
                    asChild
                  >
                    <Link href="/checkout" onClick={() => setDrawerOpen(false)}>
                      {t("checkout")}
                    </Link>
                  </Button>
                  {/* Closes the cart, back to the page */}
                  <Button
                    variant="secondary"
                    size="pill-lg"
                    className={`w-full bg-secondary text-foreground hover:text-secondary font-normal ${SC}`}
                    onClick={() => setDrawerOpen(false)}
                  >
                    {t("continueShopping")}
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
