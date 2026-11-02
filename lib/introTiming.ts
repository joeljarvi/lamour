// Timing of the home page's intro, shared by the intro card and the navbar
// so each step starts when the one before has finished (all in seconds):
// the intro card fades in, then the tagline appears letter by letter, then
// "Skrolla ner" rises in, then the navbar word by word (the title opens up with scroll, not on a timer)

// The tagline under the title
export const TAGLINE = "en tids skrift";

// The tagline: when it starts (once the intro card has faded in), the time
// between letters, and each letter's fade
export const TAGLINE_AT = 0.8;
export const LETTER_STAGGER = 0.06;
export const LETTER_FADE = 0.3;

// "Skrolla ner": rises in from the bottom once the tagline's last letter
// has faded in, and how long that takes
export const HINT_AT =
  TAGLINE_AT + (Array.from(TAGLINE).length - 1) * LETTER_STAGGER + LETTER_FADE;
export const HINT_DURATION = 0.6;

// The navbar: once "Skrolla ner" is in place, the time between words, and
// each word's fade
export const NAV_AT = HINT_AT + HINT_DURATION;
export const WORD_STAGGER = 0.12;
export const WORD_FADE = 0.4;
