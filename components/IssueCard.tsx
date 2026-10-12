"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { motion, AnimatePresence } from "motion/react";
import { urlFor } from "@/lib/sanity/image";
import { useCart } from "@/lib/contexts/CartContext";
import { type Issue } from "@/lib/contexts/IssuesContext";
import SanityPortableText from "@/components/SanityPortableText";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useTranslations } from "next-intl";

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
          className="relative w-full h-full max-w-3xl p-8"
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

export default function IssueCard({
  issue,
  onClose,
}: {
  issue: Issue | null;
  onClose: () => void;
}) {
  const t = useTranslations("Issue");
  const { addToCart, setDrawerOpen } = useCart();
  const [openShopInfo, setOpenShopInfo] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const images: ImageItem[] = issue
    ? [
        ...(issue.cover?.asset ? [issue.cover as ImageItem] : []),
        ...(issue.previewImages?.filter((img) => img.asset) ?? []),
      ]
    : [];

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
            className="fixed inset-0 z-70 w-full"
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
          <motion.div
            className="fixed top-14 inset-x-0 bottom-0 lg:inset-auto lg:right-0 lg:top-0 lg:bottom-0 w-full lg:w-[calc(100vw-3.5rem)] z-80 bg-background flex overflow-y-auto"
            initial={isDesktop ? { x: "100%" } : { y: "100%" }}
            animate={isDesktop ? { x: 0 } : { y: 0 }}
            exit={isDesktop ? { x: "100%" } : { y: "100%" }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            {/* Desktop vertical sidebar */}
            <div className="hidden lg:flex flex-col gap-6 px-6 bg-pink-300 h-full w-16 pt-8 pb-8 font-baskervilleSC text-2xl tracking-widest lowercase text-foreground items-center justify-between">
              <span style={{ writingMode: "vertical-rl" }}>{issue.title}</span>
              <button
                onClick={onClose}
                style={{ writingMode: "vertical-rl" }}
                className="text-2xl lowercase"
              >
                Stäng (X)
              </button>
            </div>

            <div className="flex flex-col flex-1 min-w-0">
              {/* Header */}
              <div className="flex lg:hidden items-center   shrink-0 w-full">
                <span
                  className="w-full h-14 lg:h-20 pb-1 tracking-widest lowercase text-lg lg:text-xl flex items-center justify-center font-baskervilleSC "
                  onClick={onClose}
                >
                  Stäng (x)
                </span>
              </div>
              <div className="hidden lg:flex items-center   shrink-0 w-full">
                <span className="w-1/2 h-14 lg:h-20 pb-1 tracking-widest lowercase text-lg lg:text-xl flex items-center justify-center font-baskervilleSC ">
                  {issue.title}
                </span>

                <span className="hidden lg:w-1/2 h-14 lg:h-20 pb-1 tracking-widest lowercase text-lg lg:text-xl lg:flex items-center justify-center font-baskervilleSC  ">
                  LL ({issue.issueNumber})
                </span>
                <span
                  className="flex  lg:hidden w-1/2 items-center justify-center font-baskervilleSC text-center lg:text-xl text-lg tracking-widest lowercase "
                  onClick={onClose}
                >
                  stäng (X)
                </span>
              </div>

              {/* ── MOBILE: stacked ── */}
              <div className="lg:hidden flex flex-col w-full">
                <div className="h-[33.3dvh] flex flex-row overflow-x-auto snap-x snap-mandatory shrink-0">
                  {images.length > 0 ? (
                    images.map((img, i) => (
                      <div
                        key={img._key ?? i}
                        className="shrink-0 snap-start w-full h-full relative cursor-pointer"
                        onClick={() => setLightboxIndex(i)}
                      >
                        <Image
                          src={urlFor(img).url()}
                          fill
                          alt={img.alt ?? ""}
                          className="object-cover"
                        />
                      </div>
                    ))
                  ) : (
                    <div className="w-full h-full bg-foreground/10 shrink-0" />
                  )}
                </div>
                <div className=" flex flex-col items-center justify-center gap-6 px-6 pt-8 pb-36">
                  <h2 className="font-baskervilleSC text-2xl tracking-widest lowercasen text-center leading-tight">
                    {issue.title}
                  </h2>
                  {issue.description && (
                    <div className="max-w-prose flex flex-col px-4">
                      <SanityPortableText value={issue.description} />
                    </div>
                  )}
                </div>
              </div>

              {/* ── DESKTOP: absolute side-by-side panels ── */}
              <div
                className="hidden lg:block relative"
                style={{ height: "calc(100dvh - 3rem)" }}
              >
                {/* Images — left half */}
                <div className="absolute inset-y-0 left-0 w-1/2 overflow-y-auto">
                  {images.length > 0 ? (
                    images.map((img, i) => (
                      <div
                        key={img._key ?? i}
                        className="relative w-full aspect-2/3 shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setLightboxIndex(i)}
                      >
                        <Image
                          src={urlFor(img).url()}
                          fill
                          alt={img.alt ?? ""}
                          className="object-cover"
                        />
                      </div>
                    ))
                  ) : (
                    <div className="relative w-full aspect-2/3 bg-foreground/10" />
                  )}
                </div>

                {/* Details — right half */}
                <div className="absolute inset-y-0 left-1/2 right-0 overflow-y-auto  flex flex-col items-center justify-center gap-6 px-6 pt-30 pb-14">
                  <h2 className="font-baskervilleSC text-3xl tracking-widest lowercase text-center leading-tight">
                    {issue.title}
                  </h2>
                  {issue.description && (
                    <div className="max-w-prose flex flex-col px-16">
                      <SanityPortableText value={issue.description} />
                    </div>
                  )}
                </div>
              </div>

              {/* ── BOTTOM BAR (shared) ── */}
              <div className="fixed bottom-0 right-0 flex items-center bg-background w-full lg:w-[calc(100vw-7.5rem)] z-80">
                <div className="w-1/2 h-full hidden lg:flex">
                  <Button
                    variant="ghost"
                    className="font-baskervilleSC flex items-center justify-center w-full h-auto"
                    onClick={() => setLightboxIndex(0)}
                  >
                    {t("seeAllImages")}
                  </Button>
                </div>
                <div className="flex lg:hidden flex-col bg-background w-full gap-4 px-4 pt-4 pb-6 shadow-md">
                  <div className="flex w-full justify-between items-center">
                    <span className="font-baskervilleSC lowercase text-lg tracking-widest">
                      {issue.title}
                    </span>
                    {issue.price != null && (
                      <span className="font-baskervilleSC lowercase text-lg tracking-widest">
                        {issue.price} kr
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    disabled={issue.inStock === false}
                    className="disabled:opacity-30 shadow-none bg-neutral-300 disabled:cursor-not-allowed w-full"
                    onClick={handleAddToCart}
                  >
                    {issue.inStock === false ? t("soldOut") : t("addToCart")}
                  </Button>
                </div>
                <div className="relative w-full hidden lg:block lg:w-1/2">
                  <AnimatePresence>
                    {openShopInfo && (
                      <motion.div
                        className="absolute bottom-full left-0 w-full bg-background flex flex-col items-center justify-center gap-3 py-4"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                      >
                        <div className="flex w-full justify-between items-center px-8">
                          <span className="font-baskervilleSC lowercase text-lg lg:text-xl tracking-widest">
                            {issue.title}
                          </span>
                          {issue.price != null && (
                            <span className="font-baskervilleSC lowercase text-lg lg:text-xl tracking-widest">
                              {issue.price} kr
                            </span>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <Button
                    variant="ghost"
                    disabled={issue.inStock === false}
                    className="disabled:opacity-30 justify-center flex shadow-md bg-secondary disabled:cursor-not-allowed w-full "
                    onClick={() => {
                      if (openShopInfo) {
                        handleAddToCart();
                      } else {
                        setOpenShopInfo(true);
                      }
                    }}
                  >
                    {issue.inStock === false
                      ? t("soldOut")
                      : openShopInfo
                        ? t("addToCart")
                        : t("buyNow")}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
