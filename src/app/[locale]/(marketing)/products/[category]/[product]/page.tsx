/* eslint-disable @next/next/no-img-element */

import Link from "@/components/navigation/static-link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HomeHeader } from "@/components/home/home-header";
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
    <main className="site-main">
      <HomeHeader locale={locale} solid />
      <section className="quote-hero">
        <div className="container quote-hero-grid">
          <div>
            <p className="eyebrow">{category.name}</p>
            <h1>{product.name}</h1>
            <p>{product.description}</p>
          </div>
          <div className="response-promise"><span>Supply mode</span><strong>{product.eyebrow}</strong></div>
        </div>
      </section>
      <section className="section technical-specs light-chapter">
        <div className="container certificate-grid">
          <figure className="certificate-media reveal-media"><img src={category.image} alt={category.alt} /></figure>
          <div className="certificate-copy">
            <p className="eyebrow dark">Technical specification</p>
            <h2>Data prepared for RFQ and CMS workflows.</h2>
            <dl className="quote-guide">
              {specs.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
            </dl>
            <Link className="button dark-button" href={`${base}/request-a-quote?product=${encodeURIComponent(product.name)}`}>Request this product</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
