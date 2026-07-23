import Link from "next/link";
import { notFound } from "next/navigation";

import { productCategories, sharedProductProperties } from "@/content/product-catalog";

type Props = { params: Promise<{ category: string }> };

export function generateStaticParams() {
  return productCategories.map((category) => ({ category: category.slug }));
}

export default async function ProductCategoryPage({ params }: Props) {
  const { category: categorySlug } = await params;
  const category = productCategories.find((item) => item.slug === categorySlug);

  if (!category) {
    notFound();
  }

  return (
    <main className="site-main">
      <header className="site-header is-solid">
        <Link className="brand" href="/en" aria-label="BYBOLT home"><span className="brand-copy"><strong>BYBOLT</strong><small>built by bolt, made to endure</small></span></Link>
        <nav className="site-nav" aria-label="Primary navigation"><Link href="/en/products">Products</Link><Link className="nav-cta" href="/en/request-a-quote">Request a Quote</Link></nav>
      </header>
      <section className="quote-hero">
        <div className="container quote-hero-grid">
          <div>
            <p className="eyebrow">{category.name}</p>
            <h1>{category.name} for critical service.</h1>
            <p>{category.intro}</p>
          </div>
          <div className="response-promise"><span>Category</span><strong>{category.models.length} product types</strong></div>
        </div>
      </section>
      <section className="section product-gallery-section light-chapter">
        <div className="container product-layout">
          <figure className="product-photo"><img src={category.image} alt={category.alt} /></figure>
          <div className="product-cards">
            {category.models.map((model) => (
              <Link className="product-card" href={`/en/products/${category.slug}/${model.slug}`} key={model.slug}>
                <span className="product-type">{model.eyebrow}</span>
                <h2>{model.name}</h2>
                <p>{model.description}</p>
                <span className="card-link">View details <b aria-hidden="true">&rarr;</b></span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="section certificate-section light-chapter">
        <div className="container">
          <div className="section-heading split"><h2>Shared supply properties.</h2><Link className="button dark-button" href="/en/request-a-quote">Request this category</Link></div>
          <div className="capability-rows">
            {Object.entries(sharedProductProperties).map(([label, value]) => <article key={label}><span>{label}</span><h3>{value}</h3></article>)}
          </div>
        </div>
      </section>
    </main>
  );
}
