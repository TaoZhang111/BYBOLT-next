import { ChevronDown } from "lucide-react";

import { alloyMaterials, localizeAlloyMaterial } from "@/content/materials";
import { fastenerCategories, localizeManufacturingProcess, localizeProductCategory, manufacturingProcesses, millProductCategories } from "@/content/product-catalog";
import type { Locale } from "@/i18n/config";

import Link from "./static-link";
import styles from "./catalog-dropdown.module.css";

type CatalogDropdownProps = {
  kind: "products" | "materials" | "custom";
  locale: Locale;
  surface: "home" | "site";
  current?: boolean;
  onNavigate?: () => void;
};

export function CatalogDropdown({ kind, locale, surface, current, onNavigate }: CatalogDropdownProps) {
  const base = `/${locale}`;
  const labels = locale === "zh"
    ? {
        products: "\u4ea7\u54c1",
        materials: "\u6750\u6599",
        custom: "\u5b9a\u5236",
        fasteners: "\u7d27\u56fa\u4ef6\u7c7b\u522b",
        millProducts: "\u9ad8\u6e29\u5408\u91d1\u68d2\u6750",
        compare: "\u5bf9\u6bd4\u6750\u6599",
      }
    : {
        products: "Products",
        materials: "Materials",
        custom: "Custom",
        fasteners: "Fastener Categories",
        millProducts: "High-Temperature Alloy Mill Products",
        compare: "Compare Materials",
      };

  const localizedFasteners = fastenerCategories.map((category) => localizeProductCategory(category, locale));
  const localizedMillProducts = millProductCategories.map((category) => localizeProductCategory(category, locale));
  const localizedMaterials = alloyMaterials.map((material) => localizeAlloyMaterial(material, locale));
  const localizedProcesses = manufacturingProcesses.map((process) => localizeManufacturingProcess(process, locale));
  const isProducts = kind === "products";
  const isMaterials = kind === "materials";

  return (
    <div className={`${styles.catalogItem} ${surface === "home" ? styles.homeSurface : styles.siteSurface}`} data-catalog-menu={kind}>
      <Link
        className={styles.trigger}
        href={`${base}/${isProducts ? "products" : isMaterials ? "alloys" : "capabilities"}`}
        aria-current={current ? "page" : undefined}
        aria-haspopup="true"
        onClick={onNavigate}
      >
        {isProducts ? labels.products : isMaterials ? labels.materials : labels.custom}
        <ChevronDown aria-hidden="true" />
      </Link>

      <div className={`${styles.panel} ${isProducts ? styles.productPanel : styles.materialPanel}`}>
        {isProducts ? (
          <div className={styles.productGroups} aria-label={labels.products}>
            <section className={styles.group}>
              <Link className={styles.groupHeading} href={`${base}/products`} onClick={onNavigate}>{labels.fasteners}</Link>
              <div className={styles.linkGrid}>
                {localizedFasteners.map((category) => <Link className={styles.menuLink} href={`${base}/products/${category.slug}`} key={category.slug} onClick={onNavigate}>{category.name}</Link>)}
              </div>
            </section>
            {localizedMillProducts.length > 0 && <section className={styles.group}>
              <Link className={styles.groupHeading} href={`${base}/products#mill-products`} onClick={onNavigate}>{labels.millProducts}</Link>
              <div className={styles.linkGrid}>
                {localizedMillProducts.map((category) => <Link className={styles.menuLink} href={`${base}/products/${category.slug}`} key={category.slug} onClick={onNavigate}>{category.name}</Link>)}
              </div>
            </section>}
          </div>
        ) : isMaterials ? (
          <div className={styles.materialLinks} aria-label={labels.materials}>
            {localizedMaterials.map((material) => <Link className={styles.menuLink} href={`${base}/alloys/${material.slug}`} key={material.slug} onClick={onNavigate}>{material.name}</Link>)}
            <Link className={`${styles.menuLink} ${styles.compareLink}`} href={`${base}/alloys/compare/`} onClick={onNavigate}>{labels.compare}</Link>
          </div>
        ) : (
          <div className={styles.materialLinks} aria-label={labels.custom}>
            {localizedProcesses.map((process) => <Link className={styles.menuLink} href={`${base}/capabilities/${process.slug}/`} key={process.slug} onClick={onNavigate}><span className={styles.processNumber}>{process.number}</span>{process.title}</Link>)}
          </div>
        )}
      </div>
    </div>
  );
}
