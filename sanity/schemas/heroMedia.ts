import { defineField, defineType } from "sanity";
import { mediaFields } from "./mediaDocument";

// The home page hero's background: the Media Library item chosen here.
// Until one is chosen, the image or video uploaded here before the library
// existed (its fields kept, hidden, so that upload still shows)
export default defineType({
  name: "heroMedia",
  title: "Hero Media",
  type: "document",
  fields: [
    defineField({
      name: "active",
      title: "Media in use",
      type: "reference",
      to: [{ type: "mediaItem" }],
      description:
        "The image or video shown in the hero. Upload new ones under Media Library, then pick one here",
    }),
    ...mediaFields.map((field) => ({
      ...field,
      hidden: true,
      validation: undefined,
    })),
  ],
  preview: {
    select: { title: "active.title" },
    prepare: ({ title }) => ({
      title: "Hero Media",
      subtitle: title,
    }),
  },
});
