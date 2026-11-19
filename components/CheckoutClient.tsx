"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/contexts/CartContext";
import { SHIPPING_ZONES, type Delivery } from "@/lib/shipping";

// Stripe.js, loaded once (null without the publishable key)
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

const BUTTON =
  "pStyle cursor-pointer underline-offset-4 decoration-1 hover:underline";

// The checkout: Stripe's payment form embedded in the page. For the cart
// the buyer first picks where it's sent (Sweden, Europe, the rest of the
// world: the shipping price and the countries Stripe offers follow), or
// pickup at the office when it's offered (free, no address);
// for a subscription (`planId`, from the subscribe page) it starts at
// once. The session is made on the server (/api/checkout), which reads
// every price from Sanity
export default function CheckoutClient({
  planId,
  pickupAddress,
}: {
  planId?: string;
  // Set when pickup at the office is offered (Shipping Rates in Sanity):
  // where to collect it ("" when on without an address)
  pickupAddress?: string | null;
}) {
  const t = useTranslations("Checkout");
  const locale = useLocale();
  const { items } = useCart();
  const [chosenZone, setZone] = useState<Delivery | null>(null);
  // A subscription in the cart: everything goes to its zone (no choice)
  const subscriptionZone =
    items.find((i) => i.subscription)?.subscription?.zone ?? null;
  const zone: Delivery | null = subscriptionZone ?? chosenZone;
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Ready to start: a subscription, or the cart once a zone is chosen
  const ready = !!planId || (!!zone && items.length > 0);

  useEffect(() => {
    if (!ready || !stripePromise) return;
    let cancelled = false;
    fetch("/api/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(
        planId
          ? { planId, locale }
          : {
              zone,
              locale,
              items: items.map((i) => ({
                id: i.id,
                quantity: i.quantity,
                ...(i.subscription ? { subscription: true } : {}),
              })),
            },
      ),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok || !data.clientSecret) setError(data.error ?? t("error"));
        else setClientSecret(data.clientSecret);
      })
      .catch(() => !cancelled && setError(t("error")));
    return () => {
      cancelled = true;
    };
    // The cart's contents are fixed once the form is showing
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, zone, planId, locale]);

  if (!stripePromise) return <p className="pStyle">{t("notSetUp")}</p>;

  // The cart is empty (and no subscription chosen)
  if (!planId && items.length === 0)
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="pStyle">{t("emptyCart")}</p>
        <Link href="/" className={BUTTON}>
          {t("backToShop")}
        </Link>
      </div>
    );

  // The cart: first where to ship
  if (!planId && !zone)
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="pStyle">{t("chooseZone")}</p>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {[
            ...SHIPPING_ZONES,
            ...(pickupAddress != null ? (["pickup"] as const) : []),
          ].map((z) => (
            <button
              key={z}
              type="button"
              className={BUTTON}
              onClick={() => {
                setError(null);
                setClientSecret(null);
                setZone(z);
              }}
            >
              {t(`zone_${z}`)}
            </button>
          ))}
        </div>
      </div>
    );

  return (
    <div className="flex flex-col gap-6">
      {/* The chosen zone, and a way back to change it (not with a
          subscription: its zone is fixed) */}
      {!planId && zone && (
        <p className="pStyle flex flex-wrap gap-x-6">
          <span>
            {t(`zone_${zone}`)}
            {/* Pickup: where */}
            {zone === "pickup" && pickupAddress && (
              <span className="block whitespace-pre-line text-neutral-600">
                {t("pickupAt", { address: pickupAddress })}
              </span>
            )}
          </span>
          {!subscriptionZone && (
            <button
              type="button"
              className={BUTTON}
              onClick={() => {
                setZone(null);
                setClientSecret(null);
                setError(null);
              }}
            >
              {t("changeZone")}
            </button>
          )}
        </p>
      )}
      {error ? (
        <p className="pStyle">{error}</p>
      ) : clientSecret ? (
        // A fresh form for each session (e.g. after changing zone)
        <EmbeddedCheckoutProvider
          key={clientSecret}
          stripe={stripePromise}
          options={{ clientSecret }}
        >
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      ) : (
        <p className="pStyle text-neutral-500">{t("loading")}</p>
      )}
    </div>
  );
}
