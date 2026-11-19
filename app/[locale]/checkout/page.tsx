import type { Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import CheckoutClient from "@/components/CheckoutClient";
import { client } from "@/lib/sanity/client";
import { shippingRatesQuery } from "@/lib/sanity/queries";
import type { ShippingRates } from "@/lib/shipping";

// The checkout page: the cart, or a subscription (?plan=<id>, from the
// subscribe page), paid in Stripe's form embedded here
export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ plan?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const { plan } = await searchParams;
  const [t, rates] = await Promise.all([
    getTranslations("Checkout"),
    // Whether pickup at the office is offered, and where
    client
      .withConfig({ useCdn: false })
      .fetch<ShippingRates | null>(shippingRatesQuery),
  ]);

  return (
    <section className="min-h-dvh w-full px-3 pt-24 pb-24 lg:pl-0 lg:ml-(--layout-ml) lg:pr-(--layout-mr) lg:transition-[margin,padding] lg:duration-500 lg:ease-in-out">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 lg:mx-0">
        <h1 className="pStyle">{t("title")}</h1>
        <CheckoutClient
          planId={plan}
          pickupAddress={
            rates?.pickupEnabled ? (rates.pickupAddress?.trim() ?? "") : null
          }
        />
      </div>
    </section>
  );
}
