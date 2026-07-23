"use client";

import { useState } from "react";

import Link from "@/components/navigation/static-link";
import type { Locale } from "@/i18n/config";

import styles from "./product-site.module.css";

export function ProductHeader({ locale }: { locale: Locale }) {
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
          <Link href={base} onClick={() => setIsOpen(false)}>Home</Link>
          <Link href={`${base}/products`} aria-current="page" onClick={() => setIsOpen(false)}>Products</Link>
          <Link href={`${base}/alloys`} onClick={() => setIsOpen(false)}>Materials</Link>
          <Link href={`${base}/contact`} onClick={() => setIsOpen(false)}>Contact</Link>
        </nav>
        <Link className={styles.headerCta} href={`${base}/request-a-quote`}>Request a Quote</Link>
      </div>
    </header>
  );
}
