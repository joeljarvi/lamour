import { defineArrayMember, defineField, defineType } from "sanity";

// A hero's text as rich text: paragraphs, either normal or indented (the
// first line set in), with italics, bold and links (to a page on the site,
// e.g. /articles, or a full address to another site)
const richText = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: "array",
    of: [
      defineArrayMember({
        type: "block",
        styles: [
          { title: "Normal", value: "normal" },
          { title: "Indent", value: "indent" },
        ],
        lists: [],
        marks: {
          decorators: [
            { title: "Italic", value: "em" },
            { title: "Bold", value: "strong" },
          ],
          annotations: [
            defineArrayMember({
              name: "link",
              title: "Link",
              type: "object",
              fields: [
                defineField({
                  name: "href",
                  title: "Address",
                  type: "url",
                  description:
                    "A page on the site (e.g. /articles) or a full address (https://…)",
                  validation: (r) =>
                    r.uri({
                      allowRelative: true,
                      scheme: ["http", "https", "mailto"],
                    }),
                }),
              ],
            }),
          ],
        },
      }),
    ],
  });

// The text in each page's hero (the home page, the shop, the articles,
// about us and subscribe). Left empty, a page shows its built-in text
export default defineType({
  name: "heroTexts",
  title: "Hero Texts",
  type: "document",
  fields: [
    richText("home", "Home page"),
    richText("shop", "Shop"),
    richText("articles", "Articles"),
    richText("about", "About us"),
    richText("subscribe", "Subscribe"),
  ],
  preview: { prepare: () => ({ title: "Hero Texts" }) },
});
