import type { Locale } from "@/i18n/config";

export const siteConfig = {
  workingName: "VK Superalloys",
  description:
    "High-performance superalloy materials for demanding industrial applications.",
  primaryLocale: "en" satisfies Locale,
  contactEmail: "sales@example.com",
} as const;

export type NavigationItem = {
  href: string;
  label: Record<Locale, string>;
};

export const primaryNavigation: NavigationItem[] = [
  { href: "/alloys", label: { en: "Alloys", zh: "合金产品" } },
  {
    href: "/product-forms",
    label: { en: "Product Forms", zh: "产品形态" },
  },
  { href: "/industries", label: { en: "Industries", zh: "行业应用" } },
  {
    href: "/capabilities",
    label: { en: "Capabilities", zh: "技术能力" },
  },
  { href: "/quality", label: { en: "Quality", zh: "质量体系" } },
  { href: "/resources", label: { en: "Resources", zh: "资料中心" } },
  { href: "/news", label: { en: "News", zh: "新闻" } },
  { href: "/about", label: { en: "About", zh: "关于我们" } },
];
