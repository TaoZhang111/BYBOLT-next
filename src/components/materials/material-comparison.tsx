"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  CheckCircle2,
  FileText,
  Flame,
  FolderOpen,
  Info,
  RotateCcw,
  ShieldCheck,
  Thermometer,
  Weight,
} from "lucide-react";

import Link from "@/components/navigation/static-link";
import { comparableAlloyMaterials, localizeAlloyMaterial, type AlloyComparison } from "@/content/materials";
import type { Locale } from "@/i18n/config";

import styles from "./material-comparison.module.css";

const defaultSelection = ["inconel-718", "inconel-625", "hastelloy-c276"];

const performanceMetrics = [
  { key: "corrosion", label: "Corrosion resistance", icon: ShieldCheck },
  { key: "tensile", label: "Tensile strength", icon: Weight },
  { key: "temperature", label: "High-temperature performance", icon: Thermometer },
  { key: "oxidation", label: "Oxidation resistance", icon: Flame },
] satisfies Array<{ key: keyof AlloyComparison["performance"]; label: string; icon: typeof ShieldCheck }>;

type ComparableMaterial = (typeof comparableAlloyMaterials)[number];

function ComparisonSection({
  number,
  title,
  note,
  children,
}: {
  number: string;
  title: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <section className={styles.comparisonSection}>
      <header className={styles.sectionHeader}>
        <span>{number}</span>
        <h2>{title}</h2>
        {note && <p><Info aria-hidden="true" />{note}</p>}
      </header>
      {children}
    </section>
  );
}

function MobileMaterialLabel({ material }: { material: ComparableMaterial }) {
  return <span className={styles.mobileMaterialLabel}>{material.name}</span>;
}

export function MaterialComparison({ locale }: { locale: Locale }) {
  const base = `/${locale}`;
  const [selection, setSelection] = useState(defaultSelection);
  const localizedMaterials = useMemo(
    () => comparableAlloyMaterials.map((material) => localizeAlloyMaterial(material, locale) as ComparableMaterial),
    [locale],
  );
  const selectedMaterials = useMemo(
    () => selection
      .map((slug) => localizedMaterials.find((material) => material.slug === slug))
      .filter((material): material is ComparableMaterial => Boolean(material)),
    [localizedMaterials, selection],
  );

  function updateSelection(position: number, slug: string) {
    setSelection((current) => current.map((value, index) => (index === position ? slug : value)));
  }

  return (
    <div className={styles.comparison}>
      <div className={styles.controls} aria-label="Select three materials to compare">
        {selection.map((selectedSlug, index) => (
          <label key={`${index}-${selectedSlug}`}>
            <span>Material {index + 1}</span>
            <select value={selectedSlug} onChange={(event) => updateSelection(index, event.target.value)}>
              {localizedMaterials.map((material) => (
                <option
                  key={material.slug}
                  value={material.slug}
                  disabled={selection.includes(material.slug) && material.slug !== selectedSlug}
                >
                  {material.name}
                </option>
              ))}
            </select>
          </label>
        ))}
        <button type="button" onClick={() => setSelection(defaultSelection)}>
          <RotateCcw aria-hidden="true" />
          Reset
        </button>
      </div>
      <p className={styles.selectionNote}><Info aria-hidden="true" />Compare exactly three distinct materials.</p>

      <ComparisonSection number="01" title="Summary">
        <div className={styles.summaryGrid}>
          <div className={`${styles.rowLabel} ${styles.gridRowLabel}`}>Material</div>
          {selectedMaterials.map((material) => (
            <article className={styles.summaryCard} data-accent={material.comparison.accent} key={material.slug}>
              <strong className={styles.symbol}>{material.comparison.symbol}</strong>
              <h3>{material.name}</h3>
              <span>{material.uns}</span>
              <p>{material.summary}</p>
              <Link href={`${base}/alloys/${material.slug}`}>View details <b aria-hidden="true">&rarr;</b></Link>
            </article>
          ))}
        </div>
      </ComparisonSection>

      <ComparisonSection
        number="02"
        title="Performance overview"
        note="Relative BYBOLT indicators for preliminary comparison only; they are not engineering design values."
      >
        <div className={styles.dataTable}>
          {performanceMetrics.map(({ key, label, icon: Icon }) => (
            <div className={styles.metricRow} key={key}>
              <div className={styles.rowLabel}><Icon aria-hidden="true" /><span>{label}</span></div>
              {selectedMaterials.map((material) => {
                const score = material.comparison.performance[key];
                return (
                  <div className={styles.scoreCell} data-accent={material.comparison.accent} key={material.slug}>
                    <MobileMaterialLabel material={material} />
                    <strong>{score}<small>/100</small></strong>
                    <span className={styles.scoreTrack}><i style={{ width: `${score}%` }} /></span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </ComparisonSection>

      <ComparisonSection
        number="03"
        title="Mechanical properties"
        note="Representative room-temperature references. Product form, section size, heat treatment and governing specification control acceptance values."
      >
        <div className={styles.dataTable}>
          {([
            ["Typical tensile strength", "tensileStrength"],
            ["Typical yield strength", "yieldStrength"],
            ["Typical elongation", "elongation"],
            ["Reference condition", "condition"],
          ] as const).map(([label, key]) => (
            <div className={styles.textRow} key={key}>
              <div className={styles.rowLabel}><span>{label}</span></div>
              {selectedMaterials.map((material) => (
                <div key={material.slug}>
                  <MobileMaterialLabel material={material} />
                  {material.comparison.mechanical[key]}
                </div>
              ))}
            </div>
          ))}
        </div>
      </ComparisonSection>

      <ComparisonSection number="04" title="Temperature and corrosion">
        <div className={styles.dataTable}>
          <div className={styles.textRow}>
            <div className={styles.rowLabel}><Thermometer aria-hidden="true" /><span>Temperature capability</span></div>
            {selectedMaterials.map((material) => <div key={material.slug}><MobileMaterialLabel material={material} />{material.comparison.temperatureCapability}</div>)}
          </div>
          <div className={styles.textRow}>
            <div className={styles.rowLabel}><ShieldCheck aria-hidden="true" /><span>Corrosion characteristics</span></div>
            {selectedMaterials.map((material) => <div key={material.slug}><MobileMaterialLabel material={material} />{material.comparison.corrosionCharacteristics}</div>)}
          </div>
          <div className={styles.textRow}>
            <div className={styles.rowLabel}><span>Typical media and conditions</span></div>
            {selectedMaterials.map((material) => (
              <div key={material.slug}>
                <MobileMaterialLabel material={material} />
                <ul>{material.comparison.mediaAndConditions.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
            ))}
          </div>
        </div>
      </ComparisonSection>

      <ComparisonSection number="05" title="Heat treatment">
        <div className={styles.dataTable}>
          <div className={styles.textRow}>
            <div className={styles.rowLabel}><span>Typical heat treatment</span></div>
            {selectedMaterials.map((material) => <div key={material.slug}><MobileMaterialLabel material={material} />{material.comparison.heatTreatment}</div>)}
          </div>
          <div className={styles.textRow}>
            <div className={styles.rowLabel}><span>Typical supply condition</span></div>
            {selectedMaterials.map((material) => <div key={material.slug}><MobileMaterialLabel material={material} />{material.comparison.supplyCondition}</div>)}
          </div>
        </div>
      </ComparisonSection>

      <ComparisonSection number="06" title="Typical applications">
        <div className={styles.threeColumnGrid}>
          <div className={`${styles.rowLabel} ${styles.gridRowLabel}`}>Material</div>
          {selectedMaterials.map((material) => (
            <div data-accent={material.comparison.accent} key={material.slug}>
              <h3>{material.name}</h3>
              <ul>{material.comparison.applications.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          ))}
        </div>
      </ComparisonSection>

      <ComparisonSection number="07" title="Standards and documentation">
        <div className={styles.dataTable}>
          <div className={styles.textRow}>
            <div className={styles.rowLabel}><FileText aria-hidden="true" /><span>Standards support</span></div>
            {selectedMaterials.map((material) => (
              <div key={material.slug}><MobileMaterialLabel material={material} /><ul>{material.comparison.standardsSupport.map((item) => <li key={item}>{item}</li>)}</ul></div>
            ))}
          </div>
          <div className={styles.textRow}>
            <div className={styles.rowLabel}><FolderOpen aria-hidden="true" /><span>Documentation support</span></div>
            {selectedMaterials.map((material) => (
              <div key={material.slug}><MobileMaterialLabel material={material} /><ul>{material.comparison.documentationSupport.map((item) => <li key={item}>{item}</li>)}</ul></div>
            ))}
          </div>
        </div>
      </ComparisonSection>

      <div className={styles.availabilityBar}>
        <CheckCircle2 aria-hidden="true" />
        <span>All compared alloys can be reviewed across BYBOLT standard and custom fastener ranges.</span>
        <Link href={`${base}/products`}>View All Products <b aria-hidden="true">&rarr;</b></Link>
      </div>

      <section className={styles.helpPanel}>
        <div>
          <span>Need help selecting the right alloy?</span>
          <p>Send the operating temperature, process media, fastener dimensions, quantity, governing standard and documentation requirements for an engineering review.</p>
        </div>
        <Link className={styles.primaryAction} href={`${base}/request-a-quote`}>Request a Quote</Link>
        <Link className={styles.secondaryAction} href={`${base}/request-a-quote`}>Send Drawing / Specifications</Link>
      </section>

      <p className={styles.disclaimer}>The information shown is for preliminary material comparison only and does not replace project-specific engineering evaluation, the governing material standard or customer requirements.</p>
    </div>
  );
}
