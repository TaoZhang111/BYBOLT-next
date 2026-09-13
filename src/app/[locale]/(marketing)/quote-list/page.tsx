import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { QuoteListPage } from "@/components/quote-list/quote-list-page";
import { isLocale } from "@/i18n/config";

type Props = { params: Promise<{ locale: string }> };

export const metadata: Metadata = {
  title: "Quote List",
  description: "Build a multi-product BYBOLT purchase list and submit one technical RFQ.",
  robots: { index: false, follow: false },
};

export default async function Page({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <QuoteListPage locale={locale} />;
}
