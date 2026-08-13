/* eslint-disable @next/next/no-img-element */

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Link from "@/components/navigation/static-link";
import { InformationSiteShell } from "@/components/marketing/information-site-shell";
import styles from "@/components/marketing/information-site.module.css";
import { localizeManufacturingProcess, manufacturingProcesses } from "@/content/product-catalog";
import { isLocale } from "@/i18n/config";
import { localizedAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: string; process: string }> };

export function generateStaticParams() {
  return manufacturingProcesses.map((process) => ({ process: process.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, process: processSlug } = await params;
  const source = manufacturingProcesses.find((process) => process.slug === processSlug);
  if (!isLocale(locale) || !source) return {};
  const process = localizeManufacturingProcess(source, locale);
  return {
    title: process.seoTitle || `${process.title} | Custom Process`,
    description: process.seoDescription || process.summary,
    alternates: localizedAlternates(locale, `capabilities/${process.slug}`),
    openGraph: { images: [{ url: process.image, alt: process.imageAlt }] },
  };
}

export default async function ProcessDetailPage({ params }: Props) {
  const { locale, process: processSlug } = await params;
  const source = manufacturingProcesses.find((process) => process.slug === processSlug);
  if (!isLocale(locale) || !source) notFound();
  const process = localizeManufacturingProcess(source, locale);
  const base = `/${locale}`;

  return (
    <InformationSiteShell locale={locale} current="custom">
      <section className={`${styles.hero} ${styles.processDetailHero}`}>
        <div className={styles.container}>
          <p className={styles.processBreadcrumb}>Custom Process / {process.number}</p>
          <h1>{process.title}</h1>
          <p className={styles.processLead}>{process.summary}</p>
        </div>
      </section>
      <section className={`${styles.section} ${styles.processDetailSection}`}>
        <div className={`${styles.container} ${styles.processDetailGrid}`}>
          <figure className={styles.processDetailMedia}>
            <img src={process.image} alt={process.imageAlt} style={{ objectPosition: process.imagePosition ?? "50% 50%" }} decoding="async" />
          </figure>
          <div className={styles.processDetailCopy}>
            <p className={styles.kicker}>{process.number} Manufacturing stage</p>
            <h2>Process overview</h2>
            {process.description.split(/\n\s*\n/).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            <div className={styles.controlPanel}><span>Control point</span><p>{process.control}</p></div>
            <div className={styles.processDetailActions}>
              <Link className={styles.ctaButton} href={`${base}/request-a-quote`}>Start Custom RFQ</Link>
              <Link className={styles.textLink} href={`${base}/capabilities/`}>Back to Custom Process</Link>
            </div>
          </div>
        </div>
      </section>
    </InformationSiteShell>
  );
}
