import Image from "next/image";

import Link from "@/components/navigation/static-link";
import { manufacturingProcesses } from "@/content/product-catalog";
import type { Locale } from "@/i18n/config";

export function SupplyProcess({ locale }: { locale: Locale }) {
  return (
    <section className="section process-journey process-flow-section light-chapter" id="company" aria-labelledby="process-title">
      <div className="container process-flow-layout">
        <div className="process-flow-heading">
          <div>
            <p className="eyebrow dark">Manufacturing sequence</p>
            <h2 id="process-title">From verified material to packed fasteners.</h2>
          </div>
          <p>Eight controlled stages connect incoming material records with forming, machining, inspection and shipment-ready identification.</p>
        </div>

        <figure className="manufacturing-process-figure">
          <Image
            className="manufacturing-process-image"
            src="/assets/manufacturing-process-white.png"
            width={1672}
            height={941}
            unoptimized
            sizes="(max-width: 760px) 100vw, 1440px"
            alt="Eight-stage BYBOLT fastener manufacturing sequence from material verification to marking and packaging"
          />
          <div className="manufacturing-process-hotspots" aria-label="Open custom manufacturing process stages">
            {manufacturingProcesses.map((stage) => (
              <Link href={`/${locale}/capabilities/${stage.slug}/`} aria-label={`View ${stage.number} ${stage.title}`} key={stage.slug}><span>{stage.number} {stage.title}</span></Link>
            ))}
          </div>
          <figcaption>BYBOLT manufacturing and quality-control sequence.</figcaption>
        </figure>

        <ol className="manufacturing-process-mobile" aria-label="BYBOLT manufacturing sequence">
          {manufacturingProcesses.map((stage) => (
            <li key={stage.slug}>
              <Link href={`/${locale}/capabilities/${stage.slug}/`}>
                <span>{stage.number}</span>
                <strong>{stage.title}</strong>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
