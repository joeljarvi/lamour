"use client";

import { createContext, useContext } from "react";

export type Issue = {
  _id: string;
  title: string;
  slug: { current: string };
  issueNumber: number;
  language?: "sv" | "en";
  cover?: { asset: { _ref: string }; alt?: string };
  spine?: { asset: { _ref: string }; alt?: string };
  back?: { asset: { _ref: string }; alt?: string };
  price?: number;
  weight?: number;
  inStock?: boolean;
  publishedAt?: string;
  dimensions?: {
    cover?: { width: number; height: number };
    spine?: { width: number };
  };
  description?: any[];
  contributors?: string;
  themeEditors?: string;
  designer?: string;
  quotes?: Array<{ _key: string; text?: string; author?: string }>;
  credits?: Array<{ _key: string; role?: string; name?: string }>;
  interviews?: string[];
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
