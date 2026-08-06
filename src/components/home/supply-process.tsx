import { ArrowRight } from "lucide-react";

import { processSteps } from "@/content/home-content";

export function SupplyProcess() {
  return (
    <section className="section process-journey process-flow-section light-chapter" id="company" aria-labelledby="process-title">
      <div className="container process-flow-layout">
        <div className="process-flow-heading">
          <div>
            <p className="eyebrow dark">From RFQ to shipment</p>
            <h2 id="process-title">A predictable supply workflow.</h2>
          </div>
          <p>Five connected stages keep the technical requirement, commercial scope, production records and delivery preparation aligned.</p>
        </div>

        <ol className="process-flow-list" aria-label="BYBOLT supply workflow">
          {processSteps.map((step, index) => (
            <li className="process-flow-step" key={step.number}>
              <article className="process-flow-node">
                <span className="process-flow-number">{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
              {index < processSteps.length - 1 && (
                <span className="process-flow-connector" aria-hidden="true">
                  <ArrowRight />
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
