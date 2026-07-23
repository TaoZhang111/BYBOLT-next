/* eslint-disable @next/next/no-img-element */

import Link from "@/components/navigation/static-link";
import type { Metadata } from "next";

import { ProductSiteShell } from "@/components/products/product-site-shell";
import styles from "@/components/products/product-site.module.css";
import { localizeProductCategory, productCategories } from "@/content/product-catalog";
import { isLocale } from "@/i18n/config";
import { localizedAlternates } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: "High-Temperature Alloy Fasteners",
    description: "Browse BYBOLT bolts, nuts, studs, washers, screws and custom high-temperature alloy fasteners.",
    alternates: localizedAlternates(locale, "products"),
  };
}

export default async function ProductsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  const base = `/${locale}`;
  const categories = productCategories.map((category) => localizeProductCategory(category, locale));

  return (
    <ProductSiteShell locale={locale}>
      <section className={styles.intro}>
        <div className={`${styles.container} ${styles.introInner}`}>
          <p className={styles.kicker}>Product Overview</p>
          <h1>Fastener Categories</h1>
          <p className={styles.introCopy}>Six entry points keep the product architecture clear. Each category opens into a dedicated page where individual models are displayed in large half-screen modules.</p>
        </div>
      </section>
      <section className={styles.categorySection}>
        <div className={styles.container}>
          <div className={styles.categoryGrid} aria-label="BYBOLT fastener categories">
            {categories.map((category) => (
              <Link className={styles.categoryCard} href={`${base}/products/${category.slug}`} key={category.slug}>
                <span className={styles.categoryMedia} aria-hidden="true">
                  <img src={category.image} alt="" loading="eager" decoding="async" />
                </span>
                <div>
                  <span className={styles.categoryIndex}>{category.index}</span>
                  <h2>{category.name}</h2>
                  <p>{category.summary}</p>
                  <span className={styles.categoryLink}>View {category.name.toLowerCase()} range <b aria-hidden="true">&rarr;</b></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className={styles.actionSection}>
        <div className={`${styles.container} ${styles.actionInner}`}>
          <h2>Have a drawing or special requirement?</h2>
          <Link className={styles.primaryButton} href={`${base}/request-a-quote`}>Upload RFQ Details</Link>
        </div>
      </section>
    </ProductSiteShell>
  );
}
