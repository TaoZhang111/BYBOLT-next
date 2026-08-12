import type { Metadata } from "next";

import { ContactBand } from "@/components/marketing/contact-band";
import { InformationSiteShell } from "@/components/marketing/information-site-shell";
import styles from "@/components/marketing/information-site.module.css";
import { isLocale } from "@/i18n/config";
import { localizedAlternates } from "@/lib/seo";

const values = [
  ["01", "Technical clarity", "Requirements are organized around drawings, standards, material condition and service context."],
  ["02", "Documented supply", "Traceability, testing and inspection expectations are defined before production begins."],
  ["03", "Practical coordination", "Commercial scope, manufacturing route and export preparation are kept connected throughout the project."],
] as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: "About BYBOLT",
    description: "Learn how BYBOLT approaches high-temperature alloy fastener supply, drawing review, quality documentation and international delivery.",
    alternates: localizedAlternates(locale, "about"),
  };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  return (
    <InformationSiteShell locale={locale} current="about">
      <section className={styles.hero}>
        <div className={`${styles.container} ${styles.heroGrid}`}>
          <div><p className={styles.kicker}>About BYBOLT</p><h1>Built around the requirement.</h1></div>
          <p className={styles.heroCopy}>BYBOLT presents standard and drawing-based alloy fastener supply through a clear technical workflow, from initial specification to documented delivery.</p>
        </div>
      </section>
      <section className={`${styles.section} ${styles.sectionWhite}`}>
        <div className={`${styles.container} ${styles.storyGrid}`}>
          <h2>Built by bolt,<br />made to endure.</h2>
          <div className={styles.storyCopy}>
            <p>BYBOLT is an industrial fastener brand focused on high-temperature and corrosion-resistant alloy products for demanding assemblies. The catalogue covers standard fastener forms, alloy round bar and components developed from customer drawings.</p>
            <p>Our approach begins with the operating requirement. Material grade, geometry, thread form, inspection, documentation and delivery conditions are considered together so buyers can review a coherent supply scope rather than a disconnected list of parts.</p>
            <p>The website is designed to make that process visible: compare product forms and materials, understand the custom workflow, review available quality records and submit one structured RFQ.</p>
          </div>
        </div>
      </section>
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.valueGrid}>{values.map(([number, title, description]) => <article className={styles.valueCard} key={number}><span>{number}</span><h2>{title}</h2><p>{description}</p></article>)}</div>
        </div>
      </section>
      <ContactBand locale={locale} titleId="about-contact-title" />
    </InformationSiteShell>
  );
}
