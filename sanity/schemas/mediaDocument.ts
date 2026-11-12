import { defineField, defineType } from "sanity";

// An image or a video: the fields of a section background (Subscribe
// Media) and of a Media Library item (the hero's choices)
export const mediaFields = [
  defineField({
    name: "mediaType",
    title: "Media Type",
    type: "string",
    options: {
      list: [
        { title: "Image", value: "image" },
        { title: "Video", value: "video" },
      ],
      layout: "radio",
    },
    initialValue: "image",
    validation: (r) => r.required(),
  }),
  defineField({
    name: "image",
    title: "Image",
    type: "image",
    options: { hotspot: true },
    hidden: ({ parent }) => parent?.mediaType !== "image",
    validation: (r) =>
      r.custom((value, { parent }) =>
        (parent as { mediaType?: string })?.mediaType === "image" && !value
          ? "Upload an image"
          : true,
      ),
    fields: [
      defineField({
        name: "alt",
        title: "Alt Text",
        type: "string",
      }),
    ],
  }),
  defineField({
    name: "video",
    title: "Video",
    type: "file",
    description:
      "Plays muted on a loop (in the hero, the sound can be turned on). MP4, WebM or MOV, ideally under 20 MB: it's served as uploaded. MOVs must be H.264 (iPhone videos in HEVC/High Efficiency won't play in Chrome or Firefox): export as H.264 or MP4 if unsure",
    options: { accept: "video/mp4,video/webm,video/quicktime,.mov" },
    hidden: ({ parent }) => parent?.mediaType !== "video",
    validation: (r) =>
      r.custom((value, { parent }) =>
        (parent as { mediaType?: string })?.mediaType === "video" && !value
          ? "Upload a video"
          : true,
      ),
  }),
  defineField({
    name: "poster",
    title: "Video Poster",
    type: "image",
    description:
      "Optional. Shown while the video loads, and instead of it for visitors who prefer reduced motion",
    hidden: ({ parent }) => parent?.mediaType !== "video",
  }),
];

// A background for a section of the site: one document each (see
// sanity.config.ts's SINGLETONS), holding an image or a video
export function mediaDocument(name: string, title: string) {
  return defineType({
    name,
    title,
    type: "document",
    fields: mediaFields,
    preview: {
      select: { mediaType: "mediaType", media: "image" },
      prepare: ({ mediaType, media }) => ({
        title,
        subtitle: mediaType,
        media,
      }),
    },
  });
}
