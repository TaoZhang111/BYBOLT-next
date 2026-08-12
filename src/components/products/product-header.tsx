import { HomeHeader } from "@/components/home/home-header";
import type { Locale } from "@/i18n/config";

export function ProductHeader({
  locale,
  current = "products",
}: {
  locale: Locale;
  current?: "products" | "materials" | "custom" | "quality" | "resources" | "about";
}) {
  return (
    <>
      <HomeHeader locale={locale} solid current={current} />
      <div className="site-header-spacer" aria-hidden="true" />
    </>
  );
}
