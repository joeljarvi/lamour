"use client";

import { useTranslations } from "next-intl";
import type { Issue } from "@/lib/contexts/IssuesContext";
import SanityPortableText from "@/components/SanityPortableText";
import ReadMore from "@/components/ReadMore";
import { issueTitle } from "@/lib/issueTitle";
import { splitNames } from "@/lib/splitNames";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

// Product information shown where an issue doesn't have it in Sanity
const PRODUCT_PLACEHOLDER = {
  releaseDate: "2026-11-12",
  binding: "softcover",
  pages: 125,
  isbn: "978-3-85676-501-9",
};

export const LABEL =
  "font-baskervilleNeoText uppercase tracking-[12%] text-xs text-neutral-600 indent-0 ";
export const VALUE =
  "font-baskervilleNeoText text-xs normal-case tracking-wide leading-[1.8] text-neutral-800";

// A label (small capitals) with its value(s) below. `inline`: on mobile a
// two-column row instead, the label in the first column and the value(s)
// in the second (stacked again on desktop)
export function Field({
  label,
  values,
  inline = false,
  valueClassName = VALUE,
}: {
  label: string;
  values: string[];
  inline?: boolean;
  // The values' style, in place of VALUE (e.g. "pStyle")
  valueClassName?: string;
}) {
  return (
    <div
      className={
        inline
          ? "grid grid-cols-2 gap-x-6 gap-y-1 lg:flex lg:flex-col lg:gap-1"
          : "flex flex-col gap-1"
      }
    >
      <dt className={LABEL}>{label}</dt>
      {values.map((v, i) => (
        <dd
          key={i}
          className={`${valueClassName} ${inline ? "col-start-2" : ""}`}
        >
          {v}
        </dd>
      ))}
    </div>
  );
}

// An issue's number and title, e.g. "#21 — Cant help myself", cut off
// when long
export function IssueTitle({ issue }: { issue: Issue }) {
  return (
    <div className="flex w-full min-w-0 flex-col items-center gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:h-9">
      <h2 className="min-w-0 truncate font-baskervilleNeoText text-xs uppercase tracking-[48%]">
        #{issue.issueNumber} — {issueTitle(issue.title)}
      </h2>
    </div>
  );
}

// An issue's product information rows (label + value). Year, format,
// language and weight come from Sanity and are left out when not set;
// release date, binding, pages and ISBN fall back to PRODUCT_PLACEHOLDER
export function useProductInfo(issue: Issue | null) {
  const t = useTranslations("Issue");
  if (!issue) return [];
  const cover = issue.dimensions?.cover;
  const productInfo = [
    { label: t("productYear"), value: issue.publishedAt?.slice(0, 4) },
    // Short date, e.g. 12.11.26 (like the articles list); placeholder until
    // the issue has a release date in Sanity
    {
      label: t("productReleaseDate"),
      value: new Date(
        issue.releaseDate ?? PRODUCT_PLACEHOLDER.releaseDate,
      ).toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        timeZone: "Europe/Stockholm",
      }),
    },
    {
      label: t("productFormat"),
      value:
        cover?.width != null && cover?.height != null
          ? t("productDimensions", {
              width: cover.width / 10,
              height: cover.height / 10,
            })
          : null,
    },
    {
      label: t("productBinding"),
      value: t("productBindingType", {
        binding: issue.binding ?? PRODUCT_PLACEHOLDER.binding,
      }),
    },
    {
      label: t("productPages"),
      value: String(issue.pageCount ?? PRODUCT_PLACEHOLDER.pages),
    },
    { label: "ISBN", value: issue.isbn || PRODUCT_PLACEHOLDER.isbn },
    // Language code: SV / EN
    { label: t("productLanguage"), value: issue.language?.toUpperCase() },
    {
      label: t("productWeight"),
      value: issue.weight != null ? `${issue.weight} g` : null,
    },
  ].filter((row): row is { label: string; value: string } => !!row.value);
  return productInfo;
}

// An issue's information (the issue card's right column, the home page's
// latest issue), in two columns on desktop: first the product details —
// contributors, editors, credits, then year, format, pages and so on — as
// a plain list, each label above its value(s); then number + title, the
// description (behind "Läs mer") and, at the bottom of that column, the
// price and add to cart ("Slutsåld", disabled, when sold out). Stacked on
// mobile, title and description first. `children` go below both (e.g. the
// card's back-to-shop button)
export default function IssueInfo({
  issue,
  onAddToCart,
  titleClassName = "flex",
  addToCartClassName,
  children,
}: {
  issue: Issue;
  onAddToCart: () => void;
  // The title row's and the add-to-cart button's display (the card hides
  // both on mobile, where it shows them elsewhere)
  titleClassName?: string;
  addToCartClassName?: string;
  children?: React.ReactNode;
}) {
  const t = useTranslations("Issue");

  const contributors = splitNames(issue.contributors);
  const editors = splitNames(issue.editors);
  const credits = issue.credits?.filter((c) => c.name) ?? [];
  // Credits as Produktinfo rows: one row per role (e.g. "Omslag"), its names
  // one per line, in the order they first appear; credits without a role
  // under "Credits"
  const creditRows: { label: string; names: string[] }[] = [];
  for (const c of credits) {
    const label = c.role?.trim() || t("credits");
    const row = creditRows.find((r) => r.label === label);
    if (row) row.names.push(c.name!);
    else creditRows.push({ label, names: [c.name!] });
  }
  const productInfo = useProductInfo(issue);

  // The product details: contributors, editors and credits (their names,
  // one per line), then the product information
  const details = [
    ...(contributors.length > 0
      ? [{ label: t("contributors"), values: contributors }]
      : []),
    ...(editors.length > 0 ? [{ label: t("editors"), values: editors }] : []),
    ...creditRows.map(({ label, names }) => ({ label, values: names })),
    ...productInfo.map(({ label, value }) => ({ label, values: [value] })),
  ];

  return (
    <div className="flex w-full flex-col gap-12">
      <div className="flex flex-col gap-12 lg:grid lg:grid-cols-2 lg:gap-6">
        {/* Product details: a plain list (no frame or lines), each label
            (small capitals) above its values */}
        <dl className="order-2 lg:order-1 flex flex-col gap-6 font-baskervilleNeoText text-neutral-800">
          {details.map((row) => (
            <div key={row.label} className="flex flex-col gap-3">
              <dt className="uppercase tracking-wide text-xs text-neutral-700 font-baskervilleNeoText">
                {row.label}
              </dt>
              {row.values.map((value, i) => (
                <dd
                  key={i}
                  className="text-sm normal-case tracking-wide font-baskervilleNeoText leading-tight"
                >
                  {value}
                </dd>
              ))}
            </div>
          ))}
        </dl>

        {/* Number + title, the description, then (at the column's
            bottom) the price and add to cart */}
        <div className="order-1 lg:order-2 flex flex-col gap-6">
          <div className={cn("w-full min-w-0", titleClassName)}>
            <IssueTitle issue={issue} />
          </div>
          {/* Justified, hyphenated (in the page's language) to keep the
              word spacing even; cut short behind "Läs mer" (new per issue,
              so it starts folded each time) */}
          {issue.description && (
            <ReadMore key={issue._id}>
              <div className="flex flex-col [&_p]:text-justify [&_p]:hyphens-auto">
                <SanityPortableText value={issue.description} />
              </div>
            </ReadMore>
          )}
          <div className="mt-auto flex flex-col gap-3 pt-6">
            {issue.price != null && (
              <span className="font-baskervilleNeoText text-xs uppercase tracking-[24%]">
                {issue.price} kr
              </span>
            )}
            <Button
              variant="default"
              size="default"
              disabled={issue.inStock === false}
              className={cn(
                "flex w-full justify-center bg-foreground text-background disabled:opacity-30 disabled:cursor-not-allowed font-baskervilleNeoText lg:text-sm text-xs normal-case tracking-wide hover:bg-foreground",
                addToCartClassName,
              )}
              onClick={onAddToCart}
            >
              {issue.inStock === false ? t("soldOut") : t("addToCart")}
            </Button>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
