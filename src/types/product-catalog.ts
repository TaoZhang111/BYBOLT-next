import type { AlloyMaterial } from "./material-catalog";

export type PublicationStatus = "draft" | "published" | "archived";
export type ProductRange = "range1" | "range2";

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
  productRange: ProductRange;
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

export type NewsTranslation = Partial<{
  category: string;
  title: string;
  excerpt: string;
  body: string;
  imageAlt: string;
  seoTitle: string;
  seoDescription: string;
}>;

export type NewsArticle = {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  body: string;
  publishedAt: string;
  image?: string;
  imageAlt?: string;
  status: PublicationStatus;
  pinned: boolean;
  sortOrder: number;
  seoTitle?: string;
  seoDescription?: string;
  translation: { zh: NewsTranslation };
};

export type FaqTranslation = Partial<{
  question: string;
  answer: string;
}>;

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  status: PublicationStatus;
  sortOrder: number;
  translation: { zh: FaqTranslation };
};

export type QualityCertificateTranslation = Partial<{
  title: string;
  description: string;
  alt: string;
}>;

export type QualityCertificate = {
  id: string;
  title: string;
  description: string;
  image: string;
  alt: string;
  imagePosition?: string;
  status: PublicationStatus;
  sortOrder: number;
  translation: { zh: QualityCertificateTranslation };
};

export type ContactMethodType = "email" | "phone" | "link" | "text";

export type ContactDetails = {
  id: string;
  label: string;
  value: string;
  href: string;
  type: ContactMethodType;
  status: PublicationStatus;
  sortOrder: number;
};

export type ProductCatalogDocument = {
  version: 2;
  updatedAt: string;
  categories: ProductCategory[];
  materials: AlloyMaterial[];
  news: NewsArticle[];
  faqs: FaqItem[];
  certificates: QualityCertificate[];
  contact: ContactDetails[];
  sharedProductProperties: SharedProductProperties;
};
