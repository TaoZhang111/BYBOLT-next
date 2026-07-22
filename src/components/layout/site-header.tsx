import Link from "next/link";

import { Container } from "@/components/ui/container";
import { primaryNavigation, siteConfig } from "@/config/site";
import type { Locale } from "@/i18n/config";

export function SiteHeader({ locale }: { locale: Locale }) {
  const alternateLocale: Locale = locale === "en" ? "zh" : "en";

  return (
    <header className="border-b border-white/10 bg-industrial text-white">
      <Container className="flex min-h-20 items-center justify-between gap-8 py-4">
        <Link href={`/${locale}`} className="shrink-0" aria-label="Home">
          <span className="block text-lg font-semibold tracking-[0.14em] uppercase">
            {siteConfig.workingName}
          </span>
          <span className="block text-[0.65rem] tracking-[0.22em] text-white/55 uppercase">
            High-performance materials
          </span>
        </Link>

        <nav aria-label="Primary navigation" className="hidden xl:block">
          <ul className="flex items-center gap-5 text-sm text-white/75">
            {primaryNavigation.map((item) => (
              <li key={item.href}>
                <Link className="transition hover:text-white" href={`/${locale}${item.href}`}>
                  {item.label[locale]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-3 text-sm">
          <Link
            className="border border-white/25 px-3 py-2 text-white/80 transition hover:border-white hover:text-white"
            href={`/${alternateLocale}`}
          >
            {alternateLocale === "en" ? "EN" : "中文"}
          </Link>
          <Link
            className="bg-accent px-4 py-2 font-semibold text-white transition hover:bg-accent-strong"
            href={`/${locale}/request-a-quote`}
          >
            {locale === "en" ? "Request a Quote" : "提交询价"}
          </Link>
        </div>
      </Container>
    </header>
  );
}
