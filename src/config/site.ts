import type { Locale } from "@/i18n/config";

export const siteConfig = {
  workingName: "BYBOLT",
  slogan: "built by bolt, made to endure",
  description:
    "BYBOLT supplies high-temperature alloy bolts, studs, nuts, washers and custom fastener components for heat, pressure and corrosion-critical applications.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://bybolt-next-preview.pages.dev",
  primaryLocale: "en" satisfies Locale,
  contactEmail: "sales@bybolt.com",
} as const;

export type NavigationItem = {
  href: string;
  label: Record<Locale, string>;
};

export const primaryNavigation: NavigationItem[] = [
  { href: "/alloys", label: { en: "Alloys", zh: "合金产品", ar: "السبائك" } },
  {
    href: "/product-forms",
    label: { en: "Product Forms", zh: "产品形态", ar: "أشكال المنتجات" },
  },
  { href: "/industries", label: { en: "Industries", zh: "行业应用", ar: "الصناعات" } },
  {
    href: "/capabilities",
    label: { en: "Capabilities", zh: "技术能力", ar: "القدرات" },
  },
  { href: "/quality", label: { en: "Quality", zh: "质量体系", ar: "الجودة" } },
  { href: "/resources", label: { en: "Resources", zh: "资料中心", ar: "الموارد" } },
  { href: "/news", label: { en: "News", zh: "新闻", ar: "الأخبار" } },
  { href: "/about", label: { en: "About", zh: "关于我们", ar: "من نحن" } },
];
