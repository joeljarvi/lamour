import { client } from "@/lib/sanity/client";
import { backgroundMediaQuery } from "@/lib/sanity/queries";
import BackgroundMedia, { type BackgroundMediaData } from "./BackgroundMedia";
import AddLatestIssueToCart from "./AddLatestIssueToCart";

// The home page's first screen: the latest issue's announcement, white, in
// the middle, over the image or video from Sanity's Hero Media as the
// background (empty until one is uploaded)
export default async function HeroSection() {
  const hero = await client.fetch<BackgroundMediaData>(backgroundMediaQuery, {
    id: "heroMedia",
  });

  return (
    <section id="hero" className="relative h-dvh w-full overflow-hidden">
      <BackgroundMedia media={hero} priority soundToggle />

      {/* The latest issue's announcement, centred over the media, white.
          Clicks pass through to the video (pausing it), except on "lägg i
          korg", which adds the latest issue to the cart */}
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center  h-screen">
        <h2 className=" max-w-full px-6 lg:px-0 lg:max-w-5xl text-center font-baskervilleNeoDisplay text-2xl leading-tight text-background lg:text-6xl">
          #22—23 DRUNK <span className="italic">nytt dubbelnummer ute nu</span>,{" "}
          <AddLatestIssueToCart className="pointer-events-auto text-2xl lg:text-6xl font-baskervilleNeoDisplay uppercase tracking-normal leading-snug text-white">
            lägg i korg
          </AddLatestIssueToCart>
        </h2>
      </div>

      {/* The standing logo, centred on the screen over the media, white
          (text-white): the logo's letters are a mask over a box in the
          text colour (bg-current), so its colour is set like text's */}
      <div className="absolute inset-0 z-10 flex items-center justify-center px-6 pointer-events-none hidden">
        <span
          role="img"
          aria-label="L'Amour — La Mort"
          className="block w-2/3 max-w-xs aspect-[115.44/49.38] bg-current text-white"
          style={{
            maskImage: "url(/logo/lamour-staende-letters.svg)",
            maskSize: "contain",
            maskRepeat: "no-repeat",
            maskPosition: "center",
          }}
        />
      </div>
    </section>
  );
}
