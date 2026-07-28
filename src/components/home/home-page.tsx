/* eslint-disable @next/next/no-img-element */

import Link from "@/components/navigation/static-link";
import { ArrowUpRight, FileUp } from "lucide-react";

import { HomeHeader } from "@/components/home/home-header";
import { IndustryAccordion } from "@/components/home/industry-accordion";
import { ScrollMedia } from "@/components/home/scroll-media";
import { SupplyProcess } from "@/components/home/supply-process";
import { capabilities, homeProducts, qualityPoints, transitionItems } from "@/content/home-content";
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

        <section className="section story-section light-chapter" id="story" aria-labelledby="story-title">
          <div className="container story-grid">
            <div className="story-copy">
              <p className="eyebrow dark">The BYBOLT approach</p>
              <h2 id="story-title">built by bolt, <em>made to endure</em></h2>
              <p className="story-lead">BYBOLT is being shaped around a simple principle: critical assemblies deserve fasteners that are clearly specified, carefully reviewed and supplied with the documentation the order requires.</p>
              <p>From alloy selection to drawing review and export preparation, every conversation begins with the real operating condition rather than a generic catalogue assumption.</p>
              <a className="text-link" href="#capabilities">How we support a requirement <span aria-hidden="true">&rarr;</span></a>
            </div>
            <ScrollMedia className="story-media" src="/assets/hero-fasteners.jpg" alt="Nickel-alloy fasteners arranged in a precision manufacturing environment" width={1774} height={887} />
          </div>
        </section>

        <section className="section product-gallery-section light-chapter" id="products" aria-labelledby="products-title">
          <div className="container">
            <div className="section-heading split">
              <div>
                <p className="eyebrow dark">Engineered fasteners</p>
                <h2 id="products-title">Product range</h2>
              </div>
              <Link className="text-link product-view-link" href={`${base}/products`}>View products <ArrowUpRight aria-hidden="true" /></Link>
            </div>
            <div className="product-image-grid" aria-label="BYBOLT fastener categories">
              {homeProducts.map((product) => (
                <Link className={`image-product-card${product.wide ? " image-product-card-wide" : ""}`} href={`${base}${product.href}`} key={product.name}>
                  <img src={product.image} alt={product.alt} width="1536" height="1024" loading="lazy" decoding="async" />
                  <div>
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                    <b aria-hidden="true"><ArrowUpRight /></b>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section capability-light light-chapter" id="capabilities" aria-labelledby="capabilities-title">
          <div className="container capability-light-grid">
            <div className="capability-light-copy">
              <p className="eyebrow dark">Custom and supply capability</p>
              <h2 id="capabilities-title">Quote what the assembly actually needs.</h2>
              <p>Material condition, geometry, thread, inspection and order quantity are reviewed together before the proposed supply route is confirmed.</p>
              <Link className="button dark-button" href={`${base}/request-a-quote`}>Upload your requirement</Link>
            </div>
            <div className="capability-rows">
              {capabilities.map(([label, title, description]) => (
                <article key={label}><span>{label}</span><h3>{title}</h3><p>{description}</p></article>
              ))}
            </div>
          </div>
        </section>

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

        <section className="section industries-section light-chapter" id="industries" aria-labelledby="industries-title">
          <div className="container">
            <div className="section-heading split">
              <div><p className="eyebrow dark">Application fit</p><h2 id="industries-title">Relevant to critical industrial equipment.</h2></div>
              <p className="heading-note">Suitability is reviewed against the buyer&apos;s engineering specification and operating environment.</p>
            </div>
            <IndustryAccordion locale={locale} />
          </div>
        </section>

        <SupplyProcess />

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
          <div><span>Materials</span><Link href={`${base}/alloys`}>Material Range</Link><Link href={`${base}/alloys/inconel-625`}>Inconel 625</Link></div>
          <div><span>Contact</span><Link href={`${base}/request-a-quote`}>Request a Quote</Link><a href="mailto:sales@bybolt.com">Email Sales</a></div>
        </div>
        <div className="container footer-bottom"><span>&copy; 2026 BYBOLT</span><span>built by bolt, made to endure</span></div>
      </footer>
    </div>
  );
}
