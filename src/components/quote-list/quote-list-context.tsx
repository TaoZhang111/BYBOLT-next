"use client";

import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";
import type { QuoteListItem } from "./quote-list-item";

type QuoteListContextValue = {
  items: QuoteListItem[];
  hydrated: boolean;
  addItem: (item: QuoteListItem) => void;
  addManualItem: (productName?: string) => string;
  updateItem: (id: string, patch: Partial<QuoteListItem>) => void;
  removeItem: (id: string) => void;
  clearItems: () => void;
  hasItem: (id: string) => boolean;
};

const STORAGE_KEY = "bybolt-quote-list-v1";
const QuoteListContext = createContext<QuoteListContextValue | null>(null);

function isQuoteListItem(value: unknown): value is QuoteListItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<QuoteListItem>;
  return typeof item.id === "string" && typeof item.productName === "string" && typeof item.quantity === "string";
}

function manualQuoteItem(productName = ""): QuoteListItem {
  return {
    id: `manual:${crypto.randomUUID()}`,
    categoryName: "Manual requirement",
    productName,
    categorySlug: "",
    productSlug: "",
    description: "",
    image: "",
    catalogSize: "",
    catalogStandard: "",
    threads: "",
    material: "",
    requestedSize: "",
    standard: "",
    quantity: "1",
    quantityUnit: "pcs",
    notes: "",
  };
}

export function QuoteListProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<QuoteListItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let nextItems: QuoteListItem[] = [];
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as unknown;
      if (Array.isArray(stored)) nextItems = stored.filter(isQuoteListItem).slice(0, 25);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    const timer = window.setTimeout(() => {
      setItems(nextItems);
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [hydrated, items]);

  const value = useMemo<QuoteListContextValue>(() => ({
    items,
    hydrated,
    addItem(item) {
      setItems((current) => current.some((entry) => entry.id === item.id) ? current : [...current, item].slice(0, 25));
    },
    addManualItem(productName) {
      const item = manualQuoteItem(productName);
      setItems((current) => [...current, item].slice(0, 25));
      return item.id;
    },
    updateItem(id, patch) {
      setItems((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item));
    },
    removeItem(id) {
      setItems((current) => current.filter((item) => item.id !== id));
    },
    clearItems() {
      setItems([]);
    },
    hasItem(id) {
      return items.some((item) => item.id === id);
    },
  }), [hydrated, items]);

  return <QuoteListContext.Provider value={value}>{children}</QuoteListContext.Provider>;
}

export function useQuoteList() {
  const context = useContext(QuoteListContext);
  if (!context) throw new Error("useQuoteList must be used within QuoteListProvider.");
  return context;
}
