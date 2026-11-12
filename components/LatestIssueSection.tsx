"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useIssues, type Issue } from "@/lib/contexts/IssuesContext";
import { urlFor } from "@/lib/sanity/image";
import { issueTitle } from "@/lib/issueTitle";
import SanityPortableText from "@/components/SanityPortableText";
import ReadMore from "@/components/ReadMore";
import { Field, LABEL, useProductInfo } from "./IssueInfo";
import { splitNames } from "@/lib/splitNames";

// Below the hero on the home page: the latest issue (issues come newest
// first) on a 12-column grid on desktop: the cover (1 column, linking to
// the issue's modal); title, price and cover credit (3) — both sticky;
// "Kolofon", the editors and product information (3); "Om numret", the
// description and an "Utforska nummer" link to the issue (5). On mobile a 6-column grid: cover + title (2), a
// column gap, Kolofon (3), then the description across all 6
export default function LatestIssueSection() {
  const latest = useIssues()[0];
  if (!latest) return null;
  return <LatestIssue issue={latest} />;
}

function LatestIssue({ issue }: { issue: Issue }) {
  const t = useTranslations("Issue");
  const productInfo = useProductInfo(issue);
  const editors = splitNames(issue.editors);
  // The cover's credit: credits whose role is "Omslag" / "Cover"
  const coverCredits =
    issue.credits
      ?.filter((c) => c.name && /omslag|cover/i.test(c.role ?? ""))
      .map((c) => c.name!) ?? [];

  return (
    <section className="w-full grid grid-cols-6 gap-x-6 gap-y-12 px-6 py-6 lg:grid-cols-12 lg:gap-6 lg:items-stretch">
      {/* The cover as wide as a shop cover: 3 of 12 columns on desktop
          (= 6 of the shop's 24), half the width on mobile (= one of the
          shop's two). Mobile: the cover with the title, price and cover
          credit below it, in the first three columns. Desktop: no box of its own (contents),
          the two are separate grid columns */}
      <div className="col-span-3 flex flex-col gap-6 lg:contents">
        <div className="lg:col-span-3 lg:sticky lg:top-[max(6rem,calc(var(--nav-h,0px)+1.5rem))] lg:transition-[top] lg:duration-300 lg:self-start">
          {issue.cover?.asset && (
            <Link
              href={`/shop/${issue.slug.current}`}
              scroll={false}
              aria-label={issueTitle(issue.title)}
              className="block hover:opacity-90 transition-opacity"
            >
              <Image
                src={urlFor(issue.cover).width(800).url()}
                alt={issue.cover.alt ?? issueTitle(issue.title)}
                width={800}
                height={1100}
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="w-full h-auto"
              />
            </Link>
          )}
        </div>

        {/* Sticks below the top while the longer columns scroll past */}
        <dl className="lg:col-span-3 flex flex-col gap-6 lg:sticky lg:top-[max(6rem,calc(var(--nav-h,0px)+1.5rem))] lg:transition-[top] lg:duration-300 lg:self-start">
          {/* The title in pStyle, the price on the line below it */}
          <Field
            label={t("title")}
            values={[
              `#${issue.issueNumber} — ${issueTitle(issue.title)}`,
              ...(issue.price != null ? [`${issue.price} kr`] : []),
            ]}
            valueClassName="pStyle"
          />
          {coverCredits.length > 0 && (
            <Field label={t("cover")} values={coverCredits} />
          )}
        </dl>
      </div>

      <div className="col-span-6 lg:col-span-5 lg:pr-6 flex flex-col gap-6">
        <span className={`${LABEL}`}>{t("aboutIssue")}</span>
        {issue.description && (
          <ReadMore key={issue._id}>
            <div className="flex flex-col [&_p]:text-justify [&_p]:hyphens-auto pStyle">
              <SanityPortableText value={issue.description} />
            </div>
          </ReadMore>
        )}
        <Link
          href={`/shop/${issue.slug.current}`}
          scroll={false}
          className="pStyle self-start hover:underline underline-offset-4"
        >
          {t("exploreIssue")}
        </Link>
      </div>
    </section>
  );
}
