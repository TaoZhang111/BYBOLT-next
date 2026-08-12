/* eslint-disable @next/next/no-img-element */

import type { Metadata } from "next";

import Link from "@/components/navigation/static-link";
import { InformationSiteShell } from "@/components/marketing/information-site-shell";
import styles from "@/components/marketing/information-site.module.css";
import { localizeQualityCertificate, qualityCertificates } from "@/content/product-catalog";
import { manufacturingStages } from "@/content/quality-process";
import { isLocale } from "@/i18n/config";
import { localizedAlternates } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: "Quality Process, Documentation and Certificates",
    description: "Review BYBOLT manufacturing controls, material traceability, inspection records and available quality certificates.",
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
          <p className={styles.heroCopy}>Each stage connects manufacturing activity with material identity, inspection scope and the documentation confirmed for the order.</p>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionWhite}`} aria-labelledby="quality-process-title">
        <div className={styles.container}>
          <div className={styles.sectionHeading}>
            <div><p className={styles.kicker}>Manufacturing process</p><h2 id="quality-process-title">Eight controlled stages, one traceable route.</h2></div>
            <p>Select any stage in the process image or directory to review its role in the production and quality sequence.</p>
          </div>

          <figure className={styles.processFigure}>
            <img src="/assets/manufacturing-process-white.png" alt="Eight-stage BYBOLT manufacturing sequence from material verification through marking and packaging" width="1672" height="941" loading="eager" decoding="async" />
            <div className={styles.processHotspots} aria-label="Manufacturing process stages">
              {manufacturingStages.map((stage) => <Link href={`#process-${stage.id}`} aria-label={`View ${stage.number} ${stage.title}`} key={stage.id}><span>{stage.number} {stage.title}</span></Link>)}
            </div>
          </figure>

          <nav className={styles.processDirectory} aria-label="Quality process directory">
            {manufacturingStages.map((stage) => (
              <Link href={`#process-${stage.id}`} key={stage.id}><span>{stage.number}</span><strong>{stage.title}</strong></Link>
            ))}
          </nav>

          <div className={styles.processDetails}>
            {manufacturingStages.map((stage) => (
              <article className={styles.processStage} id={`process-${stage.id}`} key={stage.id}>
                <span>{stage.number}</span>
                <div><h2>{stage.title}</h2><p>{stage.summary}</p></div>
                <div><small>Control point</small><p>{stage.control}</p></div>
              </article>
            ))}
          </div>
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
