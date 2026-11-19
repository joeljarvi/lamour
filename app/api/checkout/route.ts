import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { client } from "@/lib/sanity/client";
import { urlFor } from "@/lib/sanity/image";
import {
  checkoutIssuesQuery,
  shippingRatesQuery,
  subscriptionPlanQuery,
} from "@/lib/sanity/queries";
import {
  isDelivery,
  shippingPrice,
  type Delivery,
  ZONE_COUNTRIES,
  type ShippingRates,
  type ShippingZone,
} from "@/lib/shipping";
import { issueTitle } from "@/lib/issueTitle";
import { routing } from "@/i18n/routing";

// Straight from Sanity (not its CDN): prices must be current
const sanity = client.withConfig({ useCdn: false });

type CheckoutIssue = {
  _id: string;
  title: string;
  issueNumber: number;
  price?: number;
  weight?: number;
  inStock?: boolean;
  cover?: { asset?: unknown };
};

type Plan = {
  _id: string;
  title: string;
  description?: string;
  price: number;
  interval: "month" | "year";
  intervalCount?: number;
  zone: ShippingZone;
};

// Kronor to öre (Stripe counts in the smallest unit)
const ore = (kr: number) => Math.round(kr * 100);

const error = (message: string, status = 400) =>
  NextResponse.json({ error: message }, { status });

// Starts an embedded Stripe Checkout and returns its client secret, for
// either
//  - the cart: { items: [{ id, quantity, subscription? }], zone, locale }
//    — issues (prices, titles and weights from Sanity; shipping from
//    Shipping Rates by their total weight and the chosen zone, or zone
//    "pickup": collected at the office, free, no address) and at most one
//    subscription plan (subscription: true; its price and interval from
//    Sanity, shipping included; then everything goes to the plan's zone,
//    the issues and their shipping charged with its first payment); or
//  - just a subscription: { planId, locale } (older links, ?plan=).
// The browser only says what and where; it never sets a price
export async function POST(request: NextRequest) {
  if (!stripe)
    return error("Stripe isn't set up (STRIPE_SECRET_KEY is missing)", 500);

  let body: {
    items?: { id?: unknown; quantity?: unknown; subscription?: unknown }[];
    zone?: unknown;
    planId?: unknown;
    locale?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON");
  }

  const locale =
    typeof body.locale === "string" &&
    (routing.locales as readonly string[]).includes(body.locale)
      ? body.locale
      : routing.defaultLocale;
  // Where Stripe sends the buyer afterwards (English has no prefix)
  const returnUrl = `${request.nextUrl.origin}${
    locale === routing.defaultLocale ? "" : `/${locale}`
  }/checkout/return?session_id={CHECKOUT_SESSION_ID}`;
  const stripeLocale = locale === "sv" ? "sv" : "en";

  // ── A subscription ──
  if (typeof body.planId === "string") {
    const plan = await sanity.fetch<Plan | null>(subscriptionPlanQuery, {
      id: body.planId,
    });
    if (!plan) return error("That subscription isn't offered", 404);

    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded_page",
      mode: "subscription",
      locale: stripeLocale,
      return_url: returnUrl,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "sek",
            unit_amount: ore(plan.price),
            recurring: {
              interval: plan.interval,
              interval_count: plan.intervalCount ?? 1,
            },
            product_data: {
              name: plan.title,
              ...(plan.description ? { description: plan.description } : {}),
            },
          },
        },
      ],
      shipping_address_collection: {
        allowed_countries: [...ZONE_COUNTRIES[plan.zone]],
      },
      metadata: { kind: "subscription", planId: plan._id },
    });
    return NextResponse.json({ clientSecret: session.client_secret });
  }

  // ── The cart: issues, and at most one subscription plan ──
  // Each issue once, with a sensible quantity (1–20); the (first) plan
  const quantities = new Map<string, number>();
  let planId: string | null = null;
  for (const item of body.items ?? []) {
    if (typeof item.id !== "string") continue;
    if (item.subscription === true) {
      planId ??= item.id;
      continue;
    }
    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity)) continue;
    quantities.set(
      item.id,
      Math.min(20, Math.max(1, (quantities.get(item.id) ?? 0) + quantity)),
    );
  }
  if (quantities.size === 0 && !planId) return error("The cart is empty");

  const [issues, rates, plan] = await Promise.all([
    quantities.size > 0
      ? sanity.fetch<CheckoutIssue[]>(checkoutIssuesQuery, {
          ids: [...quantities.keys()],
        })
      : Promise.resolve([] as CheckoutIssue[]),
    sanity.fetch<ShippingRates | null>(shippingRatesQuery),
    planId
      ? sanity.fetch<Plan | null>(subscriptionPlanQuery, { id: planId })
      : Promise.resolve(null),
  ]);
  if (planId && !plan) return error("That subscription isn't offered", 404);
  if (issues.length !== quantities.size)
    return error("Something in the cart is no longer for sale", 409);
  const unavailable = issues.find(
    (issue) => issue.inStock === false || issue.price == null,
  );
  if (unavailable)
    return error(
      `${issueTitle(unavailable.title)} can't be bought right now`,
      409,
    );

  // Where it goes: with a subscription always posted to the plan's zone
  // (the issues with it too); otherwise the chosen zone, or "pickup"
  // (collected at the office, if offered in Shipping Rates)
  let delivery: Delivery;
  if (plan) delivery = plan.zone;
  else if (isDelivery(body.zone)) delivery = body.zone;
  else return error("Choose where to ship to");
  const pickup = delivery === "pickup";
  if (pickup && !rates?.pickupEnabled)
    return error("Pickup isn't offered right now", 409);

  // The issues' shipping by their total weight (an issue without a
  // weight in Sanity counts as 0 g); nothing when picked up, or with no
  // issues (a subscription's shipping is in its price)
  const grams = issues.reduce(
    (sum, issue) => sum + (issue.weight ?? 0) * quantities.get(issue._id)!,
    0,
  );
  const shipping =
    pickup || issues.length === 0
      ? 0
      : shippingPrice(rates, delivery as ShippingZone, grams);
  if (shipping == null)
    return error("There's no shipping price for that destination yet", 409);
  const pickupAddress = rates?.pickupAddress?.trim();
  const shippingName = pickup
    ? locale === "sv"
      ? "Hämtas på kontoret"
      : "Pickup at the office"
    : locale === "sv"
      ? "Frakt"
      : "Shipping";

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
    // The subscription: charged every period (shipping included)
    ...(plan
      ? [
          {
            quantity: 1,
            price_data: {
              currency: "sek",
              unit_amount: ore(plan.price),
              recurring: {
                interval: plan.interval,
                interval_count: plan.intervalCount ?? 1,
              },
              product_data: {
                name: plan.title,
                ...(plan.description ? { description: plan.description } : {}),
              },
            },
          },
        ]
      : []),
    // The issues: charged once
    ...issues.map((issue) => ({
      quantity: quantities.get(issue._id)!,
      price_data: {
        currency: "sek",
        unit_amount: ore(issue.price!),
        product_data: {
          name: `#${issue.issueNumber} — ${issueTitle(issue.title)}`,
          ...(issue.cover?.asset
            ? {
                images: [
                  urlFor(issue.cover as Parameters<typeof urlFor>[0])
                    .width(600)
                    .url(),
                ],
              }
            : {}),
          metadata: { issueId: issue._id },
        },
      },
    })),
    // With a subscription the issues' shipping is a line of its own,
    // charged once (Stripe's shipping options are for one-off payments)
    ...(plan && shipping > 0
      ? [
          {
            quantity: 1,
            price_data: {
              currency: "sek",
              unit_amount: ore(shipping),
              product_data: { name: shippingName },
            },
          },
        ]
      : []),
  ];

  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded_page",
    // A subscription in the cart: a subscription checkout (the issues and
    // their shipping on its first payment); otherwise a one-off payment
    mode: plan ? "subscription" : "payment",
    locale: stripeLocale,
    return_url: returnUrl,
    line_items: lineItems,
    // Sent: a shipping address in the zone's countries. Picked up: no
    // address, but a phone number (to say it's ready), and where to
    // collect it shown by the pay button
    ...(pickup
      ? {
          phone_number_collection: { enabled: true },
          ...(pickupAddress
            ? {
                custom_text: {
                  submit: {
                    message:
                      `${locale === "sv" ? "Hämtas på" : "Pick up at"}: ${pickupAddress}`.slice(
                        0,
                        1200,
                      ),
                  },
                },
              }
            : {}),
        }
      : {
          shipping_address_collection: {
            allowed_countries: [...ZONE_COUNTRIES[delivery as ShippingZone]],
          },
        }),
    // One-off payments: shipping as Stripe's shipping option
    ...(plan
      ? {}
      : {
          shipping_options: [
            {
              shipping_rate_data: {
                type: "fixed_amount" as const,
                display_name: shippingName,
                fixed_amount: { amount: ore(shipping), currency: "sek" },
              },
            },
          ],
        }),
    metadata: {
      kind: plan
        ? issues.length
          ? "subscription+issues"
          : "subscription"
        : "issues",
      delivery,
      grams: String(grams),
      ...(plan ? { planId: plan._id } : {}),
    },
  });

  return NextResponse.json({ clientSecret: session.client_secret });
}
