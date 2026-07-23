/* eslint-disable @next/next/no-img-element */

import Link from "@/components/navigation/static-link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductReveal } from "@/components/products/product-reveal";
import { ProductSiteShell } from "@/components/products/product-site-shell";
import styles from "@/components/products/product-site.module.css";
import { productCategories, sharedProductProperties } from "@/content/product-catalog";
import { isLocale } from "@/i18n/config";
import { localizedAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: string; category: string; product: string }> };

export function generateStaticParams() {
  return productCategories.flatMap((category) =>
    category.models.map((product) => ({ category: category.slug, product: product.slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, category: categorySlug, product: productSlug } = await params;
  const category = productCategories.find((item) => item.slug === categorySlug);
  const product = category?.models.find((item) => item.slug === productSlug);
  if (!isLocale(locale) || !category || !product) return {};
  return {
    title: product.name,
    description: product.description,
    alternates: localizedAlternates(locale, `products/${category.slug}/${product.slug}`),
    openGraph: { images: [{ url: category.image, alt: category.alt }] },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { locale, category: categorySlug, product: productSlug } = await params;
  const category = productCategories.find((item) => item.slug === categorySlug);
  const product = category?.models.find((item) => item.slug === productSlug);

  if (!isLocale(locale) || !category || !product) {
    notFound();
  }
  const base = `/${locale}`;

  const specs = [
    ["Size range", product.size],
    ["Length / thickness", product.length],
    ["Standard", product.standard],
    ["Configuration", product.configuration],
    ["Threads", product.threads],
    ["Materials", sharedProductProperties.materials],
    ["Inspection", sharedProductProperties.inspection],
    ["Documentation", sharedProductProperties.documentation],
  ];

  return (
    <ProductSiteShell locale={locale}>
      <section className={styles.intro}>
        <div className={`${styles.container} ${styles.introInner}`}>
          <p className={styles.breadcrumb}>Products / {category.name} / {product.name}</p>
          <h1>{product.name}</h1>
          <p className={styles.introCopy}>{product.description}</p>
        </div>
      </section>
      <section className={styles.detailSection}>
        <div className={styles.container}>
          <ProductReveal className={styles.detailGrid}>
            <figure className={styles.detailMedia}>
              <img data-reveal-image src={category.image} alt={`${product.name} - ${category.alt}`} decoding="async" />
            </figure>
            <div className={styles.detailPanel} data-reveal-copy>
              <p className={styles.modelEyebrow}>{product.eyebrow}</p>
              <h2>Technical specification</h2>
              <dl className={styles.detailSpecs}>
              {specs.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
              </dl>
              <div className={styles.detailActions}>
                <Link className={styles.primaryButton} href={`${base}/request-a-quote?product=${encodeURIComponent(product.name)}`}>Request this product</Link>
                <Link className={styles.outlineButton} href={`${base}/products/${category.slug}`}>Back to {category.name}</Link>
              </div>
            </div>
          </ProductReveal>
        </div>
      </section>
      <section className={styles.actionSection}>
        <div className={`${styles.container} ${styles.actionInner}`}>
          <h2>Send the drawing. We will review the route.</h2>
          <Link className={styles.primaryButton} href={`${base}/request-a-quote?product=${encodeURIComponent(product.name)}`}>Upload RFQ Details</Link>
        </div>
      </section>
    </ProductSiteShell>
  );
}
