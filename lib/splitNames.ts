// Sanity's Contributors and Editors fields hold one name per line or comma
export function splitNames(names?: string): string[] {
  return (names ?? "")
    .split(/[\n,]/)
    .map((name) => name.trim())
    .filter(Boolean);
}
