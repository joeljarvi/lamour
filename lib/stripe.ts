import "server-only";
import Stripe from "stripe";

// The Stripe client, server only (it holds the secret key). Null when the
// key isn't set yet, so the checkout routes can answer with a clear error
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;
