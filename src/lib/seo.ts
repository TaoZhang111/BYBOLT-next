import type { Metadata } from "next";

import type { Locale } from "@/i18n/config";

export function localizedAlternates(locale: Locale, path = ""): Metadata["alternates"] {
  const normalizedPath = path ? `/${path.replace(/^\/+|\/+$/g, "")}` : "";
  return {
    canonical: `/${locale}${normalizedPath}/`,
    languages: {
      en: `/en${normalizedPath}/`,
      zh: `/zh${normalizedPath}/`,
      "x-default": `/en${normalizedPath}/`,
    },
  };
}
