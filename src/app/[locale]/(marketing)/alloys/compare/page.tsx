import type { Metadata } from "next";

import { MaterialComparison } from "@/components/materials/material-comparison";
import { MaterialSiteShell } from "@/components/materials/material-site-shell";
import styles from "@/components/materials/material-site.module.css";
import Link from "@/components/navigation/static-link";
import { isLocale } from "@/i18n/config";
import { localizedAlternates } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  return {
    title: "Compare Nickel Alloy Materials",
    description: "Compare BYBOLT nickel alloy materials across relative performance, mechanical properties, service conditions, heat treatment and documentation support.",
    alternates: localizedAlternates(locale, "alloys/compare"),
  };
}

export default async function MaterialComparisonPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;

  return (
    <MaterialSiteShell locale={locale}>
      <section className={`${styles.hero} ${styles.comparisonHero}`}>
        <div className={styles.container}>
          <p className={styles.breadcrumb}>
            <Link href={`/${locale}/alloys`}>Materials</Link> / Compare Materials
          </p>
          <div className={styles.comparisonHeroInner}>
            <h1>Compare Materials</h1>
            <p className={styles.heroCopy}>Review three alloy families side by side by relative performance, representative mechanical properties, service conditions and documentation scope.</p>
          </div>
        </div>
      </section>
      <section className={styles.comparisonSectionPage}>
        <div className={styles.container}>
          <MaterialComparison locale={locale} />
        </div>
      </section>
    </MaterialSiteShell>
  );
}
