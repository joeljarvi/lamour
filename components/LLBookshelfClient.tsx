"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { useIssues, type Issue } from "@/lib/contexts/IssuesContext";
import { useArticles, type Article } from "@/lib/contexts/ArticlesContext";
import { urlFor } from "@/lib/sanity/image";
import { getDimensions } from "@/lib/getDimensions";
import IssueCard from "./IssueCard";
import { Button } from "./ui/button";
import { IssuesShelf, ArticlesShelf } from "./LLGridClient";

export type BookshelfVariant = "home" | "issues" | "articles";

const DEFAULT_DIMS = getDimensions();

// ─── Physics fall (rygg view) ─────────────────────────────────────────────

async function runPhysicsFall(container: HTMLElement): Promise<() => void> {
  const Matter = (await import("matter-js")).default;
  const items = Array.from(container.children) as HTMLElement[];
  if (!items.length) return () => {};

  const vh = window.innerHeight;
  const FLOOR_Y = 0;
  const BODY_HEIGHT = 160;
  const FLOOR_THICKNESS = 16;
  const engine = Matter.Engine.create({ gravity: { y: 2, x: 0 } });
  const floor = Matter.Bodies.rectangle(
    500,
    BODY_HEIGHT / 2 + FLOOR_THICKNESS / 2,
    1_000_000,
    FLOOR_THICKNESS,
    { isStatic: true },
  );
  const bodies = items.map((_, i) =>
    Matter.Bodies.rectangle(i * 80, -(vh * 0.5 + i * 60), 60, BODY_HEIGHT, {
      restitution: 0.25,
      frictionAir: 0.04,
    }),
  );
  Matter.Composite.add(engine.world, [floor, ...bodies]);
  items.forEach((el) => (el.style.willChange = "transform"));

  let rafId: number;
  let active = true;

  const tick = () => {
    if (!active) return;
    Matter.Engine.update(engine, 1000 / 60);
    let settled = true;
    bodies.forEach((body, i) => {
      const y = body.position.y - FLOOR_Y;
      items[i].style.transform = `translateY(${y}px)`;
      if (Math.abs(body.velocity.y) > 0.3 || y < -1) settled = false;
    });
    if (settled) {
      active = false;
      items.forEach((el) => {
        el.style.transition = "transform 0.2s ease-out";
        el.style.transform = "";
      });
      setTimeout(
        () =>
          items.forEach((el) => {
            el.style.transition = "";
            el.style.willChange = "";
          }),
        200,
      );
      try {
        Matter.Engine.clear(engine);
      } catch {}
      return;
    }
    rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);

  return () => {
    active = false;
    cancelAnimationFrame(rafId);
    items.forEach((el) => {
      el.style.transform = "";
      el.style.transition = "";
      el.style.willChange = "";
    });
    try {
      Matter.Engine.clear(engine);
    } catch {}
  };
}

// ─── BookshelfButton ──────────────────────────────────────────────────────
// Vertical spine on desktop, horizontal bar on mobile.
// Pass href for navigation, onClick for interaction, or neither for a label.

export function BookshelfButton({
  label,
  onClick,
  href,
  horizontal = false,
}: {
  label: string;
  colorIndex: number;
  onClick?: () => void;
  href?: string;
  horizontal?: boolean;
}) {
  const barClass =
    "w-full flex mx-auto lg:mx-0 justify-center items-center font-baskervilleSC text-lg h-12 tracking-widest hover:opacity-60 lowercase text-foreground transition-opacity border-b border-foreground/20 bg-background";
  const mobileClass = `lg:hidden ${barClass}`;
  const desktopClass =
    "hidden lg:flex flex-col shrink-0 w-14  h-dvh max-h-[50dvh] items-center pt-8 justify-start pl-1 font-baskervilleSC tracking-widest text-xl lg:text-lg lowercase text-foreground hover:opacity-80 transition-opacity bg-background";

  if (horizontal) {
    if (href)
      return (
        <Link href={href} className={barClass}>
          {label}
        </Link>
      );
    if (onClick)
      return (
        <button onClick={onClick} className={barClass}>
          {label}
        </button>
      );
    return <div className={barClass}>{label}</div>;
  }

  const desktopLabel = (
    <span style={{ writingMode: "vertical-rl" }}>{label}</span>
  );

  if (href) {
    return (
      <>
        <Link href={href} className={mobileClass}>
          {label}
        </Link>
        <Link href={href} className={desktopClass}>
          {desktopLabel}
        </Link>
      </>
    );
  }

  if (onClick) {
    return (
      <>
        <button onClick={onClick} className={mobileClass}>
          {label}
        </button>
        <button onClick={onClick} className={desktopClass}>
          {desktopLabel}
        </button>
      </>
    );
  }

  return (
    <>
      <div className={mobileClass}>{label}</div>
      <div className={desktopClass}>{desktopLabel}</div>
    </>
  );
}

// ─── Issue spine (rygg view) ──────────────────────────────────────────────

function IssueSpine({
  issue,
  isDesktop,
  onSelect,
}: {
  issue: Issue;
  isDesktop: boolean;
  onSelect: (issue: Issue) => void;
}) {
  const dims = getDimensions(issue.dimensions);
  const src = issue.cover?.asset ? urlFor(issue.cover).url() : null;
  const href = `/shop/${issue.slug.current}`;

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    onSelect(issue);
  }

  if (!isDesktop) {
    return (
      <Link
        href={href}
        onClick={handleClick}
        className="relative shrink-0 flex items-center justify-between px-6 h-12 overflow-hidden opacity-80 hover:opacity-100 transition-opacity duration-300 font-baskervilleSC text-xl tracking-widest lowercase bg-background text-foreground border-b border-foreground/20"
        style={{ width: issueMobileWidth(dims) }}
      >
        {src && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 h-10 aspect-17/24 overflow-hidden">
            <Image src={src} fill alt="" className="object-cover" />
          </div>
        )}
        <span className="relative z-10 min-w-0 truncate">{issue.title}</span>
        <span className="relative z-10 shrink-0">LL ({issue.issueNumber})</span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      className="relative shrink-0 flex flex-col items-center justify-between pt-8 pb-8 overflow-hidden opacity-80 hover:opacity-100 transition-opacity duration-300 w-14 bg-background border-r border-foreground/20"
      style={{ height: `min(${dims.coverHeightPx}px, 75dvh)` }}
    >
      <span
        className="relative z-10 font-baskervilleSC text-foreground text-lg tracking-widest lowercase whitespace-nowrap overflow-hidden"
        style={{ writingMode: "vertical-rl", maxWidth: "calc(75dvh - 6rem)" }}
      >
        {issue.title}
      </span>
      <span
        className="relative z-10 font-baskervilleSC text-foreground text-lg tracking-widest whitespace-nowrap lowercase shrink-0"
        style={{ writingMode: "vertical-rl" }}
      >
        LL ({issue.issueNumber})
      </span>
    </Link>
  );
}

// ─── Issue front cover (fram view) ───────────────────────────────────────

function IssueFront({
  issue,
  onSelect,
  className = "",
}: {
  issue: Issue;
  onSelect: (issue: Issue) => void;
  className?: string;
}) {
  const dims = getDimensions(issue.dimensions);
  const src = issue.cover?.asset ? urlFor(issue.cover).url() : null;
  const href = `/shop/${issue.slug.current}`;

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    onSelect(issue);
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={`relative overflow-hidden hover:opacity-90 transition-opacity duration-300 min-h-[50dvh] h-auto shadow lg:max-h-full flex items-end ${className}`}
      style={{ aspectRatio: dims.coverAspectRatio }}
    >
      {src ? (
        <Image
          src={src}
          fill
          alt={issue.cover?.alt ?? issue.title}
          className="object-cover object-right"
        />
      ) : (
        <div className=" h-full lg:h-[50dvh] aspect-17/24 bg-foreground/20 flex flex-col justify-end items-start p-6">
          <span className="font-baskervilleSC text-foreground lowercase text-lg tracking-widest leading-tight">
            {issue.title}
          </span>
          <span className="font-baskervilleSC lowercase text-foreground/60 text-lg ">
            LL ({issue.issueNumber})
          </span>
        </div>
      )}
    </Link>
  );
}

// ─── Article front cover ──────────────────────────────────────────────────

function ArticleFront({
  article,
  className = "",
}: {
  article: Article;
  className?: string;
}) {
  const src = article.coverImage?.asset
    ? urlFor(article.coverImage).url()
    : null;
  const href = `/articles/${article.slug.current}`;

  return (
    <Link
      href={href}
      className={`relative shadow overflow-hidden hover:opacity-80 transition-opacity duration-300  h-[50dvh] flex items-center ${className}`}
      style={{ aspectRatio: DEFAULT_DIMS.coverAspectRatio }}
    >
      {src ? (
        <Image
          src={src}
          fill
          alt={article.coverImage?.alt ?? article.title}
          className="object-cover h-full lg:h-[50dvh] aspect-17/24"
        />
      ) : (
        <div className="h-full lg:h-[50dvh] aspect-17/24 bg-foreground/10 flex flex-col justify-center items-center p-6">
          <span className="font-baskervilleSC text-center text-foreground lowercase text-lg tracking-widest leading-tight">
            {article.title}
          </span>
          {article.author && (
            <span className="font-baskervilleSC lowercase text-foreground/60 text-lg mt-0">
              {article.author.name}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}

// ─── Spine size helpers ───────────────────────────────────────────────────

const MAX_COVER_HEIGHT_PX = 300 * 3.7795; // 300 mm in px

function issueMobileWidth(dims: ReturnType<typeof getDimensions>): string {
  const pct = Math.max(
    40,
    Math.min(100, (dims.coverHeightPx / MAX_COVER_HEIGHT_PX) * 100),
  );
  return `${pct.toFixed(1)}%`;
}

function articleSpineSize(bodyLength?: number) {
  const chars = bodyLength ?? 3000;
  const fraction = Math.min(chars / 10000, 1);
  return {
    heightDvh: 25 + fraction * 50, // 25 dvh → 75 dvh
    widthPct: 40 + fraction * 60, // 40 % → 100 %
  };
}

// ─── Article spine ────────────────────────────────────────────────────────
// vertical=true: desktop shows a narrow w-14 vertical spine (like IssueSpine),
//                mobile shows a horizontal bar.
// vertical=false (default): always a horizontal bar (used inside series columns).

function ArticleSpine({
  article,
  vertical = false,
}: {
  article: Article;
  vertical?: boolean;
}) {
  const href = `/articles/${article.slug.current}`;
  const { heightDvh, widthPct } = articleSpineSize(article.bodyLength);

  const horizontalBar = (
    <Link
      href={href}
      className="shrink-0 bg-background flex items-center justify-between px-6 h-12 opacity-80 hover:opacity-100 transition-opacity duration-300 border-b border-foreground/20"
      style={{ width: `${widthPct.toFixed(1)}%` }}
    >
      <span className="font-baskervilleSC text-foreground text-xl lg:text-lg tracking-widest lowercase min-w-0 truncate">
        {article.title}
      </span>
      {article.issue && (
        <span className="font-baskervilleSC text-foreground text-xl lg:text-lg tracking-widest lowercase shrink-0">
          LL ({article.issue.issueNumber})
        </span>
      )}
    </Link>
  );

  if (!vertical) return horizontalBar;

  return (
    <>
      {/* Mobile — horizontal bar, width reflects article length */}
      <Link
        href={href}
        className="lg:hidden shrink-0 bg-background flex items-center justify-between px-6 h-12 opacity-80 hover:opacity-100 transition-opacity duration-300 border-b border-foreground/20"
        style={{ width: `${widthPct.toFixed(1)}%` }}
      >
        <span className="font-baskervilleSC text-foreground text-xl tracking-widest lowercase min-w-0 truncate">
          {article.title}
        </span>
      </Link>
      {/* Desktop — vertical spine, height reflects article length */}
      <Link
        href={href}
        className="hidden lg:flex shrink-0 flex-col items-center justify-between pt-8 pb-8 opacity-80 hover:opacity-100 transition-opacity duration-300 w-14 bg-background border-r border-foreground/20"
        style={{ height: `${heightDvh.toFixed(1)}dvh` }}
      >
        <span
          className="font-baskervilleSC text-foreground text-xl lg:text-lg tracking-widest lowercase whitespace-nowrap overflow-hidden"
          style={{
            writingMode: "vertical-rl",
            maxWidth: `calc(${heightDvh.toFixed(1)}dvh - 6rem)`,
          }}
        >
          {article.title}
        </span>
        {article.issue && (
          <span
            className="font-baskervilleSC text-foreground text-xl lg:text-lg tracking-widest whitespace-nowrap lowercase shrink-0"
            style={{ writingMode: "vertical-rl" }}
          >
            LL ({article.issue.issueNumber})
          </span>
        )}
      </Link>
    </>
  );
}

// ─── Shared hooks ─────────────────────────────────────────────────────────

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isDesktop;
}

function useHorizontalScrollOnWheel() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: WheelEvent) => {
      const el = ref.current;
      if (!el || window.innerWidth < 1024) return;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      const goingRight = e.deltaY > 0;
      const canScrollRight =
        el.scrollLeft < el.scrollWidth - el.clientWidth - 1;
      const canScrollLeft = el.scrollLeft > 0;
      if ((goingRight && !canScrollRight) || (!goingRight && !canScrollLeft))
        return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    window.addEventListener("wheel", handler, { passive: false });
    return () => window.removeEventListener("wheel", handler);
  }, []);
  return ref;
}

// ─── HOME SHELF ──────────────────────────────────────────────────────────

function HomeShelf() {
  const issues = useIssues();
  const { articles } = useArticles();
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const isDesktop = useIsDesktop();
  const containerRef = useHorizontalScrollOnWheel();
  const physicsRef = useRef<HTMLDivElement | null>(null);

  const latestIssue = issues[0] ?? null;
  const latestArticle = articles[0] ?? null;

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    const t = setTimeout(async () => {
      if (physicsRef.current)
        cleanup = await runPhysicsFall(physicsRef.current);
    }, 30);
    return () => {
      clearTimeout(t);
      cleanup?.();
    };
  }, []);

  return (
    <>
      <div
        ref={(el) => {
          (containerRef as { current: HTMLDivElement | null }).current = el;
          physicsRef.current = el;
        }}
        className="flex flex-col items-center justify-end w-full px-0 mt-14 lg:mt-0  bg-neutral-300 min-h-dvh pb-16 lg:pb-0 lg:flex-row lg:items-end lg:justify-start lg:min-h-0 lg:h-screen lg:overflow-x-auto"
      >
        {latestIssue && (
          <IssueFront
            issue={latestIssue}
            onSelect={setSelectedIssue}
            className={`${latestIssue.dimensions ? "max-h-120" : "h-120"} shrink-0`}
          />
        )}
        {issues.slice(1, 4).map((issue) => (
          <IssueSpine
            key={issue._id}
            issue={issue}
            isDesktop={isDesktop}
            onSelect={setSelectedIssue}
          />
        ))}
        <BookshelfButton label="alla nummer" colorIndex={1} href="/shop" />
        {latestArticle && (
          <ArticleFront article={latestArticle} className="h-120 shrink-0" />
        )}
        {articles.slice(1, 4).map((article) => (
          <ArticleSpine key={article._id} article={article} vertical />
        ))}
        <BookshelfButton
          label="alla artiklar"
          colorIndex={2}
          href="/articles"
        />
      </div>
      <IssueCard issue={selectedIssue} onClose={() => setSelectedIssue(null)} />
    </>
  );
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────

export default function LLBookshelfClient({
  variant,
}: {
  variant: BookshelfVariant;
}) {
  if (variant === "home") return <HomeShelf />;
  if (variant === "issues") return <IssuesShelf />;
  return <ArticlesShelf />;
}
