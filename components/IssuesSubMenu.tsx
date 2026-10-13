"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useIssues, type Issue } from "@/lib/contexts/IssuesContext";
import { useCart } from "@/lib/contexts/CartContext";
import { IssueFront } from "./Covers";
import SanityPortableText from "./SanityPortableText";
import { Button } from "./ui/button";
import { issueTitle } from "@/lib/issueTitle";

function IssueRow({
  issue,
  open,
  onToggle,
  onCoverSelect,
}: {
  issue: Issue;
  open: boolean;
  onToggle: () => void;
  onCoverSelect: (issue: Issue) => void;
}) {
  const { addToCart, setDrawerOpen } = useCart();
  const t = useTranslations("Issue");

  function handleAddToCart() {
    addToCart({
      id: issue._id,
      title: issue.title,
      price: issue.price != null ? `${issue.price} kr` : "0",
    });
    setDrawerOpen(true);
  }

  return (
    <div className="w-full">
      <Button
        variant="link"
        size="lg"
        className="flex items-center gap-2 leading-loose px-4 font-baskervilleNeoDisplay normal-case cursor-default w-full justify-start aria-expanded:border-b-transparent aria-expanded:pt-4"
        aria-expanded={open}
        onClick={onToggle}
      >
        <span>LL#{issue.issueNumber}</span>
        <span className="text-left">{issueTitle(issue.title)}</span>
      </Button>

      {/* Expanded: cover + buy button in column 1, text from column 5 */}
      {open && (
        <div className="flex flex-col lg:grid lg:grid-cols-12 items-center lg:items-start gap-16 px-4 pb-4 pt-12 [&_*]:cursor-default border-b border-b-foreground">
          <div className="flex flex-col col-span-3  gap-4 pr-21">
            <IssueFront issue={issue} onSelect={onCoverSelect} />

            <h2 className="font-universTypewriter text-xs">
              omslag: Agnes Ivarsson
            </h2>
          </div>
          {issue.description && (
            <div className="  flex flex-col col-start-4 col-span-6 w-full">
              <SanityPortableText value={issue.description} />
            </div>
          )}
          <div className="col-start-1 col-span-12 w-full space-y-8">
            <Button
              variant="outline"
              disabled={issue.inStock === false}
              className="disabled:opacity-30  "
              onClick={handleAddToCart}
            >
              {issue.inStock === false ? t("soldOut") : t("addToCart")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Accordion of all issues; clicking a cover hands the issue to `onCoverSelect`
export default function IssuesSubMenu({
  onCoverSelect,
}: {
  onCoverSelect: (issue: Issue) => void;
}) {
  const issues = useIssues();
  const { setDrawerOpen } = useCart();
  const t = useTranslations("Nav");
  const [openId, setOpenId] = useState<string | null>(null);
  return (
    <div
      className={`flex flex-col items-start justify-start whitespace-normal w-full border-b transition-colors duration-300 ${
        openId ? "border-b-transparent" : "border-b-foreground"
      }`}
    >
      <div className="flex flex-col w-full">
        {issues.map((issue) => (
          <IssueRow
            key={issue._id}
            issue={issue}
            open={issue._id === openId}
            onToggle={() =>
              setOpenId((id) => (id === issue._id ? null : issue._id))
            }
            onCoverSelect={onCoverSelect}
          />
        ))}

        <Button
          variant="outline"
          size="sm"
          className=" justify-center "
          onClick={() => setDrawerOpen(true)}
        >
          {t("toCheckout")}
        </Button>
      </div>
    </div>
  );
}
