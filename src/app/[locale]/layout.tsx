import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { siteConfig } from "@/config/site";
import { isLocale, locales } from "@/i18n/config";

import "../globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: siteConfig.workingName,
    template: `%s | ${siteConfig.workingName}`,
  },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    title: siteConfig.workingName,
    description: siteConfig.slogan,
    images: [{ url: "/og.jpg", width: 1731, height: 909, alt: "BYBOLT" }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.workingName,
    description: siteConfig.slogan,
    images: ["/og.jpg"],
  },
};

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
      <body>{children}</body>
    </html>
  );
}
