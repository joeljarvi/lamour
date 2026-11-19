// Shipping zones, the countries in each (Stripe asks for the address in
// one of them) and the price by weight (Shipping Rates in Sanity)

export type ShippingZone = "sweden" | "europe" | "world";
export const SHIPPING_ZONES: ShippingZone[] = ["sweden", "europe", "world"];

export const isShippingZone = (value: unknown): value is ShippingZone =>
  typeof value === "string" && (SHIPPING_ZONES as string[]).includes(value);

// ISO country codes Stripe may take the shipping address in, per zone
export const ZONE_COUNTRIES = {
  sweden: ["SE"],
  // The EU outside Sweden, plus Norway, Iceland, Switzerland, the UK
  europe: [
    "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
    "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK",
    "SI", "ES", "NO", "IS", "CH", "GB", "LI",
  ],
  // The rest of the world (the countries orders are most likely from;
  // add more here when needed)
  world: [
    "US", "CA", "MX", "BR", "AR", "CL", "CO", "PE", "UY", "AU", "NZ", "JP",
    "KR", "CN", "HK", "TW", "SG", "MY", "TH", "ID", "PH", "VN", "IN", "AE",
    "IL", "TR", "ZA", "EG", "MA", "KE", "NG", "UA", "RS", "BA", "ME", "MK",
    "AL", "MD", "GE", "AM",
  ],
} as const satisfies Record<ShippingZone, readonly string[]>;

// How an order reaches the buyer: sent to a zone, or picked up at the
// office (free, no address)
export type Delivery = ShippingZone | "pickup";
export const isDelivery = (value: unknown): value is Delivery =>
  value === "pickup" || isShippingZone(value);

// A zone's price steps: up to `maxWeight` grams costs `price` kr; and
// whether (and where) orders can be picked up instead
export type RateStep = { maxWeight: number; price: number };
export type ShippingRates = Partial<Record<ShippingZone, RateStep[] | null>> & {
  pickupEnabled?: boolean | null;
  pickupAddress?: string | null;
};

// The shipping price (kr) for an order of `grams` to `zone`: the first step
// (lightest first) the weight fits in; heavier than every step, the last
// one. Null when the zone has no steps set (it can't be shipped to)
export function shippingPrice(
  rates: ShippingRates | null,
  zone: ShippingZone,
  grams: number,
): number | null {
  const steps = [...(rates?.[zone] ?? [])]
    .filter((s) => s.maxWeight > 0 && s.price >= 0)
    .sort((a, b) => a.maxWeight - b.maxWeight);
  if (steps.length === 0) return null;
  return (steps.find((s) => grams <= s.maxWeight) ?? steps.at(-1)!).price;
}
