import { ArrowUpRight } from "lucide-react";

import Link from "@/components/navigation/static-link";
import { requirementRoutes } from "@/content/home-content";
import type { Locale } from "@/i18n/config";

export function RequirementRoutes({ locale }: { locale: Locale }) {
  const base = `/${locale}`;

  return (
    <section
      className="section requirement-routes light-chapter"
      id="routes"
      data-light-header-start
      aria-labelledby="routes-title"
    >
      <div className="container">
        <div className="requirement-routes-heading">
          <div>
            <p className="eyebrow dark">Start with what you know</p>
            <h2 id="routes-title">Three routes to the same clear specification.</h2>
          </div>
          <p>
            A buyer may arrive with a part name, a material grade or only a drawing.
            The site supports all three without forcing a sales call first.
          </p>
        </div>

        <div className="requirement-route-grid" aria-label="Ways to start a fastener requirement">
          {requirementRoutes.map((route) => (
            <Link className="requirement-route" href={`${base}${route.href}`} key={route.number}>
              <span className="requirement-route-number">{route.number}</span>
              <div>
                <h3>{route.title}</h3>
                <p>{route.description}</p>
              </div>
              <span className="requirement-route-action">
                {route.action}
                <ArrowUpRight aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
