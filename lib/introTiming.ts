// Timing of the home page's intro, shared by the intro card and the navbar
// so each step starts when the one before has finished (all in seconds):
// 1. the navbar's title (L'Amour — La Mort), word by word
// 2. the tagline, fading in
// 3. "Senaste numret", fading in
// 4. the latest issue's cover and its number + title, fading in
// 5. "Läs mer" / "Bli prenumerant"
// 6. the rest of the navbar, word by word

// The intro card's tagline
export const TAGLINE = "en tids skrift";

// Words (the navbar): the time between them, and each one's fade
export const WORD_STAGGER = 0.12;
export const WORD_FADE = 0.4;

// When a word-by-word reveal of `count` words starting at `at` has
// finished
const wordsEnd = (at: number, count: number) =>
  at + (count - 1) * WORD_STAGGER + WORD_FADE;

// 1. The navbar's title: its four words (L'Amour, —, La, Mort)
export const LOGO_AT = 0.3;
// 2. The tagline
export const TAGLINE_AT = wordsEnd(LOGO_AT, 4);
export const TAGLINE_FADE = 0.6;
// 3. "Senaste numret"
export const NEW_ISSUE_AT = TAGLINE_AT + TAGLINE_FADE;
export const NEW_ISSUE_FADE = 0.4;
// 4. The cover, and the issue's number + title
export const COVER_AT = NEW_ISSUE_AT + NEW_ISSUE_FADE;
export const COVER_FADE = 0.8;
// 5. "Läs mer" / "Bli prenumerant"
export const BUTTONS_AT = COVER_AT + COVER_FADE;
export const BUTTONS_FADE = 0.4;
// 6. The rest of the navbar
export const NAV_AT = BUTTONS_AT + BUTTONS_FADE;
