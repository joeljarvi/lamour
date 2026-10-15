"use client";

import { useRouter } from "@/i18n/navigation";
import IssueCard from "@/components/IssueCard";
import { type Issue } from "@/lib/contexts/IssuesContext";

export default function ShopIssueCard({ issue }: { issue: Issue }) {
  const router = useRouter();
  return <IssueCard issue={issue} onClose={() => router.push("/")} />;
}
