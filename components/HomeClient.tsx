"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import ShopClient from "./ShopClient";
import { HERO_PHOTO_DELAY_MS } from "@/lib/heroIntro";

// ─── Hero: "L'Amour — La Mort" fades in, "en tids skrift" fades in on top of
// it, then the bookshelf photo appears between them while the title slides up
// above it and the subtitle slides down below it ─────────────────────────

const FADE = { duration: 1.2, ease: "easeOut" } as const;
const MOVE = { duration: 0.9, ease: "easeInOut" } as const;

function Hero() {
  const [photoShown, setPhotoShown] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setPhotoShown(true), HERO_PHOTO_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative w-full min-h-dvh flex items-center justify-center pt-12">
      {/* One grid column. Before the photo, title and subtitle share row 1
          (overlapping); after, it's title / photo / subtitle in rows 1–3.
          `layout` animates the texts from one arrangement to the other */}
      <div className="grid place-items-center gap-y-8">
        <motion.h1
          layout
          className="col-start-1 row-start-1 text-white mix-blend-difference font-baskervilleNeoDisplay text-3xl lg:text-7xl tracking-wide whitespace-nowrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ opacity: FADE, layout: MOVE }}
        >
          L&apos;Amour — La Mort
        </motion.h1>

        {photoShown && (
          // Square photo (1000×1000): 45% of the width on small screens, 40%
          // of the height on wide ones
          <motion.div
            layout
            className="col-start-1 row-start-2 relative aspect-square w-[min(45vw,40dvh)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ opacity: { ...FADE, delay: 0.3 }, layout: MOVE }}
          >
            <Image
              src="/Boknas-bokhylla.jpg"
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 40vh, 45vw"
              className="object-cover"
            />
          </motion.div>
        )}

        <motion.h2
          layout
          className={`col-start-1 ${photoShown ? "row-start-3" : "row-start-1"} text-[rgb(0,255,0)] mix-blend-difference font-baskervilleNeoDisplay text-3xl lg:text-7xl tracking-wide italic whitespace-nowrap`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ opacity: { ...FADE, delay: 1 }, layout: MOVE }}
        >
          en tids skrift
        </motion.h2>
      </div>
    </section>
  );
}

export default function HomeClient() {
  return (
    <>
      <Hero />
      {/* Shop grid (with its filter bar) below the hero — also on /shop */}
      <ShopClient />
    </>
  );
}
