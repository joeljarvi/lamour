"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { urlFor } from "@/lib/sanity/image";

// How many images at most
const MAX_IMAGES = 8;

export type ScatterImage = {
  _id: string;
  image: { asset?: { _ref: string }; alt?: string; hotspot?: unknown };
};

type Placed = ScatterImage & {
  // Position (top-left corner) and width, in % of the area
  left: number;
  top: number;
  width: number;
  z: number;
};

// Small images (the issues' covers), scattered over the area it fills: a
// random pick (at most MAX_IMAGES), each at a random size and place, some
// overlapping. Picked and placed in the browser after load, so each visit
// gets a new arrangement (nothing shows before, so the server's HTML and
// the browser's first render match)
export default function HeroScatter({ images }: { images: ScatterImage[] }) {
  const [placed, setPlaced] = useState<Placed[]>([]);

  useEffect(() => {
    // Each picture once (the same one can be both a cover and in the
    // text), by its asset
    const unique = [
      ...new Map(
        images.map((img) => [img.image.asset?._ref ?? img._id, img]),
      ).values(),
    ];
    const picked = unique.sort(() => Math.random() - 0.5).slice(0, MAX_IMAGES);
    // Placed on the next frame (not in the effect itself)
    const frame = requestAnimationFrame(() =>
      setPlaced(
        picked.map((img, i) => {
          // 10–18% of the area's width
          const width = 10 + Math.random() * 8;
          return {
            ...img,
            width,
            // Kept inside the area (the image's height is unknown, so
            // its top stays in the upper 70%)
            left: Math.random() * (100 - width),
            top: Math.random() * 70,
            z: i,
          };
        }),
      ),
    );
    return () => cancelAnimationFrame(frame);
  }, [images]);

  return (
    <div aria-hidden className="relative h-full w-full">
      {placed.map((img, i) => (
        // Fading in one after another
        <motion.div
          key={img._id}
          className="absolute"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: i * 0.12 }}
          style={{
            left: `${img.left}%`,
            top: `${img.top}%`,
            width: `${img.width}%`,
            zIndex: img.z,
          }}
        >
          <Image
            src={urlFor(img.image).width(400).url()}
            alt=""
            width={400}
            height={533}
            sizes="10vw"
            className="h-auto w-full "
          />
        </motion.div>
      ))}
    </div>
  );
}
