import { HomeHeader } from "@/components/home/home-header";
import { PageIntro } from "@/components/marketing/page-intro";
import { getPageCopy, type PageKey } from "@/content/site-content";
import type { Locale } from "@/i18n/config";

export function StructuredPage({ locale, page }: { locale: Locale; page: PageKey }) {
  return <>
    <HomeHeader locale={locale} solid />
    <div className="site-header-spacer" aria-hidden="true" />
    <PageIntro {...getPageCopy(locale, page)} />
  </>;
}
