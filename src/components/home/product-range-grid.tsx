import { ArrowUpRight } from "lucide-react";

import Link from "@/components/navigation/static-link";
import type { Locale } from "@/i18n/config";

export type ProductRangeItem = {
  href: string;
  image: string;
  alt: string;
  name: string;
  description: string;
};

type ProductRangeGridProps = {
  locale: Locale;
  products: ProductRangeItem[];
  ariaLabel?: string;
};

export function ProductRangeGrid({
  locale,
  products,
  ariaLabel = "BYBOLT fastener categories",
}: ProductRangeGridProps) {
  const base = `/${locale}`;
  const rows = Array.from(
    { length: Math.ceil(products.length / 3) },
    (_, index) => products.slice(index * 3, index * 3 + 3),
  );

  const renderCard = (product: ProductRangeItem) => (
    <Link
      className="image-product-card"
      href={`${base}${product.href}`}
      key={product.href}
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
        {rows.map((row, index) => {
          return (
            <div
              className={`product-range-row has-${row.length}-cards${row.length > 2 ? " is-compact" : ""}`}
              key={`row-${index}`}
            >
              {row.map((product) => renderCard(product))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
