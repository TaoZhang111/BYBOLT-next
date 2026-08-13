/* eslint-disable @next/next/no-img-element */

import type { Metadata } from "next";

import Link from "@/components/navigation/static-link";
import { InformationSiteShell } from "@/components/marketing/information-site-shell";
import styles from "@/components/marketing/information-site.module.css";
import { localizeManufacturingProcess, manufacturingProcesses } from "@/content/product-catalog";
import { isLocale } from "@/i18n/config";
import { localizedAlternates } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: "Custom Alloy Fastener Process",
    description: "Review BYBOLT custom alloy fastener manufacturing stages from material verification through marking and packaging.",
    alternates: localizedAlternates(locale, "capabilities"),
  };
}

export default async function CapabilitiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  const processes = manufacturingProcesses.map((process) => localizeManufacturingProcess(process, locale));
  const base = `/${locale}`;

  return (
    <InformationSiteShell locale={locale} current="custom">
      <section className={`${styles.hero} ${styles.customHero}`}>
        <div className={`${styles.container} ${styles.customHeroGrid}`}>
          <h1>Custom Process</h1>
          <p className={styles.heroCopy}>A controlled route from verified alloy stock to inspected, documented and shipment-ready custom fasteners.</p>
        </div>
      </section>

      <section className={`${styles.section} ${styles.processOverview}`} aria-labelledby="custom-process-title">
        <div className={styles.container}>
          <div className={styles.sectionHeading}>
            <div><p className={styles.kicker}>Manufacturing process</p><h2 id="custom-process-title">Controlled stages, one traceable route.</h2></div>
            <p>Select a stage to review its purpose, control point and detailed manufacturing description.</p>
          </div>

          <figure className={styles.processFigure}>
            <img src="/assets/manufacturing-process-white.png" alt="BYBOLT manufacturing sequence from material verification through marking and packaging" width="1672" height="941" loading="eager" decoding="async" />
            <div className={styles.processHotspots} aria-label="Manufacturing process stages">
              {processes.map((process) => <Link href={`${base}/capabilities/${process.slug}/`} aria-label={`View ${process.number} ${process.title}`} key={process.slug}><span>{process.number} {process.title}</span></Link>)}
            </div>
          </figure>

          <nav className={styles.processDirectory} aria-label="Custom manufacturing process directory">
            {processes.map((process) => (
              <Link href={`${base}/capabilities/${process.slug}/`} key={process.slug}><span>{process.number}</span><strong>{process.title}</strong></Link>
            ))}
          </nav>
          {processes.length === 0 && <p className={styles.emptyCatalog}>No manufacturing processes are currently published.</p>}
        </div>
      </section>

      <section className={styles.ctaBand}>
        <div className={`${styles.container} ${styles.ctaInner}`}><h2>Put your drawing in front of the technical team.</h2><Link className={styles.ctaButton} href={`${base}/request-a-quote`}>Start Custom RFQ</Link></div>
      </section>
    </InformationSiteShell>
  );
}
