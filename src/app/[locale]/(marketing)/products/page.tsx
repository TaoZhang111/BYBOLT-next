/* eslint-disable @next/next/no-img-element */

import Link from "@/components/navigation/static-link";
import type { Metadata } from "next";

import { ProductSiteShell } from "@/components/products/product-site-shell";
import styles from "@/components/products/product-site.module.css";
import { fastenerCategories, localizeProductCategory, millProductCategories } from "@/content/product-catalog";
import { isLocale } from "@/i18n/config";
import { localizedAlternates } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: "High-Temperature Alloy Fasteners",
    description: "Browse BYBOLT fastener categories and high-temperature alloy round bar, plate, wire and strip mill products.",
    alternates: localizedAlternates(locale, "products"),
  };
}

export default async function ProductsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  const base = `/${locale}`;
  const categories = fastenerCategories.map((category) => localizeProductCategory(category, locale));
  const millProducts = millProductCategories.map((category) => localizeProductCategory(category, locale));

  return (
    <ProductSiteShell locale={locale}>
      <section className={styles.intro}>
        <div className={`${styles.container} ${styles.introInner}`}>
          <p className={styles.kicker}>Product Overview</p>
          <h1>Fastener Categories</h1>
          <p className={styles.introCopy}>Fastener categories and high-temperature alloy mill products are separated into two clear ranges. Every entry opens a dedicated technical product route.</p>
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
      {millProducts.length > 0 && (
        <section className={`${styles.categorySection} ${styles.secondaryCategorySection}`} id="mill-products">
          <div className={styles.container}>
            <div className={styles.rangeHeader}>
              <div>
                <p className={styles.kicker}>Product range2</p>
                <h2>High-Temperature Alloy Mill Products</h2>
              </div>
              <Link href={`${base}/request-a-quote`}>Request mill products <b aria-hidden="true">&rarr;</b></Link>
            </div>
            <div className={styles.categoryGrid} aria-label="BYBOLT high-temperature alloy mill product categories">
              {millProducts.map((category) => (
                <Link className={styles.categoryCard} href={`${base}/products/${category.slug}`} key={category.slug}>
                  <span className={styles.categoryMedia} aria-hidden="true">
                    <img src={category.image} alt="" loading="eager" decoding="async" />
                  </span>
                  <div>
                    <span className={styles.categoryIndex}>{category.index}</span>
                    <h2>{category.name}</h2>
                    <p>{category.summary}</p>
                    <span className={styles.categoryLink}>View {category.name.toLowerCase()} products <b aria-hidden="true">&rarr;</b></span>
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
