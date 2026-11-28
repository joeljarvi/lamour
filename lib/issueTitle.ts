// Issue titles are stored as "#<number> - <name>" in Sanity, a double issue
// as "#<number>-<number> <name>" ("#22-23 DRUNK"); the number is shown
// separately, so drop the prefix when displaying.
const ISSUE_PREFIX = /^#\d+(?:\s*[-–—]\s*#?\d+(?=\s))?\s*[-–—]?\s*/;

// A double issue's second number ("#22-23 DRUNK" → 23)
const DOUBLE_ISSUE = /^#\d+\s*[-–—]\s*#?(\d+)(?=\s)/;

export function issueTitle(title: string) {
  return title.replace(ISSUE_PREFIX, "");
}

// The issue's number as shown: "#22", or "#22—#23" for a double issue
export function issueNumberLabel(issue: {
  issueNumber?: number | string;
  title: string;
}) {
  const second = issue.title.match(DOUBLE_ISSUE)?.[1];
  return second
    ? `#${issue.issueNumber}—#${second}`
    : `#${issue.issueNumber}`;
}
