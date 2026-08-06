import { z } from "zod";

const slugSchema = z
  .string()
  .min(2, "Slug must contain at least 2 characters")
  .max(80, "Slug cannot exceed 80 characters")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only");

const requiredCopy = z.string().min(1).max(5000);
const optionalCopy = z.string().max(5000).optional();
const stringList = z.array(z.string().min(1).max(500)).min(1).max(30);

export const alloyComparisonSchema = z.object({
  accent: z.enum(["blue", "green", "violet", "copper", "steel"]),
  symbol: z.string().min(1).max(20),
  performance: z.object({
    corrosion: z.number().int().min(0).max(100),
    tensile: z.number().int().min(0).max(100),
    temperature: z.number().int().min(0).max(100),
    oxidation: z.number().int().min(0).max(100),
  }),
  mechanical: z.object({
    tensileStrength: requiredCopy,
    yieldStrength: requiredCopy,
    elongation: requiredCopy,
    condition: requiredCopy,
  }),
  temperatureCapability: requiredCopy,
  corrosionCharacteristics: requiredCopy,
  mediaAndConditions: stringList,
  heatTreatment: requiredCopy,
  supplyCondition: requiredCopy,
  applications: stringList,
  standardsSupport: stringList,
  documentationSupport: stringList,
});

export const materialTranslationSchema = z.object({
  name: optionalCopy,
  label: optionalCopy,
  summary: optionalCopy,
  headline: optionalCopy,
  description: optionalCopy,
  positioning: optionalCopy,
  forms: optionalCopy,
  documentation: optionalCopy,
  standards: optionalCopy,
  service: optionalCopy,
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(180).optional(),
});

export const alloyMaterialSchema = z.object({
  slug: slugSchema,
  index: z.string().min(1).max(4),
  name: z.string().min(2).max(120),
  uns: z.string().min(2).max(80),
  label: z.string().min(2).max(120),
  summary: z.string().min(10).max(1200),
  headline: z.string().min(2).max(160),
  description: z.string().min(10).max(2000),
  positioning: requiredCopy,
  forms: requiredCopy,
  documentation: requiredCopy,
  standards: requiredCopy,
  service: requiredCopy,
  status: z.enum(["draft", "published", "archived"]),
  sortOrder: z.number().int().min(0).max(9999),
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(180).optional(),
  translation: z.object({ zh: materialTranslationSchema }),
  comparison: alloyComparisonSchema.optional(),
});

export const materialCatalogSchema = z.array(alloyMaterialSchema).min(1).max(80).superRefine((materials, context) => {
  const slugs = new Set<string>();
  for (const [index, material] of materials.entries()) {
    if (slugs.has(material.slug)) {
      context.addIssue({ code: "custom", path: [index, "slug"], message: "Material slug must be unique" });
    }
    slugs.add(material.slug);
  }
});
