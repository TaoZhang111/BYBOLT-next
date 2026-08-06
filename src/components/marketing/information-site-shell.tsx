import type { ReactNode } from "react";

import Link from "@/components/navigation/static-link";
import { ProductHeader } from "@/components/products/product-header";
import type { Locale } from "@/i18n/config";

import styles from "./information-site.module.css";

type InformationSection = "custom" | "quality" | "resources" | "about";

export function InformationSiteShell({
  locale,
  current,
  children,
}: {
  locale: Locale;
  current: InformationSection;
  children: ReactNode;
}) {
  const base = `/${locale}`;

  return (
    <main className={styles.informationSite}>
      <ProductHeader locale={locale} current={current} />
      {children}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <Link className={styles.footerBrand} href={base}><span>BY</span>BOLT</Link>
          <p>High-temperature alloy fasteners, round bar and drawing-based supply.</p>
          <nav aria-label="Information footer navigation">
            <Link href={`${base}/products`}>Products</Link>
            <Link href={`${base}/quality`}>Quality</Link>
            <Link href={`${base}/resources`}>Resources</Link>
            <Link href={`${base}/request-a-quote`}>RFQ</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
