import { getTranslations } from "next-intl/server";
import AddPlanToCart from "./AddPlanToCart";
import { client } from "@/lib/sanity/client";
import { subscriptionPlansQuery } from "@/lib/sanity/queries";
import type { ShippingZone } from "@/lib/shipping";

type Plan = {
  _id: string;
  title: string;
  description?: string;
  price: number;
  interval: "month" | "year";
  intervalCount?: number;
  zone: ShippingZone;
};

export default async function SubscriptionPlans() {
  const [plans, t] = await Promise.all([
    client.withConfig({ useCdn: false }).fetch<Plan[]>(subscriptionPlansQuery),
    getTranslations("Checkout"),
  ]);

  return (
    // id: the subscribe page's submenu link ("Prenumerationer")
    <section
      id="plans"
      data-section="plans"
      className="w-full px-3 py-24 lg:pl-0 lg:ml-(--layout-ml) lg:pr-(--layout-mr) lg:transition-[margin,padding] lg:duration-500 lg:ease-in-out"
    >
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 lg:mx-0">
        <h2 className="pStyle">{t("plansTitle")}</h2>
        {plans.length === 0 ? (
          <p className="pStyle text-neutral-500">{t("noPlans")}</p>
        ) : (
          <ul className="flex flex-col">
            {plans.map((plan) => (
              <li
                key={plan._id}
                className="flex flex-col gap-1 border-t border-foreground py-3 lg:flex-row lg:items-baseline lg:justify-between lg:gap-6"
              >
                <div className="flex flex-col gap-1">
                  <span className="pStyle">{plan.title}</span>
                  {plan.description && (
                    <span className="pStyle text-neutral-600">
                      {plan.description}
                    </span>
                  )}
                  <span className="pStyle text-neutral-600">
                    {t(`zone_${plan.zone}`)}
                  </span>
                </div>
                <div className="flex items-baseline gap-6">
                  <span className="pStyle whitespace-nowrap">
                    {plan.price}{" "}
                    {t(plan.interval === "month" ? "perMonth" : "perYear", {
                      count: plan.intervalCount ?? 1,
                    })}
                  </span>
                  {/* "Välj": into the cart (with how often it's billed,
                      e.g. "/ år", for the cart to show) */}
                  <AddPlanToCart
                    plan={plan}
                    period={t(
                      plan.interval === "month" ? "perMonth" : "perYear",
                      { count: plan.intervalCount ?? 1 },
                    ).replace(/^SEK\s*/, "")}
                    label={t("choosePlan")}
                    className="pStyle cursor-pointer underline underline-offset-4 decoration-1 hover:opacity-60"
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
