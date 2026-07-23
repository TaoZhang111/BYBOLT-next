import type { Metadata } from "next";

import { RfqPage } from "@/components/rfq/rfq-page";
import { isLocale } from "@/i18n/config";
import { localizedAlternates } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: "Request a Quote",
    description: "Request a quotation for standard or custom high-temperature alloy fasteners, including drawing review, testing and export requirements.",
    alternates: localizedAlternates(locale, "request-a-quote"),
  };
}

export default async function RequestQuotePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  return <RfqPage locale={locale} />;
}
