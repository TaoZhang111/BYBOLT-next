/* eslint-disable @next/next/no-img-element */

import Link from "@/components/navigation/static-link";
import { ArrowUpRight, FileUp } from "lucide-react";

import { HomeHeader } from "@/components/home/home-header";
import { IndustryAccordion } from "@/components/home/industry-accordion";
import { MaterialSelector } from "@/components/home/material-selector";
import { ProductRangeGrid } from "@/components/home/product-range-grid";
import { RequirementRoutes } from "@/components/home/requirement-routes";
import { ScrollMedia } from "@/components/home/scroll-media";
import { SupplyProcess } from "@/components/home/supply-process";
import { qualityPoints, transitionItems } from "@/content/home-content";
import { fastenerCategories, localizeProductCategory, millProductCategories } from "@/content/product-catalog";
import type { Locale } from "@/i18n/config";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "BYBOLT",
  slogan: "built by bolt, made to endure",
  description: "Supplier of high-temperature alloy fasteners for industrial applications.",
};

export function HomePage({ locale }: { locale: Locale }) {
  const base = `/${locale}`;
  const fastenerProducts = fastenerCategories.map((category) => {
    const localizedCategory = localizeProductCategory(category, locale);
    return {
      href: `/products/${localizedCategory.slug}/`,
      image: localizedCategory.image,
      alt: localizedCategory.alt,
      name: localizedCategory.name,
      description: localizedCategory.summary,
    };
  });
  const millProducts = millProductCategories.map((category) => {
    const localizedCategory = localizeProductCategory(category, locale);
    return {
      href: `/products/${localizedCategory.slug}/`,
      image: localizedCategory.image,
      alt: localizedCategory.alt,
      name: localizedCategory.name,
      description: localizedCategory.summary,
    };
  });

  return (
    <div className="page-home">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      <HomeHeader locale={locale} />
      <main className="site-main">
        <section className="hero hero-editorial" aria-labelledby="hero-title">
          <div className="hero-media" aria-hidden="true">
            <img className="hero-poster" src="/assets/images/fastener-hero-poster.jpg" alt="" width="1672" height="941" fetchPriority="high" />
          </div>
          <div className="hero-overlay" aria-hidden="true" />
          <div className="container hero-content">
            <div className="hero-copy-block">
              <p className="eyebrow">HIGH-TEMPERATURE ALLOY FASTENERS</p>
              <h1 id="hero-title">High-Temperature Fasteners. Built to Endure.</h1>
              <p className="hero-copy">Bolts, studs, nuts, washers and custom components for heat, pressure and corrosion-critical equipment.</p>
              <div className="hero-actions">
                <Link className="button primary hero-primary-action" href={`${base}/request-a-quote`}>Request a Quote <ArrowUpRight aria-hidden="true" /></Link>
                <Link className="hero-secondary-action" href={`${base}/products`}>Explore Products <span aria-hidden="true">&rarr;</span></Link>
                <Link className="hero-secondary-action hero-quality-action" href={`${base}/quality`}>View Quality <span aria-hidden="true">&rarr;</span></Link>
              </div>
            </div>
          </div>
        </section>

        <div className="dark-light-transition" aria-hidden="true">
          <div className="container transition-rail">
            {transitionItems.slice(0, 3).map((item, index) => (
              <span key={item}><b>0{index + 1}</b>{item}</span>
            ))}
          </div>
        </div>

        <RequirementRoutes locale={locale} />

        <section className="section product-gallery-section product-gallery-primary light-chapter" id="products" aria-labelledby="products-title">
          <div className="container">
            <div className="section-heading split">
              <div>
                <p className="eyebrow dark">Fastener Categories</p>
                <h2 id="products-title">Product range1</h2>
              </div>
              <Link className="text-link product-view-link" href={`${base}/products`}>View products <ArrowUpRight aria-hidden="true" /></Link>
            </div>
            <ProductRangeGrid locale={locale} products={fastenerProducts} />
          </div>
        </section>

        {millProducts.length > 0 && (
          <section className="section product-gallery-section product-gallery-secondary light-chapter" id="round-bars" aria-labelledby="round-bars-title">
            <div className="container">
              <div className="section-heading split">
                <div>
                  <p className="eyebrow dark">High-Temperature Alloy Mill Products</p>
                  <h2 id="round-bars-title">Product range2</h2>
                </div>
                <Link className="text-link product-view-link" href={`${base}/products#mill-products`}>View products <ArrowUpRight aria-hidden="true" /></Link>
              </div>
              <ProductRangeGrid locale={locale} products={millProducts} ariaLabel="BYBOLT high-temperature alloy mill product categories" />
            </div>
          </section>
        )}

        <MaterialSelector locale={locale} />

        <section className="section industries-section light-chapter" id="industries" aria-labelledby="industries-title">
          <div className="container">
            <div className="section-heading split">
              <div><p className="eyebrow dark">Application fit</p><h2 id="industries-title">Relevant to critical industrial equipment.</h2></div>
              <p className="heading-note">Suitability is reviewed against the buyer&apos;s engineering specification and operating environment.</p>
            </div>
            <IndustryAccordion />
          </div>
        </section>

        <SupplyProcess locale={locale} />

        <section className="section certificate-section light-chapter" id="quality" aria-labelledby="quality-title">
          <div className="container certificate-grid">
            <div className="certificate-copy">
              <p className="eyebrow dark">Quality and traceability</p>
              <h2 id="quality-title">Evidence presented clearly.</h2>
              <p>Certificate and inspection requirements are agreed with the order. Available documentation can include material certification, dimensional records and specified test reports.</p>
              <ul className="plain-list">{qualityPoints.map((point) => <li key={point}>{point}</li>)}</ul>
            </div>
            <ScrollMedia className="certificate-media" src="/assets/certificates/alloy-fastener-quality-certificates.jpg" alt="Open alloy fastener quality certificates and material test reports" width={1536} height={1024} />
          </div>
        </section>

        <section className="section final-action light-chapter" id="rfq" aria-labelledby="rfq-title">
          <div className="container final-action-intro">
            <div className="final-action-copy">
              <p className="eyebrow dark">Ready for technical review</p>
              <h2 id="rfq-title">Put the requirement in front of an engineer.</h2>
              <p>Enter the standard and quantity or send the drawing directly. Both routes open the same technical RFQ workspace.</p>
            </div>
            <a className="final-action-email" href="mailto:sales@bybolt.com">sales@bybolt.com</a>
          </div>
          <div className="container final-action-links">
            <Link className="final-action-tile" href={`${base}/request-a-quote`}>
              <span>Start with specifications</span>
              <strong>Request a Quote</strong>
              <ArrowUpRight aria-hidden="true" />
            </Link>
            <Link className="final-action-tile final-action-tile-drawing" href={`${base}/request-a-quote`}>
              <span>Start with a technical file</span>
              <strong>Upload a Drawing</strong>
              <FileUp aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="site-footer light-footer">
        <div className="container footer-grid">
          <div><strong>BYBOLT</strong><p>High-temperature alloy fasteners for international industrial procurement.</p></div>
          <div><span>Products</span><Link href={`${base}/products`}>Product Range</Link><Link href={`${base}/products/bolts/hex-bolts/`}>Sample Product</Link></div>
          <div><span>Company</span><Link href={`${base}/quality`}>Quality</Link><Link href={`${base}/resources`}>Resources</Link><Link href={`${base}/about`}>About BYBOLT</Link></div>
          <div><span>Contact</span><Link href={`${base}/capabilities`}>Custom Supply</Link><Link href={`${base}/request-a-quote`}>Request a Quote</Link><a href="mailto:sales@bybolt.com">Email Sales</a></div>
        </div>
        <div className="container footer-bottom"><span>&copy; 2026 BYBOLT</span><span>built by bolt, made to endure</span></div>
      </footer>
    </div>
  );
}
