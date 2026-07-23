import Link from "@/components/navigation/static-link";
import type { Locale } from "@/i18n/config";

import styles from "./product-site.module.css";

export function ProductFooter({ locale }: { locale: Locale }) {
  const base = `/${locale}`;

  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <Link className={styles.footerBrand} href={base}><span>BY</span>BOLT</Link>
        <p>High-temperature alloy fasteners for critical industrial service.</p>
        <nav aria-label="Product footer navigation">
          <Link href={`${base}/products`}>Products</Link>
          <Link href={`${base}/alloys`}>Materials</Link>
          <Link href={`${base}/request-a-quote`}>RFQ</Link>
        </nav>
      </div>
    </footer>
  );
}
