import { LegacySiteScript } from "@/components/legacy/legacy-site-script";
import { homeStaticHtml } from "@/content/home-static";

export default function HomePage() {
  return (
    <>
      <div className="page-home prototype-page" dangerouslySetInnerHTML={{ __html: homeStaticHtml }} />
      <LegacySiteScript />
    </>
  );
}
