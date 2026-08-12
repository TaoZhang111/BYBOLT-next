import { ChevronDown } from "lucide-react";

import { alloyMaterials, localizeAlloyMaterial } from "@/content/materials";
import { fastenerCategories, localizeProductCategory, millProductCategories } from "@/content/product-catalog";
import type { Locale } from "@/i18n/config";

import Link from "./static-link";
import styles from "./catalog-dropdown.module.css";

type CatalogDropdownProps = {
  kind: "products" | "materials";
  locale: Locale;
  surface: "home" | "site";
  current?: boolean;
  onNavigate?: () => void;
};

export function CatalogDropdown({ kind, locale, surface, current, onNavigate }: CatalogDropdownProps) {
  const base = `/${locale}`;
  const labels = locale === "zh"
    ? {
        products: "产品",
        materials: "材料",
        fasteners: "紧固件类别",
        roundBars: "高温合金圆棒",
      }
    : {
        products: "Products",
        materials: "Materials",
        fasteners: "Fastener Categories",
        millProducts: "High-Temperature Alloy Mill Products",
      };

  const localizedFasteners = fastenerCategories.map((category) => localizeProductCategory(category, locale));
  const localizedMillProducts = millProductCategories.map((category) => localizeProductCategory(category, locale));
  const localizedMaterials = alloyMaterials.map((material) => localizeAlloyMaterial(material, locale));
  const isProducts = kind === "products";

  return (
    <div
      className={`${styles.catalogItem} ${surface === "home" ? styles.homeSurface : styles.siteSurface}`}
      data-catalog-menu={kind}
    >
      <Link
        className={styles.trigger}
        href={`${base}/${isProducts ? "products" : "alloys"}`}
        aria-current={current ? "page" : undefined}
        aria-haspopup="true"
        onClick={onNavigate}
      >
        {isProducts ? labels.products : labels.materials}
        <ChevronDown aria-hidden="true" />
      </Link>

      <div className={`${styles.panel} ${isProducts ? styles.productPanel : styles.materialPanel}`}>
        {isProducts ? (
          <div className={styles.productGroups} aria-label={labels.products}>
            <section className={styles.group}>
              <Link className={styles.groupHeading} href={`${base}/products`} onClick={onNavigate}>
                {labels.fasteners}
              </Link>
              <div className={styles.linkGrid}>
                {localizedFasteners.map((category) => (
                  <Link className={styles.menuLink} href={`${base}/products/${category.slug}`} key={category.slug} onClick={onNavigate}>
                    {category.name}
                  </Link>
                ))}
              </div>
            </section>

            {localizedMillProducts.length > 0 && (
              <section className={styles.group}>
                <Link className={styles.groupHeading} href={`${base}/products#mill-products`} onClick={onNavigate}>
                  {labels.millProducts}
                </Link>
                <div className={styles.linkGrid}>
                  {localizedMillProducts.map((category) => (
                    <Link
                      className={styles.menuLink}
                      href={`${base}/products/${category.slug}`}
                      key={category.slug}
                      onClick={onNavigate}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          <div className={styles.materialLinks} aria-label={labels.materials}>
            {localizedMaterials.map((material) => (
              <Link className={styles.menuLink} href={`${base}/alloys/${material.slug}`} key={material.slug} onClick={onNavigate}>
                {material.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
