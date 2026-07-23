/* eslint-disable @next/next/no-img-element */

import Link from "@/components/navigation/static-link";
import type { Metadata } from "next";

import { HomeHeader } from "@/components/home/home-header";
import { productCategories } from "@/content/product-catalog";
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

  return (
    <main className="site-main page-products">
      <HomeHeader locale={locale} solid />
      <section className="section product-gallery-section light-chapter">
        <div className="container">
          <div className="section-heading split">
            <div>
              <p className="eyebrow dark">Product range</p>
              <h1>High-temperature alloy fasteners by category.</h1>
            </div>
            <Link className="button dark-button" href={`${base}/request-a-quote`}>
              Request a Quote
            </Link>
          </div>
          <div className="product-image-grid" aria-label="BYBOLT fastener categories">
            {productCategories.map((category) => (
              <Link className="image-product-card" href={`${base}/products/${category.slug}`} key={category.slug}>
                <img src={category.image} alt={category.alt} loading="lazy" decoding="async" />
                <div>
                  <span>{category.index}</span>
                  <h2>{category.name}</h2>
                  <p>{category.summary}</p>
                  <b aria-hidden="true">&rarr;</b>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
