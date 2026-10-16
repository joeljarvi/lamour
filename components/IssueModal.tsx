"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import IssueCard from "@/components/IssueCard";
import { useIssues } from "@/lib/contexts/IssuesContext";

// Issue panel as a modal over the page it was opened from (the intercepted
// /shop/[slug] route). The issue comes from the issues already loaded by the
// layout. Closing slides the panel out, then goes back to that page
export default function IssueModal({ slug }: { slug: string }) {
  const router = useRouter();
  const issue = useIssues().find((i) => i.slug.current === slug) ?? null;
  const [closing, setClosing] = useState(false);

  return (
    <IssueCard
      issue={closing ? null : issue}
      onClose={() => setClosing(true)}
      onExited={() => router.back()}
    />
  );
}
