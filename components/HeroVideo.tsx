"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "./ui/button";

// How long the sound takes to fade in or out (ms)
const FADE_MS = 1200;

// A background video: muted, looping, no controls. Started from here rather
// than with autoPlay: React leaves `muted` out of the server's HTML, and
// browsers won't autoplay a video without it. Stays on its poster for
// visitors who prefer reduced motion. With `soundToggle`, a "Ljud av /
// Ljud på" button bottom right fades its sound in and out, and a click on
// the video pauses and resumes it
export default function HeroVideo({
  src,
  poster,
  soundToggle = false,
  veil = true,
}: {
  src: string;
  poster?: string;
  soundToggle?: boolean;
  // The dark veil over it
  veil?: boolean;
}) {
  const t = useTranslations("Nav");
  const ref = useRef<HTMLVideoElement>(null);
  const fadeFrame = useRef(0);
  const [soundOn, setSoundOn] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.muted = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Refused (e.g. low power mode): the poster stays
    video.play().catch(() => {});
  }, []);

  // No fade left running after the video is gone
  useEffect(() => () => cancelAnimationFrame(fadeFrame.current), []);

  // Moves the volume from where it is to `target` over FADE_MS, then calls
  // `done`. (iOS ignores volume set from script: there the sound simply
  // comes on and goes off)
  function fadeTo(target: number, done?: () => void) {
    const video = ref.current;
    if (!video) return;
    cancelAnimationFrame(fadeFrame.current);
    const from = video.volume;
    const start = performance.now();
    const step = (now: number) => {
      const k = Math.min((now - start) / FADE_MS, 1);
      // Clamped: rounding can land a hair outside 0–1, which throws
      video.volume = Math.min(1, Math.max(0, from + (target - from) * k));
      if (k < 1) fadeFrame.current = requestAnimationFrame(step);
      else done?.();
    };
    fadeFrame.current = requestAnimationFrame(step);
  }

  function toggleSound() {
    const video = ref.current;
    if (!video) return;
    if (soundOn) {
      setSoundOn(false);
      fadeTo(0, () => {
        video.muted = true;
      });
    } else {
      setSoundOn(true);
      // From silence: unmuted at volume 0, then faded up. Played too, in
      // case it was left on its poster (this click lets it start)
      video.volume = 0;
      video.muted = false;
      video.play().catch(() => {});
      fadeTo(1);
    }
  }

  return (
    <>
      <video
        ref={ref}
        poster={poster}
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden
        // With the sound button (the hero): a click pauses it, another
        // plays it again
        onClick={
          soundToggle
            ? (e) => {
                const video = e.currentTarget;
                if (video.paused) video.play().catch(() => {});
                else video.pause();
              }
            : undefined
        }
        className={`absolute  inset-0 h-full w-full object-cover ${soundToggle ? "cursor-pointer" : ""}`}
      >
        {/* Typed as MP4 for every file, MOV included: a QuickTime file with
            H.264 inside is close enough for browsers to play, but Firefox
            refuses one labelled video/quicktime */}
        <source src={src} type="video/mp4" />
      </video>

      {/* A dark veil over the video, so the text on it reads (clicks pass
          through to the video) */}
      {veil && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-foreground/30"
        />
      )}

      {/* In the section's bottom-right corner, in the same spot (and the
          same button size) as the shop's filter button, which takes over
          there once the shop scrolls in. White over the video: says what
          the sound is now */}
      {soundToggle && (
        <Button
          variant="link"
          aria-pressed={soundOn}
          className="absolute bottom-3 lg:bottom-6 right-6 z-20 w-auto font-baskervilleNeoText text-xs lg:text-sm normal-case tracking-wide text-white after:content-none"
          onClick={toggleSound}
        >
          {soundOn ? t("soundOn") : t("soundOff")}
        </Button>
      )}
    </>
  );
}
