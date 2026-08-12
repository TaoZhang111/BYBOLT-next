import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { siteConfig } from "@/config/site";
import { isLocale, locales } from "@/i18n/config";

import "../globals.css";
import "../prototype.css";
import "../react-overrides.css";
import "../home-refresh.css";

export const viewport: Viewport = { themeColor: "#1d1210" };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale = isLocale(locale) ? locale : siteConfig.primaryLocale;
  const title = "BYBOLT | High-Temperature Alloy Fasteners";

  return {
    metadataBase: new URL(siteConfig.url),
    title: { default: title, template: `%s | ${siteConfig.workingName}` },
    description: siteConfig.description,
    icons: { icon: "/assets/favicon.svg" },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    },
    openGraph: {
      type: "website",
      url: `/${currentLocale}`,
      siteName: siteConfig.workingName,
      locale: currentLocale === "zh" ? "zh_CN" : "en_US",
      title,
      description: "Engineered alloy fasteners for heat, pressure and corrosion-critical industrial applications.",
      images: [{ url: "/assets/images/fastener-hero-poster.jpg", width: 1672, height: 941, alt: "BYBOLT high-temperature alloy fastener" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: siteConfig.description,
      images: ["/assets/images/fastener-hero-poster.jpg"],
    },
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <html lang={locale}>
      <body className="prototype-page">{children}</body>
    </html>
  );
}
