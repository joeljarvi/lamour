import { defineField, defineType } from "sanity";

// A subscription someone can buy on the subscribe page: a recurring
// payment (e.g. 450 kr a year), delivered to one shipping zone (its price
// includes shipping there). Only active plans are offered
export default defineType({
  name: "subscriptionPlan",
  title: "Subscription Plan",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "Shown on the subscribe page and in Stripe, e.g. “Ett år, Sverige”",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      description: "What's included, e.g. “Fyra nummer per år, fri frakt”",
    }),
    defineField({
      name: "price",
      title: "Price (kr)",
      type: "number",
      description: "Charged every billing period, shipping included",
      validation: (r) => r.required().positive(),
    }),
    defineField({
      name: "interval",
      title: "Billed every",
      type: "string",
      options: {
        list: [
          { title: "Month", value: "month" },
          { title: "Year", value: "year" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: "year",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "intervalCount",
      title: "Number of months / years per period",
      type: "number",
      description: "1 = every month/year, 2 = every two months/years…",
      initialValue: 1,
      validation: (r) => r.required().integer().min(1),
    }),
    defineField({
      name: "zone",
      title: "Ships to",
      type: "string",
      options: {
        list: [
          { title: "Sweden", value: "sweden" },
          { title: "Europe", value: "europe" },
          { title: "Rest of the world", value: "world" },
        ],
        layout: "radio",
      },
      initialValue: "sweden",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "active",
      title: "Offered",
      type: "boolean",
      description: "Off: hidden from the subscribe page (existing subscribers keep theirs)",
      initialValue: true,
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      description: "Lower numbers are listed first",
    }),
  ],
  orderings: [
    { title: "Order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: {
    select: { title: "title", price: "price", interval: "interval", active: "active" },
    prepare: ({ title, price, interval, active }) => ({
      title,
      subtitle: `${price ?? "?"} kr / ${interval === "month" ? "month" : "year"}${active === false ? " · not offered" : ""}`,
    }),
  },
});
