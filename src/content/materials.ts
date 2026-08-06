import { productCatalogDocument } from "./product-catalog";

import type { AlloyComparison, AlloyMaterial } from "@/types/material-catalog";
import type { Locale } from "@/i18n/config";

export type { AlloyComparison, AlloyMaterial } from "@/types/material-catalog";

export const allAlloyMaterials: AlloyMaterial[] = [...productCatalogDocument.materials].sort((left, right) => left.sortOrder - right.sortOrder);

export const alloyMaterials = allAlloyMaterials.filter((material) => material.status === "published");

export function getAlloyMaterial(slug: string) {
  return alloyMaterials.find((material) => material.slug === slug);
}

export function localizeAlloyMaterial(material: AlloyMaterial, locale: Locale): AlloyMaterial {
  if (locale === "en") return material;
  return { ...material, ...material.translation.zh, translation: material.translation };
}

export const comparableAlloyMaterials = alloyMaterials.filter(
  (material): material is AlloyMaterial & { comparison: AlloyComparison } => Boolean(material.comparison),
);
