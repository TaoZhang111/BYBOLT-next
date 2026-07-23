import type { ReactNode } from "react";

import type { Locale } from "@/i18n/config";

import { ProductFooter } from "./product-footer";
import { ProductHeader } from "./product-header";
import styles from "./product-site.module.css";

export function ProductSiteShell({ locale, children }: { locale: Locale; children: ReactNode }) {
  return (
    <main className={styles.productSite}>
      <ProductHeader locale={locale} />
      {children}
      <ProductFooter locale={locale} />
    </main>
  );
}
