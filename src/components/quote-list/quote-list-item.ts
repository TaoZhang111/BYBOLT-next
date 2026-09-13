export type QuoteListItem = {
  id: string;
  categoryName: string;
  productName: string;
  categorySlug: string;
  productSlug: string;
  description: string;
  image: string;
  catalogSize: string;
  catalogStandard: string;
  threads: string;
  material: string;
  requestedSize: string;
  standard: string;
  quantity: string;
  quantityUnit: "pcs" | "sets" | "kg";
  notes: string;
};

export function createCatalogQuoteItem(input: {
  categoryName: string;
  productName: string;
  categorySlug: string;
  productSlug: string;
  description: string;
  image: string;
  catalogSize: string;
  catalogStandard: string;
  threads: string;
}): QuoteListItem {
  return { id: `${input.categorySlug}:${input.productSlug}`, ...input, material: "", requestedSize: "", standard: input.catalogStandard, quantity: "1", quantityUnit: "pcs", notes: "" };
}
