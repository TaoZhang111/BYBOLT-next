/* eslint-disable @next/next/no-img-element */

import Link from "@/components/navigation/static-link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductReveal } from "@/components/products/product-reveal";
import { ProductSiteShell } from "@/components/products/product-site-shell";
import styles from "@/components/products/product-site.module.css";
import { localizeProductCategory, productCategories, sharedProductProperties } from "@/content/product-catalog";
import { isLocale } from "@/i18n/config";
import { localizedAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: string; category: string }> };

export function generateStaticParams() {
  return productCategories.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, category: categorySlug } = await params;
  const sourceCategory = productCategories.find((item) => item.slug === categorySlug);
  const category = sourceCategory && isLocale(locale) ? localizeProductCategory(sourceCategory, locale) : sourceCategory;
  if (!isLocale(locale) || !category) return {};
  return {
    title: `${category.name} for Critical Service`,
    description: category.summary,
    alternates: localizedAlternates(locale, `products/${category.slug}`),
  };
}

export default async function ProductCategoryPage({ params }: Props) {
  const { locale, category: categorySlug } = await params;
  const sourceCategory = productCategories.find((item) => item.slug === categorySlug);
  const category = sourceCategory && isLocale(locale) ? localizeProductCategory(sourceCategory, locale) : sourceCategory;

  if (!isLocale(locale) || !category) {
    notFound();
  }
  const base = `/${locale}`;
  const singularCategory = category.name === "Custom Products" ? "Custom Product" : category.name.replace(/s$/, "");

  return (
    <ProductSiteShell locale={locale}>
      <section className={styles.intro}>
        <div className={`${styles.container} ${styles.introInner}`}>
          <p className={styles.breadcrumb}>Products / {category.name}</p>
          <h1>All {singularCategory} Types on One Page</h1>
          <p className={styles.introCopy}>{category.intro}</p>
        </div>
      </section>
      <section>
        <div className={`${styles.container} ${styles.modelList}`}>
            {category.models.map((model) => (
              <ProductReveal className={styles.modelModule} key={model.slug}>
                <figure className={styles.modelMedia}>
                  <img data-reveal-image src={model.image || category.image} alt={model.alt || `${model.name} - ${category.alt}`} loading="lazy" decoding="async" />
                </figure>
                <dl className={styles.specRail}>
                  <div><dt>Standard</dt><dd>{model.standard}</dd></div>
                  <div><dt>Configuration</dt><dd>{model.configuration}</dd></div>
                  <div><dt>Materials</dt><dd>{sharedProductProperties.materials}</dd></div>
                  <div><dt>Testing</dt><dd>{sharedProductProperties.inspection}</dd></div>
                </dl>
                <div className={styles.modelCopy} data-reveal-copy>
                  <p className={styles.modelEyebrow}>{model.eyebrow}</p>
                  <h2><Link href={`${base}/products/${category.slug}/${model.slug}`}>{model.name}</Link></h2>
                  <p>{model.description}</p>
                  <Link className={styles.modelLink} href={`${base}/products/${category.slug}/${model.slug}`}>View product details <b aria-hidden="true">&rarr;</b></Link>
                </div>
              </ProductReveal>
            ))}
        </div>
      </section>
      <section className={styles.actionSection}>
        <div className={`${styles.container} ${styles.actionInner}`}>
          <h2>Have a drawing or special requirement?</h2>
          <Link className={styles.primaryButton} href={`${base}/request-a-quote?product=${encodeURIComponent(category.name)}`}>Upload RFQ Details</Link>
        </div>
      </section>
    </ProductSiteShell>
  );
}
