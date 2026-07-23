import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { productCategories } from "@/content/product-catalog";
import { locales } from "@/i18n/config";

export const dynamic = "force-static";

const lastModified = new Date("2026-07-23T00:00:00.000Z");
const pages = ["", "products", "alloys", "capabilities", "quality", "industries", "request-a-quote", "about", "contact", "resources", "news"];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = locales.flatMap((locale) => pages.map((page) => ({
    url: `${siteConfig.url}/${locale}${page ? `/${page}` : ""}/`,
    lastModified,
    changeFrequency: page === "" ? "weekly" as const : "monthly" as const,
    priority: page === "" ? 1 : page === "products" || page === "request-a-quote" ? 0.9 : 0.7,
  })));
  const productPages = locales.flatMap((locale) => productCategories.flatMap((category) => [
    {
      url: `${siteConfig.url}/${locale}/products/${category.slug}/`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    ...category.models.map((product) => ({
      url: `${siteConfig.url}/${locale}/products/${category.slug}/${product.slug}/`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ]));

  return [...staticPages, ...productPages];
}
