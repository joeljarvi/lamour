// Issue titles are stored as "#<number> - <name>" in Sanity; the number is
// shown separately (LL#<number>), so drop the prefix when displaying.
const ISSUE_PREFIX = /^#\d+\s*[-–—]?\s*/;

export function issueTitle(title: string) {
  return title.replace(ISSUE_PREFIX, "");
}
