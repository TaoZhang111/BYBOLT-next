import { LegacySiteScript } from "@/components/legacy/legacy-site-script";
import { quoteStaticHtml } from "@/content/quote-static";

export default function RequestQuotePage() {
  return (
    <>
      <div className="page-quote prototype-page" dangerouslySetInnerHTML={{ __html: quoteStaticHtml }} />
      <LegacySiteScript />
    </>
  );
}
