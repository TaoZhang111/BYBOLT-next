import type { Metadata } from "next";

import Link from "@/components/navigation/static-link";
import { InformationSiteShell } from "@/components/marketing/information-site-shell";
import styles from "@/components/marketing/information-site.module.css";
import { isLocale } from "@/i18n/config";
import { localizedAlternates } from "@/lib/seo";

const customSteps = [
  ["01", "Application Input", "Share the service conditions, mating assembly, quantity and governing specification."],
  ["02", "Drawing Review", "Review geometry, dimensions, tolerances, thread form and drawing revision."],
  ["03", "Material Definition", "Confirm alloy grade, material condition, source requirements and traceability scope."],
  ["04", "Process Planning", "Select machining, threading, heat treatment and finishing routes suited to the part."],
  ["05", "Production and QC", "Coordinate manufacturing with dimensional inspection and specified testing."],
  ["06", "Documentation and Delivery", "Prepare agreed records, protective packing, labels and export documentation."],
] as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: "Custom Alloy Fastener Process",
    description: "See the key steps for drawing-based custom alloy fastener review, production, inspection and delivery.",
    alternates: localizedAlternates(locale, "capabilities"),
  };
}

export default async function CapabilitiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  const base = `/${locale}`;

  return (
    <InformationSiteShell locale={locale} current="custom">
      <section className={styles.hero}>
        <div className={`${styles.container} ${styles.heroGrid}`}>
          <div><p className={styles.kicker}>Drawing-based supply</p><h1>Custom begins with a controlled requirement.</h1></div>
          <p className={styles.heroCopy}>A custom fastener is reviewed as a complete technical requirement: geometry, alloy, service condition, inspection, documentation and delivery.</p>
        </div>
      </section>
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeading}>
            <div><p className={styles.kicker}>Key stages</p><h2>From drawing input to documented delivery.</h2></div>
            <p>Each stage resolves a specific technical or supply question before the next commitment is made.</p>
          </div>
          <div className={styles.stepGrid}>
            {customSteps.map(([number, title, description]) => (
              <article className={styles.stepCard} key={number}><span>{number}</span><h2>{title}</h2><p>{description}</p></article>
            ))}
          </div>
        </div>
      </section>
      <section className={styles.ctaBand}>
        <div className={`${styles.container} ${styles.ctaInner}`}><h2>Put your drawing in front of the technical team.</h2><Link className={styles.ctaButton} href={`${base}/request-a-quote`}>Start Custom RFQ</Link></div>
      </section>
    </InformationSiteShell>
  );
}
