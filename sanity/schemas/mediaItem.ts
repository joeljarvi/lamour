import { defineField, defineType } from "sanity";
import { mediaFields } from "./mediaDocument";

// One image or video in the Media Library: as many as needed, uploaded
// ahead of time; Hero Media picks the one in use
export default defineType({
  name: "mediaItem",
  title: "Media",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "For finding it in the library (not shown on the site)",
      validation: (r) => r.required(),
    }),
    ...mediaFields,
  ],
  preview: {
    select: {
      title: "title",
      mediaType: "mediaType",
      image: "image",
      poster: "poster",
    },
    prepare: ({ title, mediaType, image, poster }) => ({
      title,
      subtitle: mediaType,
      media: mediaType === "video" ? poster : image,
    }),
  },
});
