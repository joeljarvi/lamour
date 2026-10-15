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
    <section className="relative w-full min-h-dvh flex items-center justify-center pt-12 px-12">
      {/* One grid column. Before the photo, title and subtitle share row 1
          (overlapping); after, it's title / photo / subtitle in rows 1–3.
          `layout` animates the texts from one arrangement to the other */}
      <div className="flex flex-col gap-y-6 w-full lg:w-[33.3vw] h-48 lg:h-[33.3vh] mx-auto items-center justify-center p-12 rounded-xs bg-pergament">
        <motion.h1
          layout
          className="font-baskervilleNeoDisplay text-sm lg:text-xl tracking-[24%] uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ opacity: FADE, layout: MOVE }}
        >
          L&apos;Amour — La Mort
        </motion.h1>

        <motion.h2
          layout
          className={`font-baskervilleNeoDisplay italic uppercase tracking-[48%] text-xs lg:text-sm `}
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
