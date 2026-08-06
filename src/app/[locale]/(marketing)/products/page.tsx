/* eslint-disable @next/next/no-img-element */

import Link from "@/components/navigation/static-link";
import type { Metadata } from "next";

import { ProductSiteShell } from "@/components/products/product-site-shell";
import styles from "@/components/products/product-site.module.css";
import { fastenerCategories, localizeProductCategory, roundBarCategory } from "@/content/product-catalog";
import { isLocale } from "@/i18n/config";
import { localizedAlternates } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: "High-Temperature Alloy Fasteners",
    description: "Browse BYBOLT bolts, nuts, studs, washers, screws, custom fasteners and high-temperature alloy round bars.",
    alternates: localizedAlternates(locale, "products"),
  };
}

export default async function ProductsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  const base = `/${locale}`;
  const categories = fastenerCategories.map((category) => localizeProductCategory(category, locale));
  const bars = roundBarCategory ? localizeProductCategory(roundBarCategory, locale) : undefined;

  return (
    <ProductSiteShell locale={locale}>
      <section className={styles.intro}>
        <div className={`${styles.container} ${styles.introInner}`}>
          <p className={styles.kicker}>Product Overview</p>
          <h1>Fastener Categories</h1>
          <p className={styles.introCopy}>Fastener forms and alloy bar stock are separated into two clear ranges. Every entry opens a dedicated technical product route.</p>
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
      {bars && (
        <section className={`${styles.categorySection} ${styles.secondaryCategorySection}`} id="alloy-round-bars">
          <div className={styles.container}>
            <div className={styles.rangeHeader}>
              <div>
                <p className={styles.kicker}>Product range2</p>
                <h2>High-Temperature Alloy Round Bars</h2>
              </div>
              <Link href={`${base}/products/${bars.slug}`}>View all round bars <b aria-hidden="true">&rarr;</b></Link>
            </div>
            <div className={styles.categoryGrid} aria-label="BYBOLT alloy round bar products">
              {bars.models.map((model, index) => (
                <Link className={styles.categoryCard} href={`${base}/products/${bars.slug}/${model.slug}`} key={model.slug}>
                  <span className={styles.categoryMedia} aria-hidden="true">
                    <img src={model.image || bars.image} alt="" loading="eager" decoding="async" />
                  </span>
                  <div>
                    <span className={styles.categoryIndex}>{String(index + 1).padStart(2, "0")}</span>
                    <h2>{model.name}</h2>
                    <p>{model.description}</p>
                    <span className={styles.categoryLink}>View product details <b aria-hidden="true">&rarr;</b></span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
      <section className={styles.actionSection}>
        <div className={`${styles.container} ${styles.actionInner}`}>
          <h2>Have a drawing or special requirement?</h2>
          <Link className={styles.primaryButton} href={`${base}/request-a-quote`}>Upload RFQ Details</Link>
        </div>
      </section>
    </ProductSiteShell>
  );
}
