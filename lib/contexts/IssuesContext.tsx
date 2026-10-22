"use client";

import { createContext, useContext } from "react";

export type Issue = {
  _id: string;
  title: string;
  slug: { current: string };
  issueNumber: number;
  language?: "sv" | "en";
  cover?: { asset: { _ref: string }; alt?: string };
  // Optional; the shop tile shows it instead of the cover
  productImage?: { asset: { _ref: string }; alt?: string };
  price?: number;
  weight?: number;
  inStock?: boolean;
  publishedAt?: string;
  releaseDate?: string;
  dimensions?: {
    cover?: { width: number; height: number };
    spine?: { width: number };
  };
  pageCount?: number;
  isbn?: string;
  binding?: "softcover" | "hardcover";
  description?: any[];
  contributors?: string;
  editors?: string;
  quotes?: Array<{ _key: string; text?: string; author?: string }>;
  credits?: Array<{ _key: string; role?: string; name?: string }>;
  previewImages?: Array<{ _key: string; asset: any; alt?: string }>;
};

const IssuesContext = createContext<Issue[]>([]);

export function IssuesProvider({
  issues,
  children,
}: {
  issues: Issue[];
  children: React.ReactNode;
}) {
  return (
    <IssuesContext.Provider value={issues}>{children}</IssuesContext.Provider>
  );
}

export function useIssues() {
  return useContext(IssuesContext);
}
