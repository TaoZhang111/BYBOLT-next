import Link from "@/components/navigation/static-link";

import { HomeHeader } from "@/components/home/home-header";
import { RfqForm } from "@/components/rfq/rfq-form";
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
            <aside className="quote-aside">
              <div>
                <p className="eyebrow dark">What to include</p>
                <h2>Enough detail for a useful quotation.</h2>
                <p>Material, size, quantity and destination are the essentials. Add the standard, testing and drawing where available.</p>
              </div>
              <ol className="quote-guide">
                <li><span>01</span><div><strong>Contact details</strong><small>So the technical response reaches the right person.</small></div></li>
                <li><span>02</span><div><strong>Product requirements</strong><small>Material, size, quantity, testing and destination.</small></div></li>
                <li><span>03</span><div><strong>Drawing &amp; confidentiality</strong><small>Optional files with a clear confidentiality request.</small></div></li>
              </ol>
              <div className="aside-contact"><span>Prefer email?</span><a href="mailto:sales@bybolt.com">sales@bybolt.com</a></div>
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
