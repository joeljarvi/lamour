"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const LINK =
  "cursor-pointer underline-offset-4 decoration-1 hover:underline h-[21px]";

// The end of the home page, below the shop: back to the top, on to the
// articles, or to subscribe. One row of three 24px rows (72px), on the
// line-number grid, its border inside it; pStyle, starting where the
// filter bar does (48px in on desktop)
export default function BottomNav() {
  const tNav = useTranslations("Nav");
  const tArticle = useTranslations("Article");

  return (
    <nav className="flex flex-col lg:flex-row mt-[63px] lg:mt-0  items-start justify-start h-auto lg:h-[72px]  gap-[21px] lg:gap-12  px-6 lg:px-3 pStyle lg:pl-0 mb-[21px] lg:ml-(--layout-ml) lg:pr-(--layout-mr) lg:transition-[margin,padding] lg:duration-500 lg:ease-in-out">
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`first-letter:uppercase ${LINK}`}
      >
        {tArticle("backToTop")}
      </button>
      <Link href="/articles" className={LINK}>
        {tNav("toArticles")}
      </Link>
      <Link href="/subscribe" className={LINK}>
        {tNav("becomeSubscriber")}
      </Link>
    </nav>
  );
}
