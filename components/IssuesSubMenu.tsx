"use client";

import { useTranslations } from "next-intl";
import { useIssues, type Issue } from "@/lib/contexts/IssuesContext";
import { useCart } from "@/lib/contexts/CartContext";
import { Link } from "@/i18n/navigation";
import { Button } from "./ui/button";

function IssueRow({ issue }: { issue: Issue }) {
  return (
    <Button
      variant="link"
      size="lg"
      className=" leading-loose px-20    font-baskervilleNeoDisplay "
      asChild
    >
      <Link href={`/shop/${issue.slug.current}`}>
        <span className="flex min-w-0 gap-2 normal-case">
          <span className="shrink-0">LL{issue.issueNumber}</span>
          <span className="min-w-0 truncate">{issue.title}</span>
        </span>
      </Link>
    </Button>
  );
}

export default function IssuesSubMenu() {
  const issues = useIssues();
  const { setDrawerOpen } = useCart();
  const t = useTranslations("Nav");
  return (
    <div className="flex flex-col items-start justify-start whitespace-normal w-full border-b border-b-foreground">
      <div className="flex flex-col w-full">
        {issues.map((issue) => (
          <IssueRow key={issue._id} issue={issue} />
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
