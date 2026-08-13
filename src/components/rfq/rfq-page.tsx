import Link from "@/components/navigation/static-link";

import { HomeHeader } from "@/components/home/home-header";
import { RfqForm } from "@/components/rfq/rfq-form";
import { contactDetails } from "@/content/product-catalog";
import type { Locale } from "@/i18n/config";

export function RfqPage({ locale }: { locale: Locale }) {
  const base = `/${locale}`;

  return (
    <div className="page-quote">
      <HomeHeader locale={locale} solid quoteCurrent />
      <main className="quote-main">
        <section className="quote-hero" aria-labelledby="quote-title">
          <div className="container quote-hero-grid">
            <div>
              <p className="eyebrow">STANDARD OR CUSTOM REQUIREMENTS</p>
              <h1 id="quote-title">Request a Quote</h1>
              <p>Submit a standard fastener requirement or upload drawings for a custom component review.</p>
            </div>
            <div className="response-promise" aria-label="Response commitment"><span>Response target</span><strong>Within one business day</strong></div>
          </div>
        </section>

        <section className="quote-workspace">
          <div className="container quote-layout">
            <aside className="quote-aside quote-contact-card">
              <div><p className="eyebrow dark">Contact</p><h2>Contact Us</h2><p>Speak with BYBOLT about alloy selection, drawings, testing and delivery requirements.</p></div>
              <address className="quote-contact-list">
                {contactDetails.map((method) => {
                  const href = method.type === "email" ? `mailto:${method.value}` : method.type === "phone" ? `tel:${method.value.replace(/\s/g, "")}` : null;
                  return <p key={method.id}><span>{method.label}</span>{href ? <a href={href}>{method.value}</a> : <b>{method.value || "-"}</b>}</p>;
                })}
              </address>
            </aside>
            <div className="rfq-panel"><RfqForm locale={locale} /></div>
          </div>
        </section>
      </main>

      <footer className="site-footer light-footer">
        <div className="container footer-grid">
          <div><strong>BYBOLT</strong><p>High-temperature alloy fasteners for international industrial procurement.</p></div>
          <div><span>Products</span><Link href={`${base}/products`}>Product Range</Link><Link href={`${base}/products/bolts/hex-bolts/`}>Hex Bolts</Link></div>
          <div><span>Capabilities</span><Link href={`${base}/alloys`}>Materials</Link><Link href={`${base}/capabilities`}>Custom Supply</Link><Link href={`${base}/quality`}>Quality</Link></div>
          <div><span>Contact</span><Link href={`${base}/request-a-quote`}>Request a Quote</Link><a href="mailto:sales@bybolt.com">Email Sales</a></div>
        </div>
        <div className="container footer-bottom"><span>&copy; 2026 BYBOLT</span><span>built by bolt, made to endure</span></div>
      </footer>
    </div>
  );
}
