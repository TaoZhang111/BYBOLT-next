import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowLeftRight } from "lucide-react";

import Link from "@/components/navigation/static-link";
import { MaterialSiteShell } from "@/components/materials/material-site-shell";
import styles from "@/components/materials/material-site.module.css";
import { alloyMaterials, getAlloyMaterial, localizeAlloyMaterial } from "@/content/materials";
import { isLocale, locales } from "@/i18n/config";
import { localizedAlternates } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) => alloyMaterials.map((material) => ({ locale, slug: material.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const material = getAlloyMaterial(slug);
  if (!isLocale(locale) || !material) return {};
  const localizedMaterial = localizeAlloyMaterial(material, locale);

  return {
    title: localizedMaterial.seoTitle || localizedMaterial.headline,
    description: localizedMaterial.seoDescription || localizedMaterial.summary,
    alternates: localizedAlternates(locale, `alloys/${material.slug}`),
  };
}

export default async function AlloyDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const sourceMaterial = getAlloyMaterial(slug);
  if (!sourceMaterial) notFound();
  const material = localizeAlloyMaterial(sourceMaterial, locale);
  const base = `/${locale}`;
  const comparison = material.comparison;

  return (
    <MaterialSiteShell locale={locale}>
      <section className={styles.hero}>
        <div className={styles.container}>
          <Link className={styles.backLink} href={`${base}/alloys`}>
            <ArrowLeft aria-hidden="true" />
            Back to Materials
          </Link>
          <div className={styles.heroGrid}>
            <div>
              <p className={styles.breadcrumb}>Materials / {material.name}</p>
              <h1>{material.name}<em>{material.label}</em></h1>
            </div>
            <p className={styles.heroCopy}>{material.summary}</p>
          </div>
        </div>
      </section>

      <section className={styles.detailSection}>
        <div className={styles.container}>
          <div className={styles.detailToolbar}>
            <span>Material specification overview</span>
            <Link className={styles.compareLink} href={`${base}/alloys/compare`}>
              <ArrowLeftRight aria-hidden="true" />
              Compare Materials
            </Link>
          </div>
          <article className={styles.detailGrid}>
            <aside className={styles.detailAside}>
              <span>{material.index} / {material.uns}</span>
              <p>{material.service}</p>
            </aside>
            <div className={styles.detailMain}>
              <p className={styles.kicker}>Material positioning</p>
              <h2>{material.headline}</h2>
              <p className={styles.detailDescription}>{material.description}</p>
              <dl className={styles.detailSpecs}>
                <div><dt>Positioning</dt><dd>{material.positioning}</dd></div>
                <div><dt>Available forms</dt><dd>{material.forms}</dd></div>
                <div><dt>Documentation</dt><dd>{material.documentation}</dd></div>
              </dl>
              <div className={styles.actions}>
                <Link className={styles.primaryButton} href={`${base}/request-a-quote`}>Request This Material</Link>
                <Link className={styles.secondaryButton} href={`${base}/products`}>View Products</Link>
              </div>
            </div>
          </article>
          {comparison && (
            <section className={styles.materialProfile} aria-labelledby="material-profile-heading">
              <header>
                <div>
                  <p className={styles.kicker}>Engineering reference</p>
                  <h2 id="material-profile-heading">Performance and service profile</h2>
                </div>
                <p>Representative information for preliminary review. Final values depend on product form, dimensions, heat treatment and governing specification.</p>
              </header>
              <div className={styles.profileGrid}>
                <div>
                  <span>Typical tensile strength</span>
                  <strong>{comparison.mechanical.tensileStrength}</strong>
                </div>
                <div>
                  <span>Typical yield strength</span>
                  <strong>{comparison.mechanical.yieldStrength}</strong>
                </div>
                <div>
                  <span>Reference condition</span>
                  <strong>{comparison.mechanical.condition}</strong>
                </div>
                <div>
                  <span>Temperature capability</span>
                  <strong>{comparison.temperatureCapability}</strong>
                </div>
                <div>
                  <span>Corrosion characteristics</span>
                  <strong>{comparison.corrosionCharacteristics}</strong>
                </div>
                <div>
                  <span>Typical heat treatment</span>
                  <strong>{comparison.heatTreatment}</strong>
                </div>
              </div>
              <div className={styles.profileLists}>
                <div>
                  <h3>Typical applications</h3>
                  <ul>{comparison.applications.map((item) => <li key={item}>{item}</li>)}</ul>
                </div>
                <div>
                  <h3>Standards support</h3>
                  <ul>{comparison.standardsSupport.map((item) => <li key={item}>{item}</li>)}</ul>
                </div>
                <div>
                  <h3>Documentation support</h3>
                  <ul>{comparison.documentationSupport.map((item) => <li key={item}>{item}</li>)}</ul>
                </div>
              </div>
            </section>
          )}
        </div>
      </section>
    </MaterialSiteShell>
  );
}
