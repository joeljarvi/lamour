import type { Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect, Link } from "@/i18n/navigation";
import { stripe } from "@/lib/stripe";
import ClearCart from "@/components/ClearCart";

// Where Stripe sends the buyer after paying (?session_id=…): the session
// is looked up on Stripe's side. Paid: a thank-you (and the cart emptied);
// still open (not finished): back to the checkout; otherwise: not paid
export default async function CheckoutReturnPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const { session_id } = await searchParams;
  const t = await getTranslations("Checkout");

  const session =
    stripe && session_id
      ? await stripe.checkout.sessions.retrieve(session_id).catch(() => null)
      : null;

  if (session?.status === "open")
    redirect({ href: "/checkout", locale: locale as Locale });

  const paid = session?.status === "complete";
  const email = session?.customer_details?.email ?? "";

  return (
    <section className="min-h-dvh w-full px-3 pt-24 pb-24 lg:px-6">
      <div className="mx-auto flex w-full max-w-2xl flex-col items-start gap-6">
        {paid ? (
          <>
            <ClearCart />
            <h1 className="pStyle">{t("thanksTitle")}</h1>
            <p className="pStyle">
              {session.mode === "subscription"
                ? t("thanksSubscription", { email })
                : t("thanksOrder", { email })}
            </p>
            <Link
              href="/"
              className="pStyle underline-offset-4 decoration-1 hover:underline"
            >
              {t("backToShop")}
            </Link>
          </>
        ) : (
          <>
            <h1 className="pStyle">{t("notPaid")}</h1>
            <Link
              href="/checkout"
              className="pStyle underline-offset-4 decoration-1 hover:underline"
            >
              {t("tryAgain")}
            </Link>
          </>
        )}
      </div>
    </section>
  );
}
