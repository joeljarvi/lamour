"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

// As the shop's filter buttons: Baskerville Neo Text, text-1, normal case
const LINK =
  "cursor-pointer whitespace-nowrap font-baskervilleNeoText text-1 font-normal normal-case tracking-normal underline-offset-4 decoration-1 hover:underline";

// The end of the home page, below the shop: back to the top, on to the
// articles, or to subscribe. One row of three 24px rows (72px), on the
// line-number grid; on the navbar's 12 columns (20px in, 12px apart), the
// links one under the other in column 1
export default function BottomNav() {
  const tNav = useTranslations("Nav");
  const tArticle = useTranslations("Article");

  return (
    <nav className="grid grid-cols-12 gap-x-3 px-5 mt-[63px] lg:mt-0 mb-[21px]">
      <div className="col-start-1 flex flex-col items-start gap-0">
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
      </div>
    </nav>
  );
}
