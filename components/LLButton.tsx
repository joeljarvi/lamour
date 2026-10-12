"use client";

import {
  CSSProperties,
  ComponentProps,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  type MotionValue,
} from "motion/react";
import { Link } from "@/i18n/navigation";
import { Button } from "./ui/button";

/* ─── CHARACTER SUBSTITUTIONS ─── */

type Substitution = {
  char: string;
  rotateDeg?: number;
  flipX?: boolean;
  flipY?: boolean;
};

const SUBSTITUTIONS: Record<string, Substitution> = {
  S: { char: "S", rotateDeg: 180 },
  N: { char: "Z", rotateDeg: 90 },
  t: { char: "f", rotateDeg: -180, flipX: true },
  M: { char: "W", rotateDeg: 180 },
};

function buildFlipStyle(sub: Substitution): CSSProperties {
  if (!sub.flipX && !sub.flipY) return {};
  const parts: string[] = [];
  if (sub.flipX) parts.push("scaleX(-1)");
  if (sub.flipY) parts.push("scaleY(-1)");
  return { transform: parts.join(" "), display: "inline-block" };
}

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

/* ─── TEXT PARSER ─── */

function parseChars(text: string) {
  return text.split("").map((char) => ({ char, isSpace: char === " " }));
}

/* ─── TYPES ─── */

export type EffectType =
  | "default"
  | "letterSwap"
  | "stretch"
  | "wiggle"
  | "justify"
  | "mono";

export type LLTextProps = {
  text: string;
  /** Animation effect preset. */
  effect?: EffectType;
  /** Adds a slight random rotation offset to each letter on top of any effect. */
  wiggle?: boolean;
  /** true = items-center (default), false = items-baseline. */
  verticalTrim?: boolean;
  /** scaleX target for "stretch" effect. */
  stretch?: number;
  /** scaleY target for "stretch" effect. */
  stretchY?: number;
  /** Legacy: use effect="mono" instead. Still supported for backward compat. */
  mono?: boolean;
  monoFont?: string;
  /** Width of a space character. */
  gap?: string;
  className?: string;
  animProgress?: MotionValue<number>;
};

type LLButtonProps = LLTextProps & {
  href?: string;
} & ComponentProps<typeof Button>;

const EASE = [0.25, 0.46, 0.45, 0.94] as const;
const DURATION = 0.5;
const HOVER_GAP_PX = 6;

/* ─── ANIMATED CHAR ─── */

function AnimChar({
  char,
  effect,
  progress,
  targetScaleX,
  targetScaleY,
  subStyle,
  finalRotation,
  rotateDistortion,
  wiggleOffset,
  hoverActive,
  staggerIndex,
}: {
  char: string;
  effect?: EffectType;
  progress: MotionValue<number>;
  targetScaleX: number;
  targetScaleY: number;
  subStyle: CSSProperties;
  finalRotation?: number;
  rotateDistortion: number;
  wiggleOffset: number;
  hoverActive: boolean;
  staggerIndex: number;
}) {
  const scaleX = useTransform(progress, (p) => 1 + (targetScaleX - 1) * p);
  const scaleY = useTransform(progress, (p) => 1 + (targetScaleY - 1) * p);
  const charMx = useTransform(
    progress,
    (p) => `${Math.max(0, (targetScaleX - 1) * p * 0.3)}em`,
  );

  // Compute rotation targets composing effect rotation + wiggle offset
  let rotateTarget: number | undefined;
  let rotateInitial: number | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let rotateTransition: any;

  if (effect === "letterSwap") {
    const base = finalRotation ?? 0;
    if (base !== 0 || wiggleOffset !== 0) {
      rotateInitial = 0;
      rotateTarget = base + wiggleOffset;
      rotateTransition = {
        duration: DURATION,
        ease: EASE,
        delay: staggerIndex * 0.04,
      };
    }
  } else if (effect === "wiggle") {
    // on load: 0 → distortion+offset; hover: back to offset
    rotateInitial = wiggleOffset;
    rotateTarget = hoverActive ? wiggleOffset : rotateDistortion + wiggleOffset;
    rotateTransition = {
      duration: 0.22,
      ease: "easeOut",
      delay: !hoverActive ? staggerIndex * 0.025 : 0,
    };
  } else if (effect === "justify") {
    // default: offset; hover: distortion+offset
    rotateTarget = hoverActive
      ? rotateDistortion + wiggleOffset
      : wiggleOffset;
    rotateTransition = {
      duration: 0.22,
      ease: "easeOut",
      delay: hoverActive ? staggerIndex * 0.025 : 0,
    };
    if (wiggleOffset !== 0) rotateInitial = 0;
  } else if (wiggleOffset !== 0) {
    // wiggle prop only, no rotation-based effect
    rotateInitial = 0;
    rotateTarget = wiggleOffset;
    rotateTransition = {
      duration: DURATION,
      ease: EASE,
      delay: staggerIndex * 0.04,
    };
  }

  const usesScale =
    effect === "stretch" || effect === "mono" || (effect === undefined && targetScaleX !== 1);

  return (
    <motion.span
      className="inline-block origin-center leading-none [text-box-trim:both] [text-box-edge:cap_alphabetic]"
      style={{
        ...subStyle,
        ...(usesScale && { scaleX, scaleY }),
        ...(usesScale && {
          marginLeft: charMx,
          marginRight: charMx,
        }),
      }}
      initial={rotateInitial !== undefined ? { rotate: rotateInitial } : undefined}
      animate={rotateTarget !== undefined ? { rotate: rotateTarget } : undefined}
      transition={rotateTransition}
    >
      {char}
    </motion.span>
  );
}

/* ─── COMPONENT ─── */

export default function LLButton({
  text,
  effect,
  wiggle = false,
  verticalTrim = true,
  stretch = 2,
  stretchY = 1,
  mono = false,
  monoFont = "Baskerville, 'Baskerville Old Face', serif",
  gap = "0.35em",
  className,
  animProgress,
  href,
  ...buttonProps
}: LLButtonProps) {
  const usesMono = effect === "mono" || mono;
  const usesScale = effect === "stretch" || effect === "mono" || mono;

  /* progress drives stretch / mono / justify spreading */
  const ownProgress = useMotionValue(0);
  const progress = animProgress ?? ownProgress;

  useEffect(() => {
    if (effect === "stretch" || effect === "justify" || effect === "mono") {
      animate(ownProgress, 1, { duration: DURATION, ease: EASE });
    } else if (mono && !effect) {
      // legacy mono prop: immediate, no animation
      ownProgress.set(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* hover */
  const [hoverActive, setHoverActive] = useState(false);

  /* letterSwap hover gap */
  const hoverGapMV = useMotionValue(0);
  const hoverGapStr = useTransform(hoverGapMV, (g: number) => `${g}px`);

  /* random per-letter values */
  const rotateDistortions = useRef<number[]>([]); // large ±7° for wiggle/justify effects
  const wiggleOffsets = useRef<number[]>([]);      // small ±3° for wiggle prop modifier
  useEffect(() => {
    rotateDistortions.current = text
      .split("")
      .map(() => parseFloat((Math.random() * 14 - 7).toFixed(1)));
    wiggleOffsets.current = text
      .split("")
      .map(() => parseFloat((Math.random() * 6 - 3).toFixed(1)));
  }, [text]);

  /* justify: measure container vs natural text width to compute max gap */
  const pretextRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLSpanElement>(null);
  const maxGapMV = useMotionValue(0);
  const parsed = useMemo(() => parseChars(text), [text]);

  useEffect(() => {
    if (effect !== "justify") return;
    const measure = () => {
      const pretext = pretextRef.current;
      const container = containerRef.current;
      if (!pretext || !container) return;
      const totalItems = parsed.length;
      if (totalItems > 1) {
        maxGapMV.set(
          Math.max(
            0,
            (container.offsetWidth - pretext.offsetWidth) / (totalItems - 1),
          ),
        );
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [effect, parsed, maxGapMV]);

  const columnGap = useTransform(
    [progress, maxGapMV] as MotionValue[],
    ([p, maxG]: number[]) => (effect === "justify" ? p * maxG : 0),
  );

  /* mono scales */
  const [monoScales, setMonoScales] = useState<Record<string, number>>({});
  useEffect(() => {
    if (!usesMono) return;
    const uniqueChars = [...new Set(parsed.map((c) => c.char))];
    setMonoScales(measureMonoScales(uniqueChars, monoFont));
  }, [usesMono, monoFont, parsed]);

  /* hover handlers */
  const handleHoverStart = () => {
    if (effect === "stretch" || effect === "mono") {
      animate(ownProgress, 0, { duration: DURATION, ease: EASE });
    } else if (effect === "letterSwap") {
      animate(hoverGapMV, HOVER_GAP_PX, { duration: DURATION, ease: EASE });
    } else if (effect === "wiggle" || effect === "justify") {
      setHoverActive(true);
    }
  };

  const handleHoverEnd = () => {
    if (effect === "stretch" || effect === "mono") {
      animate(ownProgress, 1, { duration: DURATION, ease: EASE });
    } else if (effect === "letterSwap") {
      animate(hoverGapMV, 0, { duration: DURATION, ease: EASE });
    } else if (effect === "wiggle" || effect === "justify") {
      setHoverActive(false);
    }
  };

  const containerGap =
    effect === "justify"
      ? columnGap
      : effect === "letterSwap"
        ? hoverGapStr
        : undefined;

  const inner = (
    <span
      ref={containerRef}
      className={`font-baskerVilleOld relative flex ${
        verticalTrim ? "items-center" : "items-baseline"
      } w-full justify-center`}
    >
      {effect === "justify" && (
        <span
          ref={pretextRef}
          className="absolute opacity-0 pointer-events-none whitespace-nowrap"
          aria-hidden
        >
          {text}
        </span>
      )}
      {/* justify needs w-full so chars spread from edge to edge */}
      <motion.span
        className={`flex items-center justify-center${effect === "justify" ? " w-full" : ""}`}
        style={{ columnGap: containerGap }}
      >
        {parsed.map((item, i) => {
          if (item.isSpace) {
            return <span key={i} style={{ width: gap }} aria-hidden />;
          }

          const sub =
            effect === "letterSwap" ? SUBSTITUTIONS[item.char] : undefined;
          const displayChar = sub?.char ?? item.char;
          const subStyle = sub ? buildFlipStyle(sub) : {};
          const targetScaleX = usesMono ? (monoScales[item.char] ?? 1) : stretch;
          const wo = wiggle ? (wiggleOffsets.current[i] ?? 0) : 0;

          if (effect || mono || wiggle) {
            return (
              <AnimChar
                key={i}
                char={displayChar}
                effect={effect}
                progress={progress}
                targetScaleX={targetScaleX}
                targetScaleY={stretchY}
                subStyle={subStyle}
                finalRotation={sub?.rotateDeg}
                rotateDistortion={rotateDistortions.current[i] ?? 0}
                wiggleOffset={wo}
                hoverActive={hoverActive}
                staggerIndex={i}
              />
            );
          }

          return (
            <span
              key={i}
              className="inline-block origin-center leading-none [text-box-trim:both] [text-box-edge:cap_alphabetic]"
              style={subStyle}
            >
              {displayChar}
            </span>
          );
        })}
      </motion.span>
    </span>
  );

  return (
    <Button
      variant="link"
      className={`w-full active:opacity-80 ${effect === "default" ? "hover:text-foreground/40 transition-colors" : ""} ${className ?? ""}`}
      onMouseEnter={handleHoverStart}
      onMouseLeave={handleHoverEnd}
      asChild={!!href}
      {...buttonProps}
    >
      {href ? <Link href={href}>{inner}</Link> : inner}
    </Button>
  );
}
