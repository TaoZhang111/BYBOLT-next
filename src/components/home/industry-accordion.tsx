import Link from "@/components/navigation/static-link";
import type { CSSProperties } from "react";

import { industries } from "@/content/home-content";
import type { Locale } from "@/i18n/config";

export function IndustryAccordion({ locale }: { locale: Locale }) {
  return (
    <div className="industry-accordion" aria-label="Industries served">
      {industries.map((industry) => (
        <Link
          className="industry-panel"
          href={`/${locale}/request-a-quote`}
          key={industry.name}
          style={{ "--panel-image": `url('${industry.image}')` } as CSSProperties}
          aria-label={`${industry.name}: discuss the application`}
        >
          <div>
            <span>{industry.context}</span>
            <h3>{industry.name}</h3>
            <p>{industry.description}</p>
            <b aria-hidden="true">&rarr;</b>
          </div>
        </Link>
      ))}
    </div>
  );
}
