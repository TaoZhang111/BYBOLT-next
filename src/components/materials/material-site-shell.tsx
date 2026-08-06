import type { ReactNode } from "react";

import Link from "@/components/navigation/static-link";
import { ProductHeader } from "@/components/products/product-header";
import type { Locale } from "@/i18n/config";

import styles from "./material-site.module.css";

export function MaterialSiteShell({ locale, children }: { locale: Locale; children: ReactNode }) {
  const base = `/${locale}`;

  return (
    <main className={styles.materialSite}>
      <ProductHeader locale={locale} current="materials" />
      {children}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <Link className={styles.footerBrand} href={base}><span>BY</span>BOLT</Link>
          <p>High-temperature alloy fasteners and round bar for critical service.</p>
          <nav aria-label="Material footer navigation">
            <Link href={`${base}/products`}>Products</Link>
            <Link href={`${base}/request-a-quote`}>Request a Quote</Link>
            <Link href={`${base}/contact`}>Contact</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
