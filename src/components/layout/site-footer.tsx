import Link from "@/components/navigation/static-link";

import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";
import { contactDetails } from "@/content/product-catalog";
import type { Locale } from "@/i18n/config";

export function SiteFooter({ locale }: { locale: Locale }) {
  const visibleContactDetails = contactDetails.filter((method) => method.value.trim());
  return (
    <footer className="mt-auto border-t border-white/10 bg-industrial py-12 text-white">
      <Container className="grid gap-8 md:grid-cols-3 md:items-end">
        <div>
          <p className="font-semibold tracking-[0.12em] uppercase">
            {siteConfig.workingName}
          </p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-white/60">
            {siteConfig.description}
          </p>
        </div>
        <div className="text-sm text-white/60">
          {visibleContactDetails.map((method) => <p className="mt-1" key={method.id}>{method.label}: {method.value}</p>)}
          <p className="mt-1">International sales · Location to be confirmed</p>
        </div>
        <div className="flex gap-5 text-sm md:justify-end">
          <Link href={`/${locale}/contact`}>{locale === "en" ? "Contact" : "联系"}</Link>
          <Link href={`/${locale}/request-a-quote`}>{locale === "en" ? "RFQ" : "询价"}</Link>
        </div>
      </Container>
    </footer>
  );
}
