"use client";

import * as React from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef, useMemo } from "react";
import Image from "next/image";
import { useScrollContainer } from "@/lib/ScrollContainerContext";

export interface MagicTextProps {
  text: string;
  illustrations?: { src: string; alt?: string }[];
  animated?: boolean;
}

interface WordProps {
  children: string;
  progress: any;
  range: number[];
  animated: boolean;
}

const Word: React.FC<WordProps> = ({ children, progress, range, animated }) => {
  const opacity = useTransform(progress, range, [0, 1]);

  if (!animated) {
    return <span>{children} </span>;
  }

  return <motion.span style={{ opacity }}>{children} </motion.span>;
};

/* ---------------- BLOCK PARSER ---------------- */

const LABEL_RE = /^[A-ZÅÄÖ][a-zåäö]+(\s[A-ZÅÄÖ][a-zåäö]+)?$/;

type Block = { speaker?: string; paragraphs: string[] };

function parseBlocks(text: string): Block[] {
  const lines = text.split("\n").filter(Boolean);
  const blocks: Block[] = [];
  let current: Block = { paragraphs: [] };

  for (const line of lines) {
    if (LABEL_RE.test(line.trim())) {
      if (current.paragraphs.length || current.speaker) blocks.push(current);
      current = { speaker: line.trim(), paragraphs: [] };
    } else {
      current.paragraphs.push(line);
    }
  }
  if (current.paragraphs.length || current.speaker) blocks.push(current);
  return blocks;
}

/* ---------------- MAIN COMPONENT ---------------- */

export const MagicText: React.FC<MagicTextProps> = ({
  text,
  illustrations,
  animated = true,
}) => {
  const container = useRef(null);
  const scrollContainer = useScrollContainer();

  const { scrollYProgress } = useScroll({
    target: container,
    container: scrollContainer ?? undefined,
    offset: ["start 0.9", "start 0.1"],
  });

  const blocks = useMemo(() => parseBlocks(text), [text]);
  const hasLabels = blocks.some((b) => b.speaker);
  const totalWords = useMemo(
    () =>
      blocks.reduce(
        (sum, b) =>
          sum +
          b.paragraphs.reduce(
            (s, p) =>
              p.match(/^\[img:\d+\]$/)
                ? s
                : s + p.split(/\s+/).filter(Boolean).length,
            0,
          ),
        0,
      ),
    [blocks],
  );

  let wordIndex = 0;

  const renderParagraph = (para: string, key: string | number) => {
    const imgMatch = para.match(/^\[img:(\d+)\]$/);
    if (imgMatch) {
      const ill = illustrations?.[Number(imgMatch[1])];
      if (!ill) return null;
      return (
        <span key={key} className="block my-6 relative w-full h-64">
          <Image
            src={ill.src}
            alt={ill.alt ?? ""}
            fill
            className="object-cover"
          />
        </span>
      );
    }
    const words = para.split(/\s+/).filter(Boolean);
    return (
      <p key={key} className="">
        {words.map((word) => {
          const idx = wordIndex++;
          const start = idx / totalWords;
          const end = Math.min(start + 0.15, 1);
          return (
            <Word
              key={idx}
              progress={scrollYProgress}
              range={[start, end]}
              animated={animated}
            >
              {word}
            </Word>
          );
        })}
      </p>
    );
  };

  if (!hasLabels) {
    return (
      <div
        ref={container}
        className="font-baskerVV text-[19.3px] tracking-wide leading-normal lg:w-1/2"
      >
        {blocks
          .flatMap((b) => b.paragraphs)
          .map((para, i) => renderParagraph(para, i))}
      </div>
    );
  }

  return (
    <div
      ref={container}
      className="font-baskerVV text-[19.3px] tracking-wide leading-normal"
    >
      {blocks.map((block, bi) => (
        <div key={bi} className="grid grid-cols-4 gap-x-8 mb-4 px-4 lg:px-16">
          <div className="col-span-1 font-baskervilleSC tracking-widest lowercase pt-0.5">
            {block.speaker}
          </div>
          <div className="col-span-3">
            {block.paragraphs.map((para, pi) =>
              renderParagraph(para, `${bi}-${pi}`),
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
