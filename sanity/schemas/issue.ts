import { defineField, defineType } from "sanity";

export default defineType({
  name: "issue",
  title: "Issue",
  type: "document",
  orderings: [
    {
      title: "Issue Number",
      name: "issueNumberDesc",
      by: [{ field: "issueNumber", direction: "desc" }],
    },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "issueNumber",
      title: "Issue Number",
      type: "number",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "language",
      title: "Language",
      type: "string",
      options: {
        list: [
          { title: "Swedish", value: "sv" },
          { title: "English", value: "en" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: "sv",
    }),
    defineField({
      name: "cover",
      title: "Cover",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt Text",
          type: "string",
          validation: (r) => r.required(),
        }),
      ],
    }),
    defineField({
      name: "productImage",
      title: "Product Image",
      type: "image",
      description:
        "Optional. Shown on the issue's tile in the shop instead of the cover when \"Use product image\" is on",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt Text",
          type: "string",
        }),
      ],
    }),
    defineField({
      name: "useProductImage",
      title: "Use product image",
      type: "boolean",
      description:
        "On: the shop tile shows the product image instead of the cover",
      initialValue: false,
    }),
    defineField({
      name: "previewImages",
      title: "Preview Images",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alt Text",
              type: "string",
              validation: (r) => r.required(),
            }),
          ],
        },
      ],
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "Heading 1", value: "h1" },
            { title: "Heading 2", value: "h2" },
            { title: "Blockquote", value: "blockquote" },
            { title: "Quote", value: "quote" },
          ],
          lists: [],
          marks: {
            decorators: [
              { title: "Strong", value: "strong" },
              { title: "Emphasis", value: "em" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Link",
                fields: [{ name: "href", type: "url", title: "URL" }],
              },
            ],
          },
        },
      ],
    }),
    defineField({
      name: "contributors",
      title: "Contributors",
      type: "text",
    }),
    defineField({
      name: "editors",
      title: "Editors",
      type: "text",
      description: "One name per line or comma",
    }),
    defineField({
      name: "quotes",
      title: "Quotes",
      type: "array",
      of: [
        {
          type: "object",
          name: "quote",
          title: "Quote",
          fields: [
            defineField({ name: "text", title: "Text", type: "text" }),
            defineField({ name: "author", title: "Author", type: "string" }),
          ],
          preview: { select: { title: "text", subtitle: "author" } },
        },
      ],
    }),
    defineField({
      name: "credits",
      title: "Credits",
      type: "array",
      of: [
        {
          type: "object",
          name: "credit",
          title: "Credit",
          fields: [
            defineField({ name: "role", title: "Role", type: "string" }),
            defineField({ name: "name", title: "Name", type: "string" }),
          ],
          preview: { select: { title: "name", subtitle: "role" } },
        },
      ],
    }),
    defineField({
      name: "price",
      title: "Price (SEK)",
      type: "number",
      description: "Enter in SEK, e.g. 220. Multiply by 100 when sending to Stripe.",
    }),
    defineField({
      name: "weight",
      title: "Weight (grams)",
      type: "number",
    }),
    defineField({
      name: "stripePriceId",
      title: "Stripe Price ID",
      type: "string",
      description: "Populate when Stripe is integrated",
    }),
    defineField({
      name: "inStock",
      title: "In Stock",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "date",
    }),
    defineField({
      name: "releaseDate",
      title: "Release Date",
      type: "date",
      description: "When the issue is (or was) released",
    }),
    defineField({
      name: "dimensions",
      title: "Dimensions",
      type: "object",
      description: "Physical dimensions in millimeters",
      fields: [
        defineField({
          name: "cover",
          title: "Cover",
          type: "object",
          fields: [
            defineField({ name: "width", title: "Width (mm)", type: "number" }),
            defineField({ name: "height", title: "Height (mm)", type: "number" }),
          ],
        }),
        defineField({
          name: "spine",
          title: "Spine",
          type: "object",
          fields: [
            defineField({ name: "width", title: "Width (mm)", type: "number" }),
          ],
        }),
      ],
    }),
    defineField({
      name: "pageCount",
      title: "Number of Pages",
      type: "number",
    }),
    defineField({
      name: "isbn",
      title: "ISBN",
      type: "string",
      description: "e.g. 978-3-85676-501-9",
    }),
    defineField({
      name: "binding",
      title: "Binding",
      type: "string",
      options: {
        list: [
          { title: "Softcover", value: "softcover" },
          { title: "Hardcover", value: "hardcover" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
    }),
  ],
});
