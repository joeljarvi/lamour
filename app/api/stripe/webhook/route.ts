import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

// Stripe calls this when something happens to a payment (set the endpoint
// up in Stripe: Developers → Webhooks → https://<site>/api/stripe/webhook,
// and put its signing secret in STRIPE_WEBHOOK_SECRET). Each call is
// checked against that secret, so only Stripe can trigger it
export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret)
    return NextResponse.json({ error: "Stripe isn't set up" }, { status: 500 });

  const signature = request.headers.get("stripe-signature");
  if (!signature)
    return NextResponse.json({ error: "No signature" }, { status: 400 });

  let event;
  try {
    // The raw body, exactly as Stripe sent it (needed for the signature)
    event = stripe.webhooks.constructEvent(
      await request.text(),
      signature,
      secret,
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      // A paid order or a new subscription. TODO: fulfilment (e.g. mail
      // the order to whoever packs it, lower stock in Sanity). For now
      // it's logged; every order is also in the Stripe dashboard
      const session = event.data.object;
      console.log(
        `[stripe] ${session.metadata?.kind ?? "checkout"} completed: ${session.id}, ${session.amount_total} ${session.currency}`,
      );
      break;
    }
    case "invoice.paid":
      // A subscription renewed
      console.log(`[stripe] subscription paid: ${event.data.object.id}`);
      break;
  }

  return NextResponse.json({ received: true });
}
