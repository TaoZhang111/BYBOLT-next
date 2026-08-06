import type { AlloyMaterial } from "./material-catalog";

export type PublicationStatus = "draft" | "published" | "archived";

export type ProductTranslation = Partial<{
  name: string;
  eyebrow: string;
  description: string;
  size: string;
  length: string;
  standard: string;
  configuration: string;
  threads: string;
  alt: string;
  seoTitle: string;
  seoDescription: string;
}>;

export type CategoryTranslation = Partial<{
  name: string;
  alt: string;
  summary: string;
  intro: string;
  seoTitle: string;
  seoDescription: string;
}>;

export type ProductModel = {
  slug: string;
  name: string;
  eyebrow: string;
  description: string;
  size: string;
  length: string;
  standard: string;
  configuration: string;
  threads: string;
  image: string;
  alt: string;
  status: PublicationStatus;
  sortOrder: number;
  seoTitle?: string;
  seoDescription?: string;
  translation: { zh: ProductTranslation };
};

export type ProductCategory = {
  slug: string;
  name: string;
  index: string;
  image: string;
  alt: string;
  summary: string;
  intro: string;
  status: PublicationStatus;
  sortOrder: number;
  seoTitle?: string;
  seoDescription?: string;
  translation: { zh: CategoryTranslation };
  models: ProductModel[];
};

export type SharedProductProperties = {
  materials: string;
  dimensionalControl: string;
  inspection: string;
  documentation: string;
  unitWeight: string;
  packaging: string;
};

export type ProductCatalogDocument = {
  version: 1;
  updatedAt: string;
  categories: ProductCategory[];
  materials: AlloyMaterial[];
  sharedProductProperties: SharedProductProperties;
};
