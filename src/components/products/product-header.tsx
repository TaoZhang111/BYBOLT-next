"use client";

import { useState } from "react";

import { CatalogDropdown } from "@/components/navigation/catalog-dropdown";
import Link from "@/components/navigation/static-link";
import type { Locale } from "@/i18n/config";

import styles from "./product-site.module.css";

export function ProductHeader({
  locale,
  current = "products",
}: {
  locale: Locale;
  current?: "products" | "materials" | "custom" | "quality" | "resources" | "about";
}) {
  const [isOpen, setIsOpen] = useState(false);
  const base = `/${locale}`;

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link className={styles.brand} href={base} aria-label="BYBOLT home">
          <span>BY</span>BOLT
        </Link>
        <button
          className={styles.menuButton}
          type="button"
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          onClick={() => setIsOpen((current) => !current)}
        >
          <span />
          <span />
        </button>
        <nav className={`${styles.navigation}${isOpen ? ` ${styles.navigationOpen}` : ""}`} aria-label="Product navigation">
          <CatalogDropdown kind="products" locale={locale} surface="site" current={current === "products"} onNavigate={() => setIsOpen(false)} />
          <CatalogDropdown kind="materials" locale={locale} surface="site" current={current === "materials"} onNavigate={() => setIsOpen(false)} />
          <Link href={`${base}/capabilities`} aria-current={current === "custom" ? "page" : undefined} onClick={() => setIsOpen(false)}>Custom</Link>
          <Link href={`${base}/quality`} aria-current={current === "quality" ? "page" : undefined} onClick={() => setIsOpen(false)}>Quality</Link>
          <Link href={`${base}/resources`} aria-current={current === "resources" ? "page" : undefined} onClick={() => setIsOpen(false)}>Resources</Link>
          <Link href={`${base}/about`} aria-current={current === "about" ? "page" : undefined} onClick={() => setIsOpen(false)}>About</Link>
        </nav>
        <Link className={styles.headerCta} href={`${base}/request-a-quote`}>Request a Quote</Link>
      </div>
    </header>
  );
}
