import Link from "next/link";
import { notFound } from "next/navigation";

import { productCategories, sharedProductProperties } from "@/content/product-catalog";

type Props = { params: Promise<{ category: string; product: string }> };

export function generateStaticParams() {
  return productCategories.flatMap((category) =>
    category.models.map((product) => ({ category: category.slug, product: product.slug })),
  );
}

export default async function ProductDetailPage({ params }: Props) {
  const { category: categorySlug, product: productSlug } = await params;
  const category = productCategories.find((item) => item.slug === categorySlug);
  const product = category?.models.find((item) => item.slug === productSlug);

  if (!category || !product) {
    notFound();
  }

  const specs = [
    ["Size range", product.size],
    ["Length / thickness", product.length],
    ["Standard", product.standard],
    ["Configuration", product.configuration],
    ["Threads", product.threads],
    ["Materials", sharedProductProperties.materials],
    ["Inspection", sharedProductProperties.inspection],
    ["Documentation", sharedProductProperties.documentation],
  ];

  return (
    <main className="site-main">
      <header className="site-header is-solid">
        <Link className="brand" href="/en" aria-label="BYBOLT home"><span className="brand-copy"><strong>BYBOLT</strong><small>built by bolt, made to endure</small></span></Link>
        <nav className="site-nav" aria-label="Primary navigation"><Link href="/en/products">Products</Link><Link className="nav-cta" href={`/en/request-a-quote?product=${encodeURIComponent(product.name)}`}>Request a Quote</Link></nav>
      </header>
      <section className="quote-hero">
        <div className="container quote-hero-grid">
          <div>
            <p className="eyebrow">{category.name}</p>
            <h1>{product.name}</h1>
            <p>{product.description}</p>
          </div>
          <div className="response-promise"><span>Supply mode</span><strong>{product.eyebrow}</strong></div>
        </div>
      </section>
      <section className="section technical-specs light-chapter">
        <div className="container certificate-grid">
          <figure className="certificate-media reveal-media"><img src={category.image} alt={category.alt} /></figure>
          <div className="certificate-copy">
            <p className="eyebrow dark">Technical specification</p>
            <h2>Data prepared for RFQ and CMS workflows.</h2>
            <dl className="quote-guide">
              {specs.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
            </dl>
            <Link className="button dark-button" href={`/en/request-a-quote?product=${encodeURIComponent(product.name)}`}>Request this product</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
