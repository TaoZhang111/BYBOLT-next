import type { PublicationStatus } from "./product-catalog";

export type MaterialAccent = "blue" | "green" | "violet" | "copper" | "steel";

export type AlloyComparison = {
  accent: MaterialAccent;
  symbol: string;
  performance: {
    corrosion: number;
    tensile: number;
    temperature: number;
    oxidation: number;
  };
  mechanical: {
    tensileStrength: string;
    yieldStrength: string;
    elongation: string;
    condition: string;
  };
  temperatureCapability: string;
  corrosionCharacteristics: string;
  mediaAndConditions: string[];
  heatTreatment: string;
  supplyCondition: string;
  applications: string[];
  standardsSupport: string[];
  documentationSupport: string[];
};

export type MaterialTranslation = Partial<{
  name: string;
  label: string;
  summary: string;
  headline: string;
  description: string;
  positioning: string;
  forms: string;
  documentation: string;
  standards: string;
  service: string;
  seoTitle: string;
  seoDescription: string;
}>;

export type AlloyMaterial = {
  slug: string;
  index: string;
  name: string;
  uns: string;
  label: string;
  summary: string;
  headline: string;
  description: string;
  positioning: string;
  forms: string;
  documentation: string;
  standards: string;
  service: string;
  status: PublicationStatus;
  sortOrder: number;
  seoTitle?: string;
  seoDescription?: string;
  translation: { zh: MaterialTranslation };
  comparison?: AlloyComparison;
};
