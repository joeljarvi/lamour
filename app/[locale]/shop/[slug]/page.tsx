import { client } from "@/lib/sanity/client";
import { issueBySlugQuery, issuesQuery } from "@/lib/sanity/queries";
import { notFound } from "next/navigation";
import ShopIssueCard from "@/components/ShopIssueCard";
import { type Issue } from "@/lib/contexts/IssuesContext";

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const issues: Issue[] = await client.fetch(issuesQuery);
    return issues.map((issue) => ({ slug: issue.slug.current }));
  } catch {
    return [];
  }
}

export default async function IssuePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let issue: Issue | null = null;
  try {
    issue = await client.fetch(issueBySlugQuery, { slug });
  } catch {
    // Sanity not yet configured
  }

  if (!issue) notFound();

  return <ShopIssueCard issue={issue} />;
}
