/* eslint-disable @next/next/no-img-element */

import type { Metadata } from "next";

import { InformationSiteShell } from "@/components/marketing/information-site-shell";
import styles from "@/components/marketing/information-site.module.css";
import { isLocale } from "@/i18n/config";
import { localizedAlternates } from "@/lib/seo";

const credentials = [
  ["01", "Material Test Certificates", "cropOne"],
  ["02", "Chemical Analysis Records", "cropTwo"],
  ["03", "Mechanical Test Reports", "cropThree"],
  ["04", "Dimensional Inspection Records", "cropFour"],
  ["05", "PMI and Hardness Records", "cropFive"],
  ["06", "Third-Party Inspection Files", "cropSix"],
] as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: "Quality Documentation and Certificates",
    description: "Review the quality documentation, material traceability and inspection records available for BYBOLT alloy fastener orders.",
    alternates: localizedAlternates(locale, "quality"),
  };
}

export default async function QualityPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;

  return (
    <InformationSiteShell locale={locale} current="quality">
      <section className={styles.hero}>
        <div className={`${styles.container} ${styles.heroGrid}`}>
          <div><p className={styles.kicker}>Quality and traceability</p><h1>Evidence arranged for review.</h1></div>
          <p className={styles.heroCopy}>Documentation requirements are agreed with the order, then organized around material identity, inspection scope and the applicable purchase specification.</p>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionWhite}`}>
        <div className={styles.container}>
          <div className={styles.qualityFeature}>
            <img src="/assets/certificates/alloy-fastener-quality-certificates.jpg" alt="Alloy fastener certificates and material test reports arranged for review" width="1536" height="1024" loading="eager" decoding="async" />
            <div className={styles.qualityFeatureCopy}>
              <h2>Order documentation</h2>
              <p>Certificates, reports and traceability records are matched to the confirmed inspection and documentation scope.</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="quality-files-title">
        <div className={styles.container}>
          <div className={styles.sectionHeading}>
            <div><p className={styles.kicker}>Document types</p><h2 id="quality-files-title">A clear file set for each requirement.</h2></div>
            <p>Availability depends on material source, product standard, testing scope and what is confirmed before production.</p>
          </div>
          <div className={styles.credentialGrid}>
            {credentials.map(([number, title, cropClass]) => (
              <article className={styles.credentialCard} key={title}>
                <div className={`${styles.credentialMedia} ${styles[cropClass]}`} role="img" aria-label={`${title} example`} />
                <div className={styles.credentialCopy}><span>{number}</span><h3>{title}</h3></div>
              </article>
            ))}
          </div>
          <p className={styles.notice}>Images illustrate document presentation only. Actual certificates and reports are supplied according to the agreed order scope.</p>
        </div>
      </section>
    </InformationSiteShell>
  );
}
