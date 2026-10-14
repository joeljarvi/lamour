// Timing of the home page hero's intro sequence (HomeClient), shared with
// LLNav so the nav can wait for it to finish.

// When the photo comes in and the title / subtitle move apart
export const HERO_PHOTO_DELAY_MS = 2000;

// When the whole sequence is done (photo delay + its 0.3s delay + 1.2s fade)
export const HERO_INTRO_MS = HERO_PHOTO_DELAY_MS + 1500;
