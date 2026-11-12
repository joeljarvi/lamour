import { defineField, defineType } from "sanity";

// The articles page hero's background: an image or video picked from the
// Media Library
export default defineType({
  name: "articlesHeroMedia",
  title: "Articles Hero Media",
  type: "document",
  fields: [
    defineField({
      name: "active",
      title: "Media in use",
      type: "reference",
      to: [{ type: "mediaItem" }],
      description:
        "The image or video shown in the articles page's hero. Upload new ones under Media Library, then pick one here",
    }),
  ],
  preview: {
    select: { title: "active.title" },
    prepare: ({ title }) => ({
      title: "Articles Hero Media",
      subtitle: title,
    }),
  },
});
