import { defineArrayMember, defineField, defineType } from "sanity";

// One shipping zone's price steps by the order's total weight: each step
// "up to N grams costs M kr", the first step the order's weight fits in
// applies (an order heavier than every step pays the last, heaviest one)
const zoneRates = (name: string, title: string, description: string) =>
  defineField({
    name,
    title,
    description,
    type: "array",
    of: [
      defineArrayMember({
        type: "object",
        name: "rate",
        fields: [
          defineField({
            name: "maxWeight",
            title: "Up to (grams)",
            type: "number",
            validation: (r) => r.required().positive(),
          }),
          defineField({
            name: "price",
            title: "Price (kr)",
            type: "number",
            validation: (r) => r.required().min(0),
          }),
        ],
        preview: {
          select: { maxWeight: "maxWeight", price: "price" },
          prepare: ({ maxWeight, price }) => ({
            title: `Up to ${maxWeight ?? "?"} g — ${price ?? "?"} kr`,
          }),
        },
      }),
    ],
  });

// Shipping prices for single-issue orders, by where they're sent and how
// much the order weighs (each issue's Weight, times how many). Used by the
// checkout; a zone without any steps can't be shipped to
export default defineType({
  name: "shippingRates",
  title: "Shipping Rates",
  type: "document",
  fields: [
    zoneRates("sweden", "Sweden", "Orders sent within Sweden"),
    zoneRates(
      "europe",
      "Europe",
      "The EU (outside Sweden), Norway, Iceland, Switzerland and the UK",
    ),
    zoneRates("world", "Rest of the world", "Everywhere else"),
    // Picking the order up at the office instead of having it sent
    defineField({
      name: "pickupEnabled",
      title: "Offer pickup at the office",
      type: "boolean",
      description:
        "On: “Pick up at our office” is offered at checkout, free, with no shipping address asked for",
      initialValue: false,
    }),
    defineField({
      name: "pickupAddress",
      title: "Pickup address",
      type: "text",
      rows: 3,
      description:
        "Where and when orders can be picked up, e.g. “Götgatan 1, Stockholm. Vardagar 10–16”. Shown at checkout",
      hidden: ({ document }) => !document?.pickupEnabled,
    }),
  ],
  preview: { prepare: () => ({ title: "Shipping Rates" }) },
});
