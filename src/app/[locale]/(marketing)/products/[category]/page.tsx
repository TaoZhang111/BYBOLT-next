/* eslint-disable @next/next/no-img-element */

import Link from "@/components/navigation/static-link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HomeHeader } from "@/components/home/home-header";
import { productCategories, sharedProductProperties } from "@/content/product-catalog";
import { isLocale } from "@/i18n/config";
import { localizedAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: string; category: string }> };

export function generateStaticParams() {
  return productCategories.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, category: categorySlug } = await params;
  const category = productCategories.find((item) => item.slug === categorySlug);
  if (!isLocale(locale) || !category) return {};
  return {
    title: `${category.name} for Critical Service`,
    description: category.summary,
    alternates: localizedAlternates(locale, `products/${category.slug}`),
  };
}

export default async function ProductCategoryPage({ params }: Props) {
  const { locale, category: categorySlug } = await params;
  const category = productCategories.find((item) => item.slug === categorySlug);

  if (!isLocale(locale) || !category) {
    notFound();
  }
  const base = `/${locale}`;

  return (
    <main className="site-main">
      <HomeHeader locale={locale} solid />
      <section className="quote-hero">
        <div className="container quote-hero-grid">
          <div>
            <p className="eyebrow">{category.name}</p>
            <h1>{category.name} for critical service.</h1>
            <p>{category.intro}</p>
          </div>
          <div className="response-promise"><span>Category</span><strong>{category.models.length} product types</strong></div>
        </div>
      </section>
      <section className="section product-gallery-section light-chapter">
        <div className="container product-layout">
          <figure className="product-photo"><img src={category.image} alt={category.alt} /></figure>
          <div className="product-cards">
            {category.models.map((model) => (
              <Link className="product-card" href={`${base}/products/${category.slug}/${model.slug}`} key={model.slug}>
                <span className="product-type">{model.eyebrow}</span>
                <h2>{model.name}</h2>
                <p>{model.description}</p>
                <span className="card-link">View details <b aria-hidden="true">&rarr;</b></span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="section certificate-section light-chapter">
        <div className="container">
          <div className="section-heading split"><h2>Shared supply properties.</h2><Link className="button dark-button" href={`${base}/request-a-quote`}>Request this category</Link></div>
          <div className="capability-rows">
            {Object.entries(sharedProductProperties).map(([label, value]) => <article key={label}><span>{label}</span><h3>{value}</h3></article>)}
          </div>
        </div>
      </section>
    </main>
  );
}
