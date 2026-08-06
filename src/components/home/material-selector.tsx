"use client";

import { ArrowUpRight } from "lucide-react";
import { useState } from "react";

import Link from "@/components/navigation/static-link";
import { alloyMaterials, localizeAlloyMaterial } from "@/content/materials";
import type { Locale } from "@/i18n/config";

export function MaterialSelector({ locale }: { locale: Locale }) {
  const materials = alloyMaterials.map((material) => localizeAlloyMaterial(material, locale));
  const [activeSlug, setActiveSlug] = useState(materials[0].slug);
  const activeMaterial = materials.find((material) => material.slug === activeSlug) ?? materials[0];
  const base = `/${locale}`;

  return (
    <section className="section material-intelligence light-chapter" id="materials" aria-labelledby="materials-title">
      <div className="container">
        <div className="material-intelligence-heading">
          <div>
            <p className="eyebrow dark">03 / Material intelligence</p>
            <h2 id="materials-title">The right alloy.<em>Nothing less.</em></h2>
          </div>
          <p>Selection begins with the operating environment: corrosion media, temperature, strength, standards and previous failure mode.</p>
        </div>

        <div className="material-intelligence-workspace">
          <div className="material-tabs" role="tablist" aria-label="Alloy materials">
            {materials.map((material) => (
              <button
                className={material.slug === activeMaterial.slug ? "is-active" : undefined}
                type="button"
                role="tab"
                aria-selected={material.slug === activeMaterial.slug}
                aria-controls="material-panel"
                key={material.slug}
                onClick={() => setActiveSlug(material.slug)}
              >
                <span>{material.index}</span>
                <strong>{material.name}</strong>
                <small>{material.label}</small>
              </button>
            ))}
          </div>

          <article className="material-panel" id="material-panel" role="tabpanel" key={activeMaterial.slug}>
            <div className="material-panel-copy">
              <p className="eyebrow dark">{activeMaterial.uns}</p>
              <h3>{activeMaterial.headline}</h3>
              <p>{activeMaterial.description}</p>
              <Link href={`${base}/alloys/${activeMaterial.slug}`}>Explore material <ArrowUpRight aria-hidden="true" /></Link>
            </div>
            <dl className="material-panel-specs">
              <div><dt>Positioning</dt><dd>{activeMaterial.positioning}</dd></div>
              <div><dt>Available forms</dt><dd>{activeMaterial.forms}</dd></div>
              <div><dt>Documentation</dt><dd>{activeMaterial.documentation}</dd></div>
            </dl>
          </article>
        </div>
      </div>
    </section>
  );
}
