import type { CSSProperties } from "react";

import { industries } from "@/content/home-content";

export function IndustryAccordion() {
  return (
    <div className="industry-accordion" aria-label="Industries served">
      {industries.map((industry) => (
        <article
          className="industry-panel"
          key={industry.name}
          style={{ "--panel-image": `url('${industry.image}')` } as CSSProperties}
        >
          <div>
            <h3>{industry.name}</h3>
          </div>
        </article>
      ))}
    </div>
  );
}
