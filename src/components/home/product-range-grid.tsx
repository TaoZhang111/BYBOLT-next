"use client";

import { ArrowUpRight } from "lucide-react";
import { useState } from "react";

import Link from "@/components/navigation/static-link";
import { homeProducts } from "@/content/home-content";
import type { Locale } from "@/i18n/config";

type ProductRangeGridProps = {
  locale: Locale;
  products?: typeof homeProducts;
  ariaLabel?: string;
};

export function ProductRangeGrid({
  locale,
  products = homeProducts,
  ariaLabel = "BYBOLT fastener categories",
}: ProductRangeGridProps) {
  const [activeProduct, setActiveProduct] = useState<string | null>(null);
  const base = `/${locale}`;
  const rows = Array.from(
    { length: Math.ceil(products.length / 3) },
    (_, index) => products.slice(index * 3, index * 3 + 3),
  );

  const renderCard = (product: (typeof homeProducts)[number]) => (
    <Link
      className="image-product-card"
      href={`${base}${product.href}`}
      key={product.name}
      onMouseEnter={() => setActiveProduct(product.href)}
      onFocus={() => setActiveProduct(product.href)}
      onBlur={() => setActiveProduct(null)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={product.image} alt={product.alt} width="1536" height="1024" loading="lazy" decoding="async" />
      <div>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <b aria-hidden="true"><ArrowUpRight /></b>
      </div>
    </Link>
  );

  return (
    <div
      className="product-image-grid product-range-layout"
      aria-label={ariaLabel}
    >
      <div className="product-range-rows">
        {rows.map((row, index) => (
          <div
            className={`product-range-row${row.length > 2 ? " is-compact" : ""}`}
            key={`row-${index}`}
            onMouseLeave={() => setActiveProduct(null)}
            style={{
              gridTemplateColumns: row
                .map((product) => `minmax(0, ${activeProduct === product.href ? 1.3 : 1}fr)`)
                .join(" "),
            }}
          >
            {row.map((product) => renderCard(product))}
          </div>
        ))}
      </div>
    </div>
  );
}
