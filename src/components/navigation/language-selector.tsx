"use client";

import { ChevronDown, Globe2 } from "lucide-react";
import { usePathname } from "next/navigation";

import { isLocale, type Locale } from "@/i18n/config";

const languageOptions: Array<{ value: Locale; label: string; shortLabel: string }> = [
  { value: "zh", label: "中文", shortLabel: "中文" },
  { value: "en", label: "English", shortLabel: "EN" },
  { value: "ar", label: "العربية", shortLabel: "AR" },
];

export function LanguageSelector({ locale }: { locale: Locale }) {
  const pathname = usePathname();

  function switchLocale(nextLocale: string) {
    if (!isLocale(nextLocale) || nextLocale === locale) return;
    const segments = pathname.split("/");
    if (isLocale(segments[1] ?? "")) segments[1] = nextLocale;
    else segments.splice(1, 0, nextLocale);
    window.location.assign(`${segments.join("/") || "/"}${window.location.search}${window.location.hash}`);
  }

  return (
    <label className="language-switcher" dir="ltr">
      <Globe2 className="language-switcher-globe" aria-hidden="true" />
      <select aria-label="Select language" value={locale} onChange={(event) => switchLocale(event.target.value)}>
        {languageOptions.map((option) => (
          <option value={option.value} key={option.value}>{option.label}</option>
        ))}
      </select>
      <span className="language-switcher-current" aria-hidden="true">
        {languageOptions.find((option) => option.value === locale)?.shortLabel}
      </span>
      <ChevronDown className="language-switcher-chevron" aria-hidden="true" />
    </label>
  );
}
