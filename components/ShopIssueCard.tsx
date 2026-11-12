"use client";

import { useRouter } from "@/i18n/navigation";
import IssuePage from "@/components/IssuePage";
import { type Issue } from "@/lib/contexts/IssuesContext";

export default function ShopIssuePage({ issue }: { issue: Issue }) {
  const router = useRouter();
  return <IssuePage issue={issue} onClose={() => router.push("/")} />;
}
