"use client";

import Link from "@/components/navigation/static-link";
import { type CSSProperties, useState } from "react";

import { industries } from "@/content/home-content";
import type { Locale } from "@/i18n/config";

export function IndustryAccordion({ locale }: { locale: Locale }) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="industry-accordion" aria-label="Industries served">
      {industries.map((industry, index) => (
        <article
          className={`industry-panel${activeIndex === index ? " is-active" : ""}`}
          key={industry.name}
          tabIndex={0}
          style={{ "--panel-image": `url('${industry.image}')` } as CSSProperties}
          onMouseEnter={() => setActiveIndex(index)}
          onFocus={() => setActiveIndex(index)}
          onClick={() => setActiveIndex(index)}
        >
          <div>
            <span>{industry.context}</span>
            <h3>{industry.name}</h3>
            <p>{industry.description}</p>
            <Link href={`/${locale}/request-a-quote`}>Discuss the application &rarr;</Link>
          </div>
        </article>
      ))}
    </div>
  );
}
