"use client";

import Link from "@/components/navigation/static-link";
import type { Locale } from "@/i18n/config";

import { useQuoteList } from "./quote-list-context";

export function QuoteListNavLink({ locale, onNavigate }: { locale: Locale; onNavigate?: () => void }) {
  const { items, hydrated } = useQuoteList();
  const label = locale === "zh" ? "询价清单" : "Quote List";

  return (
    <Link className="quote-list-nav-link" href={`/${locale}/quote-list/`} onClick={onNavigate} aria-label={`${label}, ${items.length} items`}>
      <span>{label}</span>
      <b aria-hidden="true">{hydrated ? items.length : 0}</b>
    </Link>
  );
}
