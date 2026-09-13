"use client";

import type { Locale } from "@/i18n/config";

import { useQuoteList } from "./quote-list-context";
import type { QuoteListItem } from "./quote-list-item";

export function AddToQuoteButton({ item, locale, className }: { item: QuoteListItem; locale: Locale; className?: string }) {
  const { addItem, hasItem } = useQuoteList();
  const added = hasItem(item.id);

  return (
    <button className={`${className ?? ""} add-to-quote-button${added ? " is-added" : ""}`} type="button" onClick={() => addItem(item)}>
      <span>{added ? (locale === "zh" ? "已加入询价清单" : "Added to Quote List") : (locale === "zh" ? "加入询价清单" : "Add to Quote List")}</span>
      <span aria-hidden="true">{added ? "✓" : "+"}</span>
    </button>
  );
}
