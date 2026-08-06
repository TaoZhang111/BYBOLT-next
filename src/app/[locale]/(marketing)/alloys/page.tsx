import type { Metadata } from "next";
import { ArrowLeftRight } from "lucide-react";

import Link from "@/components/navigation/static-link";
import { MaterialSiteShell } from "@/components/materials/material-site-shell";
import styles from "@/components/materials/material-site.module.css";
import { alloyMaterials, localizeAlloyMaterial } from "@/content/materials";
import { isLocale } from "@/i18n/config";
import { localizedAlternates } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  return {
    title: "High-Temperature Nickel Alloys",
    description: "Compare nickel alloy families for corrosion, temperature and high-strength fastener applications.",
    alternates: localizedAlternates(locale, "alloys"),
  };
}

export default async function AlloysPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  const base = `/${locale}`;
  const localizedMaterials = alloyMaterials.map((material) => localizeAlloyMaterial(material, locale));
  const featuredMaterials = localizedMaterials.filter((material) => material.slug !== "other-nickel-alloys");
  const otherMaterial = localizedMaterials.find((material) => material.slug === "other-nickel-alloys");

  if (!otherMaterial) return null;

  return (
    <MaterialSiteShell locale={locale}>
      <section className={styles.hero}>
        <div className={`${styles.container} ${styles.heroGrid}`}>
          <div>
            <p className={styles.kicker}>Material capability</p>
            <h1>Alloys for Critical Environments</h1>
          </div>
          <p className={styles.heroCopy}>Match service conditions with a suitable alloy family. Final selection depends on temperature, media, load, manufacturing route and applicable standards.</p>
        </div>
      </section>

      <section className={styles.catalogSection} aria-label="Nickel alloy materials">
        <div className={styles.container}>
          <div className={styles.catalogToolbar}>
            <div>
              <p className={styles.kicker}>Material portfolio</p>
              <p>Review individual grades or compare three materials side by side.</p>
            </div>
            <Link className={styles.compareLink} href={`${base}/alloys/compare`}>
              <ArrowLeftRight aria-hidden="true" />
              Compare Materials
            </Link>
          </div>
          <div className={styles.materialGrid}>
            {featuredMaterials.map((material) => (
              <Link className={styles.materialCard} href={`${base}/alloys/${material.slug}`} key={material.slug}>
                <span className={styles.tag}>{material.uns}</span>
                <h2>{material.name}</h2>
                <p>{material.summary}</p>
                <span className={styles.cardLink}>View material details &rarr;</span>
              </Link>
            ))}
          </div>
          <Link className={styles.otherAlloys} href={`${base}/alloys/${otherMaterial.slug}`}>
            <span>{otherMaterial.index} / {otherMaterial.label}</span>
            <h2>{otherMaterial.name}</h2>
            <strong>Review specialty grades &rarr;</strong>
          </Link>
        </div>
      </section>
    </MaterialSiteShell>
  );
}
