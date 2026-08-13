/* eslint-disable @next/next/no-img-element */

import type { Metadata } from "next";

import { InformationSiteShell } from "@/components/marketing/information-site-shell";
import styles from "@/components/marketing/information-site.module.css";
import { localizeQualityCertificate, qualityCertificates } from "@/content/product-catalog";
import { isLocale } from "@/i18n/config";
import { localizedAlternates } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: "Quality Documentation and Certificates",
    description: "Review BYBOLT material traceability, inspection records and available quality certificates.",
    alternates: localizedAlternates(locale, "quality"),
  };
}

export default async function QualityPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  const certificates = qualityCertificates.map((certificate) => localizeQualityCertificate(certificate, locale));

  return (
    <InformationSiteShell locale={locale} current="quality">
      <section className={styles.hero}>
        <div className={`${styles.container} ${styles.heroGrid}`}>
          <div><p className={styles.kicker}>Quality and traceability</p><h1>Control from verified material to final records.</h1></div>
          <p className={styles.heroCopy}>Material identity, inspection scope and the documentation confirmed for the order remain connected throughout production.</p>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="quality-files-title">
        <div className={styles.container}>
          <div className={styles.sectionHeading}>
            <div><p className={styles.kicker}>Certificates and records</p><h2 id="quality-files-title">A clear file set for each requirement.</h2></div>
            <p>Availability depends on material source, product standard, testing scope and what is confirmed before production. Select a certificate to inspect the available image.</p>
          </div>
          <div className={styles.credentialGrid}>
            {certificates.map((certificate, index) => (
              <a className={styles.credentialCard} href={certificate.image} target="_blank" rel="noreferrer" key={certificate.id} aria-label={`Open ${certificate.title}`}>
                <div className={styles.credentialMedia}>
                  <img src={certificate.image} alt={certificate.alt} style={{ objectPosition: certificate.imagePosition ?? "50% 50%" }} loading="lazy" decoding="async" />
                </div>
                <div className={styles.credentialCopy}><span>{String(index + 1).padStart(2, "0")}</span><h3>{certificate.title}</h3><p>{certificate.description}</p><small>Open certificate</small></div>
              </a>
            ))}
          </div>
          {certificates.length === 0 && <p className={styles.emptyCatalog}>No certificates are currently published.</p>}
          <p className={styles.notice}>Images illustrate the current document library. Actual certificates and reports are supplied according to the agreed order scope.</p>
        </div>
      </section>
    </InformationSiteShell>
  );
}
