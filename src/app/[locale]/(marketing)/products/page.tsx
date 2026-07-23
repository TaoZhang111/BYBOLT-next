import Link from "next/link";

import { productCategories } from "@/content/product-catalog";

export default function ProductsPage({ params }: { params: Promise<{ locale: string }> }) {
  void params;

  return (
    <main className="site-main page-products">
      <ProductHeader />
      <section className="section product-gallery-section light-chapter">
        <div className="container">
          <div className="section-heading split">
            <div>
              <p className="eyebrow dark">Product range</p>
              <h1>High-temperature alloy fasteners by category.</h1>
            </div>
            <Link className="button dark-button" href="/en/request-a-quote">
              Request a Quote
            </Link>
          </div>
          <div className="product-image-grid" aria-label="BYBOLT fastener categories">
            {productCategories.map((category) => (
              <Link className="image-product-card" href={`/en/products/${category.slug}`} key={category.slug}>
                <img src={category.image} alt={category.alt} loading="lazy" decoding="async" />
                <div>
                  <span>{category.index}</span>
                  <h2>{category.name}</h2>
                  <p>{category.summary}</p>
                  <b aria-hidden="true">&rarr;</b>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function ProductHeader() {
  return (
    <header className="site-header is-solid">
      <Link className="brand" href="/en" aria-label="BYBOLT home">
        <span className="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M7.2 3.8 3.8 7.2v9.6l3.4 3.4h9.6l3.4-3.4V7.2l-3.4-3.4H7.2Zm.8 3h8l1.2 1.2v8l-1.2 1.2H8L6.8 16V8L8 6.8Zm1.8 3.4v3.6h4.4v-3.6H9.8Z" /></svg>
        </span>
        <span className="brand-copy"><strong>BYBOLT</strong><small>built by bolt, made to endure</small></span>
      </Link>
      <nav className="site-nav" aria-label="Primary navigation">
        <Link href="/en/products">Products</Link>
        <Link href="/en#capabilities">Capabilities</Link>
        <Link href="/en#quality">Quality</Link>
        <Link className="nav-cta" href="/en/request-a-quote">Request a Quote</Link>
      </nav>
    </header>
  );
}
