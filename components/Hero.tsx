// The about text: in the hero, and HeroSection's text when Hero Texts in
// Sanity has none
export const ABOUT_TEXT =
  "Sedan 2017 har vi samlat ung litteratur under ett skevt konsthistoriskt paraply och publicerat över hundra författare och konstnärer i början, mitten, och slutet av sina karriärer. Målet? Att ge skimret av ett samlad förtrupp. Att historisera allt nu. En tids skrift av text och bild.";

// The pages' hero (home, articles, a series): a full screen, the text
// across a 12-column grid, centred vertically: `title` above a line,
// `text` below it (columns 3–10). Hidden unless `visible` (the home and
// articles pages' is off for now)
export default function Hero({
  title = "En tids skrift",
  text = ABOUT_TEXT,
  visible = false,
}: {
  title?: string;
  text?: string;
  visible?: boolean;
}) {
  return (
    <>
      {/* The hero: the theme's light shade (bg-secondary), the text over
          it. Hidden for now */}
      {/* id="hero": the navbar turns dark (bg-primary) once past it */}
      <div
        id="hero"
        className={`relative overflow-hidden h-screen ${visible ? "flex" : "hidden"} w-full  px-6 gap-2 font-baskervilleNeoDisplay text-4 flex-col items-center justify-center`}
      >
        {/* Hero Media as its background is off for now:
            <BackgroundMedia media={heroMedia} priority veil={false} /> */}
        <div className="relative z-10 grid grid-cols-12 w-full  items-center justify-center px-3 text-foreground border-b border-b-foreground">
          <p className=" col-start-1 col-span-4  leading-none py-3 ">{title}</p>
        </div>
        {/* Below the line: the about text, on the same grid, under the
            name (columns 3–8) */}
        <div className="relative z-10 grid grid-cols-12 w-full px-3 text-foreground">
          <p className="col-start-3 col-span-8 py-3 text-1 hyphens-auto text-6 ">
            {text}
          </p>
        </div>
      </div>
    </>
  );
}
