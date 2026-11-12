import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./sanity/schemas";

// Documents there's exactly one of, each with its id = its type
const SINGLETONS = [
  { id: "heroMedia", title: "Hero Media" },
  { id: "subscribeMedia", title: "Subscribe Media" },
  { id: "articlesHeroMedia", title: "Articles Hero Media" },
];
const SINGLETON_IDS = new Set(SINGLETONS.map(({ id }) => id));

export default defineConfig({
  name: "default",
  title: "L'Amour La Mort",
  basePath: "/studio",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.listItem()
              .title("Issues")
              .child(S.documentTypeList("issue").title("Issues")),
            S.listItem()
              .title("Articles")
              .child(S.documentTypeList("article").title("Articles")),
            S.listItem()
              .title("Authors")
              .child(S.documentTypeList("author").title("Authors")),
            S.listItem()
              .title("Series")
              .child(S.documentTypeList("series").title("Series")),
            // The hero's images and videos, any number (Hero Media picks
            // the one in use)
            S.listItem()
              .title("Media Library")
              .child(S.documentTypeList("mediaItem").title("Media Library")),
            // One document each, not a list
            ...SINGLETONS.map(({ id, title }) =>
              S.listItem()
                .title(title)
                .child(S.document().schemaType(id).documentId(id)),
            ),
          ]),
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
    // The singletons are one document each: no creating another
    templates: (templates) =>
      templates.filter((template) => !SINGLETON_IDS.has(template.schemaType)),
  },
  document: {
    // …and no deleting or duplicating it
    actions: (actions, { schemaType }) =>
      SINGLETON_IDS.has(schemaType)
        ? actions.filter(
            ({ action }) => action !== "delete" && action !== "duplicate",
          )
        : actions,
  },
});
