import type { AlloySummary, NewsSummary } from "@/types/content";

/**
 * The UI depends on this small contract instead of a CMS SDK directly.
 * A Sanity, Payload or other provider adapter can be added without changing pages.
 */
export interface CmsClient {
  getAlloys(): Promise<AlloySummary[]>;
  getAlloyBySlug(slug: string): Promise<AlloySummary | null>;
  getNews(): Promise<NewsSummary[]>;
  getNewsBySlug(slug: string): Promise<NewsSummary | null>;
}
