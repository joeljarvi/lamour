"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";

/* ─── CHARACTER SUBSTITUTIONS ─── */

type Substitution = { char: string; rotateDeg?: number; flipX?: boolean };

const SUBSTITUTIONS: Record<string, Substitution> = {
  S: { char: "S", rotateDeg: 180 },
  N: { char: "Z", rotateDeg: 90 },
  t: { char: "f", rotateDeg: -180, flipX: true },
  M: { char: "W", rotateDeg: 180 },
};

/* ─── MONO MEASUREMENT ─── */

function measureMonoScales(
  chars: string[],
  fontStyle: string,
): Record<string, number> {
  const REF_PX = 100;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  ctx.font = `${REF_PX}px ${fontStyle}`;
  const result: Record<string, number> = {};
  for (const char of chars) {
    if (char === " ") continue;
    const w = ctx.measureText(char).width;
    result[char] = w > 0 ? Math.min(REF_PX / w, 4) : 1;
  }
  return result;
}

/* ─── TYPES ─── */

interface WigglyButtonProps {
  text: string;
  onClick?: () => void;
  href?: string;
  vertical?: boolean;
  justify?: boolean;
  spreading?: boolean;
  className?: string;
  /** Applied to each letter span. Defaults to inheriting from container. */
  size?: string;
  bold?: boolean;
  active?: boolean;
  textShadow?: boolean;
  sizeGradient?: { from: number; to: number };
  wiggleGradient?: boolean;
  /** Apply character substitutions (N→Z rotated, M→W rotated, etc.). */
  letterSwap?: boolean;
  /** Make all characters equal width via canvas measurement. */
  mono?: boolean;
  monoFont?: string;
}

type LetterDistortion = { rotate: number; y: number };

export default function WigglyButton({
  text,
  onClick,
  href,
  vertical = false,
  justify = false,
  spreading,
  className,
  size = "",
  bold = false,
  active = false,
  textShadow = false,
  sizeGradient,
  wiggleGradient = false,
  letterSwap = false,
  mono = false,
  monoFont = "Baskerville, 'Baskerville Old Face', serif",
}: WigglyButtonProps) {
  const [hovered, setHovered] = useState(false);
  const distortions = useRef<LetterDistortion[]>([]);
  const [mounted, setMounted] = useState(false);
  const [monoScales, setMonoScales] = useState<Record<string, number>>({});

  useEffect(() => {
    distortions.current = text.split("").map(() => ({
      rotate: parseFloat((Math.random() * 14 - 7).toFixed(1)),
      y: parseFloat((Math.random() * 6 - 3).toFixed(1)),
    }));
    setMounted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mono) return;
    const letters = text.split("").filter((c) => c !== " ");
    const displayChars = letters.map((c) => {
      const sub = letterSwap ? SUBSTITUTIONS[c] : undefined;
      return sub?.char ?? c;
    });
    const unique = [...new Set(displayChars)];
    setMonoScales(measureMonoScales(unique, monoFont));
  }, [mono, monoFont, text, letterSwap]);

  const distorted = mounted && (active || hovered);
  const spread =
    spreading !== undefined
      ? spreading || (justify && hovered)
      : justify && distorted;
  const letters = text.split("");

  const getCharFontSize = (i: number): number | undefined => {
    if (!sizeGradient) return undefined;
    const t = letters.length > 1 ? i / (letters.length - 1) : 0;
    return sizeGradient.from + (sizeGradient.to - sizeGradient.from) * t;
  };

  const getWiggleFactor = (i: number) =>
    wiggleGradient ? i / Math.max(letters.length - 1, 1) : 1;

  const transition = { duration: 0.18, ease: "easeOut" as const };

  const rendered = letters.map((char, i) => {
    if (char === " ") {
      return vertical ? (
        <span key={i} className="block h-[0.4em]" />
      ) : (
        <span
          key={i}
          className="inline-block"
          style={
            getCharFontSize(i)
              ? { width: `${(getCharFontSize(i) ?? 0) * 0.3}px` }
              : { width: "0.3em" }
          }
        />
      );
    }

    const sub = letterSwap ? SUBSTITUTIONS[char] : undefined;
    const displayChar = sub?.char ?? char;
    const baseDeg = sub?.rotateDeg ?? 0;
    const flipX = sub?.flipX ?? false;

    const monoScaleX = mono ? (monoScales[displayChar] ?? 1) : 1;
    const scaleXValue = monoScaleX * (flipX ? -1 : 1);

    const factor = getWiggleFactor(i);
    const wiggleDeg = distorted ? (distortions.current[i]?.rotate ?? 0) * factor : 0;
    const wiggleY = distorted ? (distortions.current[i]?.y ?? 0) * factor : 0;

    const fs = getCharFontSize(i);

    return (
      <motion.span
        key={i}
        layout={justify}
        className={cn(
          "inline-block leading-none origin-center",
          size,
          bold ? "font-bold" : "font-normal",
        )}
        style={{
          ...(fs ? { fontSize: `${fs}px` } : {}),
          ...(scaleXValue !== 1 ? { scaleX: scaleXValue } : {}),
        }}
        initial={baseDeg !== 0 ? { rotate: 0 } : undefined}
        animate={{ rotate: baseDeg + wiggleDeg, y: wiggleY }}
        transition={{ ...transition, delay: distorted ? i * 0.015 : 0 }}
      >
        {displayChar}
      </motion.span>
    );
  });

  const containerCls = cn(
    "cursor-pointer",
    vertical
      ? cn(
          "inline-flex flex-col items-center",
          justify && "h-full",
          spread ? "justify-between" : "justify-center",
        )
      : cn(
          "inline-flex items-baseline",
          justify ? "w-full" : "flex-wrap",
          spread ? "justify-between" : "justify-center",
        ),
    textShadow && "text-shadow-md",
    className,
  );

  if (href) {
    return (
      <Link
        href={href}
        data-no-reveal
        className={containerCls}
        onClick={() => onClick?.()}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {rendered}
      </Link>
    );
  }

  return (
    <button
      data-no-reveal
      className={containerCls}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {rendered}
    </button>
  );
}
