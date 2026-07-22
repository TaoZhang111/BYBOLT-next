import { PageIntro } from "@/components/marketing/page-intro";
import { getPageCopy, type PageKey } from "@/content/site-content";
import type { Locale } from "@/i18n/config";

export function StructuredPage({ locale, page }: { locale: Locale; page: PageKey }) {
  return <PageIntro {...getPageCopy(locale, page)} />;
}
