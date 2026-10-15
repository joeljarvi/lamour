"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { urlFor } from "@/lib/sanity/image";
import { useCart } from "@/lib/contexts/CartContext";
import { type Issue } from "@/lib/contexts/IssuesContext";
import SanityPortableText from "@/components/SanityPortableText";
import { useState } from "react";
import { Button } from "./ui/button";
import { useTranslations } from "next-intl";
import { issueTitle } from "@/lib/issueTitle";

type ImageItem = { asset: any; alt?: string; _key?: string };

function Lightbox({
  images,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  images: ImageItem[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const t = useTranslations("Issue");
  const img = images[index];
  return (
    <motion.div
      className="fixed inset-0 z-90 bg-black flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-6 font-baskervilleSC text-white text-2xl tracking-widest lowercase"
        onClick={onClose}
      >
        {t("close")}
      </button>

      {img?.asset && (
        <div
          className="relative w-full h-full  p-8"
          onClick={(e) => e.stopPropagation()}
        >
          <Image
            src={urlFor(img).url()}
            fill
            alt={img.alt ?? ""}
            className="object-contain"
          />
        </div>
      )}

      {index > 0 && (
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 font-baskervilleSC text-white text-3xl"
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
        >
          ←
        </button>
      )}
      {index < images.length - 1 && (
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 font-baskervilleSC text-white text-3xl"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
        >
          →
        </button>
      )}

      <span className="absolute bottom-6 font-baskervilleSC text-white/50 text-base tracking-widest lowercase">
        {index + 1} / {images.length}
      </span>
    </motion.div>
  );
}

// Issue panel: one vertical column on every screen size — header (number +
// close), a horizontal strip of images (tap for the lightbox), title, credits
// and description, then price + add to cart pinned to the bottom. Slides in
// up from the bottom, full width
export default function IssueCard({
  issue,
  onClose,
}: {
  issue: Issue | null;
  onClose: () => void;
}) {
  const t = useTranslations("Issue");
  const { addToCart, setDrawerOpen } = useCart();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const images: ImageItem[] = issue
    ? [
        ...(issue.cover?.asset ? [issue.cover as ImageItem] : []),
        ...(issue.previewImages?.filter((img) => img.asset) ?? []),
      ]
    : [];

  // One name per line or comma in Sanity's Contributors field
  const contributors = (issue?.contributors ?? "")
    .split(/[\n,]/)
    .map((name) => name.trim())
    .filter(Boolean);
  const credits = issue?.credits?.filter((c) => c.name) ?? [];
  const soldOut = issue?.inStock === false;

  function handleAddToCart() {
    if (!issue) return;
    addToCart({
      id: issue._id,
      title: issue.title,
      price: issue.price != null ? `${issue.price} kr` : "0",
    });
    setDrawerOpen(true);
    onClose();
  }

  return (
    <AnimatePresence>
      {issue && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-70 w-full bg-foreground/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />

          {/* Lightbox */}
          <AnimatePresence>
            {lightboxIndex !== null && (
              <Lightbox
                images={images}
                index={lightboxIndex}
                onClose={() => setLightboxIndex(null)}
                onPrev={() => setLightboxIndex((i) => (i ?? 1) - 1)}
                onNext={() => setLightboxIndex((i) => (i ?? 0) + 1)}
              />
            )}
          </AnimatePresence>

          {/* Panel */}
          <motion.aside
            aria-label={issueTitle(issue.title)}
            className="fixed inset-y-0 right-0 z-80 w-full bg-background flex flex-col shadow-md"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            {/* Header: issue number left, close right */}
            <div className="flex shrink-0 items-center justify-between h-16 lg:h-24 px-6 lg:px-12 lg:pt-12">
              <span className="font-baskervilleNeoDisplay text-xs uppercase tracking-[24%]">
                LL#{issue.issueNumber}
              </span>
              <Button
                variant="link"
                size="xs"
                className="w-auto h-auto after:content-none"
                onClick={onClose}
              >
                {t("close")} (<span className="lowercase">x</span>)
              </Button>
            </div>

            {/* Scrolling content */}
            <div className="flex flex-col flex-1 min-h-0 overflow-y-auto gap-12 px-6 lg:px-12 py-12">
              {/* Images side by side, centred; scroll sideways when they
                  overflow (the inner row's mx-auto centres it only while it
                  fits, so nothing gets clipped) */}
              {images.length > 0 && (
                <div className="shrink-0 overflow-x-auto snap-x snap-mandatory -mx-6 px-6 lg:-mx-12 lg:px-12">
                  <div className="flex gap-6 w-max mx-auto">
                    {images.map((img, i) => (
                      <button
                        key={img._key ?? i}
                        type="button"
                        className="shrink-0 snap-start cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setLightboxIndex(i)}
                      >
                        <Image
                          src={urlFor(img).url()}
                          alt={img.alt ?? ""}
                          width={0}
                          height={0}
                          sizes="(min-width: 1024px) 25vw, 70vw"
                          className="shadow w-auto h-[40dvh] max-w-none"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-6">
                <h2 className="text-center font-baskervilleNeoDisplay text-sm uppercase tracking-[24%]">
                  {issueTitle(issue.title)}
                </h2>
                {contributors.length > 0 && (
                  <p className="text-center max-w-prose mx-auto font-baskervilleNeoText text-base leading-snug">
                    <span className="tracking-[12%]">Medv. </span>
                    <span className="italic tracking-[6%]">
                      {contributors.join(", ")}
                    </span>
                  </p>
                )}
                {credits.length > 0 && (
                  <dl className="flex flex-col gap-1 font-baskervilleNeoText text-xs tracking-[3%] text-neutral-700 leading-[1.5]">
                    {credits.map((c) => (
                      <div key={c._key} className="flex gap-2">
                        {c.role && <dt>{c.role}:</dt>}
                        <dd>{c.name}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>

              {issue.description && (
                <div className="flex flex-col">
                  <SanityPortableText value={issue.description} />
                </div>
              )}
            </div>

            {/* Footer: title + price, add to cart */}
            <div className="flex shrink-0 flex-col gap-6 px-6 lg:px-12 pt-6 pb-12 bg-pergament">
              <div className="flex justify-between items-baseline gap-6">
                <span className="truncate font-baskervilleNeoDisplay text-xs uppercase tracking-[24%]">
                  {issueTitle(issue.title)}
                </span>
                {issue.price != null && (
                  <span className="shrink-0 font-baskervilleNeoDisplay text-xs uppercase tracking-[24%]">
                    {issue.price} kr
                  </span>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={soldOut}
                className="w-full justify-center disabled:opacity-30 disabled:cursor-not-allowed font-baskervilleNeoText text-xs tracking-[24%] uppercase hover:bg-foreground hover:text-background"
                onClick={handleAddToCart}
              >
                {soldOut ? t("soldOut") : t("addToCart")}
              </Button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
