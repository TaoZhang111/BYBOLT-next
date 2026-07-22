import type { Locale } from "@/i18n/config";

export type LocalizedText = Record<Locale, string>;

export type AlloySummary = {
  id: string;
  slug: string;
  name: string;
  family: "nickel" | "cobalt" | "iron";
  standards: string[];
  summary: LocalizedText;
};

export type NewsSummary = {
  id: string;
  slug: string;
  title: LocalizedText;
  excerpt: LocalizedText;
  publishedAt: string;
};
