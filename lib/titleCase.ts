// For display: each word with a capital first letter, the rest lower case
// ("ALICE STENBERG" / "alice stenberg" → "Alice Stenberg"), also after a
// hyphen, dash, slash, ampersand or bracket
export const titleCase = (text: string) =>
  text
    .toLocaleLowerCase("sv")
    .replace(/(^|[\s\-–—/&(])(\p{L})/gu, (_, before: string, letter: string) =>
      before + letter.toLocaleUpperCase("sv"),
    );
