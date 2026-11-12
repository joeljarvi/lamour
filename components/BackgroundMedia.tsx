import Image from "next/image";
import { urlFor } from "@/lib/sanity/image";
import HeroVideo from "./HeroVideo";

// What backgroundMediaQuery returns
export type BackgroundMediaData = {
  mediaType?: "image" | "video";
  image?: {
    asset?: unknown;
    alt?: string;
    hotspot?: { x: number; y: number };
  };
  poster?: { asset?: unknown };
  videoUrl?: string;
} | null;

// Whether there's anything to show
export function hasBackgroundMedia(media: BackgroundMediaData) {
  return media?.mediaType === "video"
    ? Boolean(media.videoUrl)
    : Boolean(media?.image?.asset);
}

// A section's background from Sanity (Hero Media, Subscribe Media…): the
// image or the video, filling its positioned parent, cropped to fit.
// Nothing until one is uploaded
export default function BackgroundMedia({
  media,
  priority = false,
  soundToggle = false,
  veil = true,
}: {
  media: BackgroundMediaData;
  // The first screen's image: loaded straight away
  priority?: boolean;
  // A video: show the "Ljud av / Ljud på" button
  soundToggle?: boolean;
  // A video: darken it a little (its dark veil)
  veil?: boolean;
}) {
  if (media?.mediaType === "video" && media.videoUrl)
    return (
      <HeroVideo
        src={media.videoUrl}
        soundToggle={soundToggle}
        veil={veil}
        poster={
          media.poster?.asset
            ? urlFor(media.poster).width(2400).auto("format").url()
            : undefined
        }
      />
    );
  if (media?.mediaType === "image" && media.image?.asset)
    return (
      <Image
        src={urlFor(media.image).width(2400).auto("format").url()}
        alt={media.image.alt ?? ""}
        fill
        sizes="100vw"
        priority={priority}
        className="object-cover"
        // Keeps the hotspot chosen in Sanity in view when cropped
        style={
          media.image.hotspot && {
            objectPosition: `${media.image.hotspot.x * 100}% ${media.image.hotspot.y * 100}%`,
          }
        }
      />
    );
  return null;
}
