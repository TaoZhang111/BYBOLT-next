import { z } from "zod";

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

export const productCatalogSchema = z
  .object({
    version: z.literal(1),
    updatedAt: z.iso.datetime(),
    categories: z.array(productCategorySchema).min(1).max(40),
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
  });

export type ProductCatalogInput = z.infer<typeof productCatalogSchema>;
