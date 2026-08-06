import Image from "next/image";

const manufacturingSteps = [
  "Material Verification",
  "Cutting",
  "Forming",
  "Heat Treatment",
  "CNC Turning",
  "Cleaning",
  "Inspection",
  "Marking & Packaging",
];

export function SupplyProcess() {
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
          <figcaption>BYBOLT manufacturing and quality-control sequence.</figcaption>
        </figure>

        <ol className="manufacturing-process-mobile" aria-label="BYBOLT manufacturing sequence">
          {manufacturingSteps.map((step, index) => (
            <li key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{step}</strong>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
