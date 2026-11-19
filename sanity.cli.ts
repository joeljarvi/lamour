import { defineCliConfig } from "sanity/cli";

// For the Sanity command line (e.g. importing sanity/seed files):
// which project and dataset it works on (the same as the site's)
export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "mk8o4dr1",
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  },
});
