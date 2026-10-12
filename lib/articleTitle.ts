// Interview titles are stored as "INTERVJU • NAME" in Sanity; the series
// already says they're interviews, so drop the prefix when displaying.
const INTERVIEW_PREFIX = /^intervju\s*•\s*/i;

export function articleTitle(title: string) {
  return title.replace(INTERVIEW_PREFIX, "");
}
