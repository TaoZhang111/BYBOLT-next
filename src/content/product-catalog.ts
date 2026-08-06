import catalogSource from "./product-catalog.json";

import { productCatalogSchema } from "@/lib/products/schema";
import type { ProductCategory, ProductCatalogDocument, ProductModel } from "@/types/product-catalog";

export const siteOrigin = "https://alloyforge-fasteners-site.tao1461248574.workers.dev";

export const productCatalogDocument = productCatalogSchema.parse(catalogSource) as ProductCatalogDocument;

export const productCategories = productCatalogDocument.categories
  .filter((category) => category.status === "published")
  .map((category) => ({
    ...category,
    models: category.models
      .filter((model) => model.status === "published")
      .sort((left, right) => left.sortOrder - right.sortOrder),
  }))
  .sort((left, right) => left.sortOrder - right.sortOrder);

export const fastenerCategories = productCategories.filter((category) => category.slug !== "alloy-round-bars");
export const roundBarCategory = productCategories.find((category) => category.slug === "alloy-round-bars");

export const sharedProductProperties = productCatalogDocument.sharedProductProperties;

export function localizeProductCategory(category: ProductCategory, locale: string): ProductCategory {
  if (locale !== "zh") return category;
  const translation = category.translation.zh;
  return {
    ...category,
    ...withoutUndefined(translation),
    models: category.models.map((model) => localizeProductModel(model, locale)),
  };
}

export function localizeProductModel(model: ProductModel, locale: string): ProductModel {
  if (locale !== "zh") return model;
  return { ...model, ...withoutUndefined(model.translation.zh) };
}

function withoutUndefined<T extends object>(value: T): Partial<T> {
  return Object.fromEntries(Object.entries(value).filter(([, field]) => typeof field === "string" && field.trim().length > 0)) as Partial<T>;
}
