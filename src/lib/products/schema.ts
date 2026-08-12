import { z } from "zod";

import { materialCatalogSchema } from "@/lib/materials/schema";

const slugSchema = z
  .string()
  .min(2, "Slug must contain at least 2 characters")
  .max(80, "Slug cannot exceed 80 characters")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only");

const assetPathSchema = z
  .string()
  .min(1, "Image is required")
  .refine((value) => value.startsWith("/") || value.startsWith("https://"), "Use a site path or HTTPS URL");

const statusSchema = z.enum(["draft", "published", "archived"]);
const optionalCopy = z.string().max(5000).optional();

export const productTranslationSchema = z.object({
  name: optionalCopy,
  eyebrow: optionalCopy,
  description: optionalCopy,
  size: optionalCopy,
  length: optionalCopy,
  standard: optionalCopy,
  configuration: optionalCopy,
  threads: optionalCopy,
  alt: optionalCopy,
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(180).optional(),
});

export const categoryTranslationSchema = z.object({
  name: optionalCopy,
  alt: optionalCopy,
  summary: optionalCopy,
  intro: optionalCopy,
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(180).optional(),
});

export const productModelSchema = z.object({
  slug: slugSchema,
  name: z.string().min(2).max(120),
  eyebrow: z.string().min(2).max(120),
  description: z.string().min(10).max(1200),
  size: z.string().min(1).max(500),
  length: z.string().min(1).max(500),
  standard: z.string().min(1).max(1000),
  configuration: z.string().min(1).max(1000),
  threads: z.string().min(1).max(500),
  image: assetPathSchema,
  alt: z.string().min(3).max(240),
  status: statusSchema,
  sortOrder: z.number().int().min(0).max(9999),
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(180).optional(),
  translation: z.object({ zh: productTranslationSchema }),
});

export const productCategorySchema = z.object({
  slug: slugSchema,
  name: z.string().min(2).max(120),
  index: z.string().min(1).max(4),
  image: assetPathSchema,
  alt: z.string().min(3).max(240),
  summary: z.string().min(10).max(1200),
  intro: z.string().min(10).max(1800),
  status: statusSchema,
  sortOrder: z.number().int().min(0).max(9999),
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(180).optional(),
  translation: z.object({ zh: categoryTranslationSchema }),
  models: z.array(productModelSchema),
});

export const sharedProductPropertiesSchema = z.object({
  materials: z.string().min(1).max(2000),
  dimensionalControl: z.string().min(1).max(2000),
  inspection: z.string().min(1).max(2000),
  documentation: z.string().min(1).max(2000),
  unitWeight: z.string().min(1).max(2000),
  packaging: z.string().min(1).max(2000),
});

export const newsTranslationSchema = z.object({
  category: optionalCopy,
  title: optionalCopy,
  excerpt: optionalCopy,
  body: z.string().max(30000).optional(),
  imageAlt: optionalCopy,
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(180).optional(),
});

export const newsArticleSchema = z.object({
  slug: slugSchema,
  category: z.string().min(2).max(120),
  title: z.string().min(5).max(180),
  excerpt: z.string().min(10).max(800),
  body: z.string().min(20).max(30000),
  publishedAt: z.iso.datetime(),
  image: assetPathSchema.optional(),
  imageAlt: z.string().max(240).optional(),
  status: statusSchema,
  pinned: z.boolean(),
  sortOrder: z.number().int().min(0).max(9999),
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(180).optional(),
  translation: z.object({ zh: newsTranslationSchema }),
});

export const faqTranslationSchema = z.object({
  question: optionalCopy,
  answer: optionalCopy,
});

export const faqItemSchema = z.object({
  id: slugSchema,
  question: z.string().min(5).max(300),
  answer: z.string().min(10).max(3000),
  status: statusSchema,
  sortOrder: z.number().int().min(0).max(9999),
  translation: z.object({ zh: faqTranslationSchema }),
});

export const qualityCertificateTranslationSchema = z.object({
  title: optionalCopy,
  description: optionalCopy,
  alt: optionalCopy,
});

export const qualityCertificateSchema = z.object({
  id: slugSchema,
  title: z.string().min(3).max(180),
  description: z.string().min(10).max(1200),
  image: assetPathSchema,
  alt: z.string().min(3).max(240),
  imagePosition: z.string().max(40).optional(),
  status: statusSchema,
  sortOrder: z.number().int().min(0).max(9999),
  translation: z.object({ zh: qualityCertificateTranslationSchema }),
});

export const contactDetailsSchema = z.object({
  email: z.string().max(240),
  phone: z.string().max(80),
  wechat: z.string().max(120),
});

export const productCatalogSchema = z
  .object({
    version: z.literal(1),
    updatedAt: z.iso.datetime(),
    categories: z.array(productCategorySchema).min(1).max(40),
    materials: materialCatalogSchema,
    news: z.array(newsArticleSchema).max(200),
    faqs: z.array(faqItemSchema).max(100),
    certificates: z.array(qualityCertificateSchema).max(100),
    contact: contactDetailsSchema,
    sharedProductProperties: sharedProductPropertiesSchema,
  })
  .superRefine((catalog, context) => {
    const categorySlugs = new Set<string>();
    for (const [categoryIndex, category] of catalog.categories.entries()) {
      if (categorySlugs.has(category.slug)) {
        context.addIssue({ code: "custom", path: ["categories", categoryIndex, "slug"], message: "Category slug must be unique" });
      }
      categorySlugs.add(category.slug);

      const productSlugs = new Set<string>();
      for (const [productIndex, product] of category.models.entries()) {
        if (productSlugs.has(product.slug)) {
          context.addIssue({ code: "custom", path: ["categories", categoryIndex, "models", productIndex, "slug"], message: "Product slug must be unique inside its category" });
        }
        productSlugs.add(product.slug);
      }
    }

    const newsSlugs = new Set<string>();
    for (const [articleIndex, article] of catalog.news.entries()) {
      if (newsSlugs.has(article.slug)) {
        context.addIssue({ code: "custom", path: ["news", articleIndex, "slug"], message: "News slug must be unique" });
      }
      newsSlugs.add(article.slug);
    }
    if (catalog.news.filter((article) => article.pinned).length > 3) {
      context.addIssue({ code: "custom", path: ["news"], message: "A maximum of three news articles can be pinned" });
    }

    const faqIds = new Set<string>();
    for (const [faqIndex, faq] of catalog.faqs.entries()) {
      if (faqIds.has(faq.id)) {
        context.addIssue({ code: "custom", path: ["faqs", faqIndex, "id"], message: "FAQ id must be unique" });
      }
      faqIds.add(faq.id);
    }

    const certificateIds = new Set<string>();
    for (const [certificateIndex, certificate] of catalog.certificates.entries()) {
      if (certificateIds.has(certificate.id)) {
        context.addIssue({ code: "custom", path: ["certificates", certificateIndex, "id"], message: "Certificate id must be unique" });
      }
      certificateIds.add(certificate.id);
    }
  });

export type ProductCatalogInput = z.infer<typeof productCatalogSchema>;
