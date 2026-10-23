import { defineField, defineType } from "sanity";

export default defineType({
  name: "article",
  title: "Article",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "subtitle",
      title: "Subtitle",
      type: "string",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "reference",
      to: [{ type: "author" }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "issue",
      title: "Issue",
      type: "reference",
      to: [{ type: "issue" }],
    }),
    defineField({
      name: "series",
      title: "Series",
      type: "reference",
      to: [{ type: "series" }],
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt / Caption",
          type: "string",
        }),
      ],
    }),
    defineField({
      name: "body",
      title: "Body",
      description:
        "Drag images straight into the text (or paste them) where they should appear — they show in that spot on the site.",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "Heading 1", value: "h1" },
            { title: "Heading 2", value: "h2" },
            { title: "Heading 3", value: "h3" },
            { title: "Blockquote", value: "blockquote" },
            { title: "Quote", value: "quote" },
            { title: "Preamble", value: "preamble" },
            { title: "Key", value: "key" },
            { title: "Name", value: "name" },
          ],
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
        // Images in the text: dropped or pasted into the editor, they're
        // uploaded and placed at that point
        {
          type: "image",
          title: "Image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alt / Caption",
              type: "string",
            }),
            // How the reader lays the image out
            defineField({
              name: "placement",
              title: "Placement",
              type: "string",
              options: {
                list: [
                  {
                    title: "Inline — small, in the text where it's placed",
                    value: "inline",
                  },
                  {
                    title:
                      "Sticky — beside the text that follows it, staying in view while it's read",
                    value: "sticky",
                  },
                  {
                    title: "Wide — full width, between the text",
                    value: "wide",
                  },
                ],
                layout: "radio",
              },
              initialValue: "inline",
            }),
          ],
        },
      ],
    }),
    // The colour of the article's tile, its reader's top bar, hero and
    // footer; with none chosen, the site picks one in turn
    defineField({
      name: "color",
      title: "Color",
      type: "string",
      options: {
        list: [
          { title: "Red", value: "red" },
          { title: "Purple", value: "purple" },
          { title: "Green", value: "green" },
          { title: "Yellow", value: "yellow" },
          { title: "Pink", value: "pink" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Article", value: "article" },
          { title: "Interview", value: "interview" },
          { title: "Freeform", value: "freeform" },
        ],
        layout: "radio",
      },
      initialValue: "article",
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
    }),
  ],
});
