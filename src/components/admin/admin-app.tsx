"use client";

/* eslint-disable @next/next/no-img-element */

import {
  Archive,
  Atom,
  Check,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  CloudUpload,
  Copy,
  Eye,
  EyeOff,
  ExternalLink,
  FileImage,
  Folder,
  GitBranch,
  LoaderCircle,
  LogOut,
  Menu,
  Package,
  Plus,
  RotateCcw,
  Save,
  Search,
  Settings2,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { productCatalogDocument } from "@/content/product-catalog";
import {
  adminApiUrl,
  captureAdminSession,
  clearAdminSession,
  getLoginUrl,
  getLogoutUrl,
  getRepositoryCatalog,
  getSession,
  publishRepositoryCatalog,
  type AdminSession,
  type PendingAsset,
} from "@/lib/admin/api";
import { prepareProductImage } from "@/lib/admin/image";
import { productCatalogSchema } from "@/lib/products/schema";
import type { AlloyComparison, AlloyMaterial, MaterialAccent } from "@/types/material-catalog";
import type { ProductCatalogDocument, ProductCategory, ProductModel, PublicationStatus } from "@/types/product-catalog";

import styles from "./admin.module.css";

const DRAFT_KEY = "bybolt-admin-product-draft-v1";
const cloneCatalog = (value: ProductCatalogDocument): ProductCatalogDocument => structuredClone(value);

function toggleSetValue<T>(current: Set<T>, value: T) {
  const next = new Set(current);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

type Selection = { kind: "category"; categorySlug: string } | { kind: "product"; categorySlug: string; productSlug: string };
type LocaleTab = "en" | "zh";
type CatalogMode = "products" | "materials";
type ProductRangeKey = "range1" | "range2";
type MaterialFieldValue = string | number | string[] | AlloyComparison | undefined;

const ROUND_BAR_CATEGORY_SLUG = "alloy-round-bars";

function compareProductCategories(left: ProductCategory, right: ProductCategory) {
  const archivedDifference = Number(left.status === "archived") - Number(right.status === "archived");
  return archivedDifference || left.sortOrder - right.sortOrder;
}

export function AdminApp() {
  const [catalog, setCatalog] = useState(() => cloneCatalog(productCatalogDocument));
  const [baseline, setBaseline] = useState(() => cloneCatalog(productCatalogDocument));
  const [selection, setSelection] = useState<Selection>(() => ({
    kind: "product",
    categorySlug: productCatalogDocument.categories[0].slug,
    productSlug: productCatalogDocument.categories[0].models[0].slug,
  }));
  const [localeTab, setLocaleTab] = useState<LocaleTab>("en");
  const [catalogMode, setCatalogMode] = useState<CatalogMode>("products");
  const [selectedMaterialSlug, setSelectedMaterialSlug] = useState(productCatalogDocument.materials[0].slug);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [expandedRanges, setExpandedRanges] = useState<Set<ProductRangeKey>>(() => new Set(["range1", "range2"]));
  const [session, setSession] = useState<AdminSession>({ authenticated: false });
  const [connection, setConnection] = useState<"loading" | "offline" | "ready" | "error">("loading");
  const [repositorySha, setRepositorySha] = useState("");
  const [supportsMaterialCatalog, setSupportsMaterialCatalog] = useState(false);
  const [pendingAssets, setPendingAssets] = useState<PendingAsset[]>([]);
  const [commitMessage, setCommitMessage] = useState("Update site catalog");
  const [publishing, setPublishing] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const initialized = useRef(false);
  const categoryStatusBeforeHide = useRef(new Map<string, PublicationStatus>());

  const validation = useMemo(() => productCatalogSchema.safeParse(catalog), [catalog]);
  const isDirty = useMemo(() => JSON.stringify(catalog) !== JSON.stringify(baseline) || pendingAssets.length > 0, [baseline, catalog, pendingAssets.length]);
  const publishedCount = useMemo(
    () => catalog.categories
      .filter((category) => category.status === "published")
      .flatMap((category) => category.models)
      .filter((product) => product.status === "published").length,
    [catalog],
  );
  const publishedMaterialCount = useMemo(
    () => catalog.materials.filter((material) => material.status === "published").length,
    [catalog.materials],
  );

  useEffect(() => {
    let active = true;
    async function initialize() {
      captureAdminSession();
      const localDraft = readLocalDraft();
      if (!adminApiUrl) {
        if (localDraft) setCatalog(localDraft);
        setConnection("offline");
        initialized.current = true;
        return;
      }
      try {
        const nextSession = await getSession();
        if (!active) return;
        setSession(nextSession);
        if (!nextSession.authenticated) {
          if (localDraft) setCatalog(localDraft);
          setConnection("offline");
          initialized.current = true;
          return;
        }
        const response = await getRepositoryCatalog();
        if (!active) return;
        const repositoryCatalog = normalizeCatalog(response.catalog);
        setBaseline(repositoryCatalog);
        setCatalog(localDraft && localDraft.updatedAt > repositoryCatalog.updatedAt ? localDraft : repositoryCatalog);
        setRepositorySha(response.commitSha);
        setSupportsMaterialCatalog(response.capabilities?.includes("materials") ?? false);
        setConnection("ready");
      } catch (error) {
        if (!active) return;
        if (localDraft) setCatalog(localDraft);
        setConnection("error");
        setNotice({ type: "error", text: error instanceof Error ? error.message : "Unable to connect to GitHub." });
      } finally {
        initialized.current = true;
      }
    }
    void initialize();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!initialized.current || !isDirty) return;
    const handle = window.setTimeout(() => localStorage.setItem(DRAFT_KEY, JSON.stringify(catalog)), 500);
    return () => window.clearTimeout(handle);
  }, [catalog, isDirty]);

  const mutateCatalog = useCallback((mutator: (draft: ProductCatalogDocument) => void) => {
    setCatalog((current) => {
      const next = cloneCatalog(current);
      mutator(next);
      next.updatedAt = new Date().toISOString();
      return next;
    });
  }, []);

  function select(next: Selection) {
    setSelection(next);
    setMobileMenu(false);
  }

  function switchCatalog(next: CatalogMode) {
    setCatalogMode(next);
    setQuery("");
    setMobileMenu(false);
  }

  function resetDraft() {
    if (!window.confirm("Discard every local change and return to the last repository version?")) return;
    pendingAssets.forEach((asset) => URL.revokeObjectURL(asset.previewUrl));
    setPendingAssets([]);
    setCatalog(cloneCatalog(baseline));
    localStorage.removeItem(DRAFT_KEY);
    setNotice({ type: "success", text: "Local changes discarded." });
  }

  function saveLocalDraft() {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(catalog));
    setNotice({ type: "success", text: "Draft saved in this browser." });
  }

  function disconnect() {
    clearAdminSession();
    window.location.assign(getLogoutUrl(windowLocation()));
  }

  async function publish() {
    if (!validation.success) {
      setNotice({ type: "error", text: `Resolve ${validation.error.issues.length} validation issue${validation.error.issues.length === 1 ? "" : "s"} before publishing.` });
      return;
    }
    if (!session.authenticated) {
      setNotice({ type: "error", text: "Connect the authorized GitHub account before publishing." });
      return;
    }
    if (!supportsMaterialCatalog) {
      setNotice({ type: "error", text: "Deploy the updated Admin API before publishing this catalog version. Your local draft is safe." });
      return;
    }
    setPublishing(true);
    setNotice(null);
    try {
      const finalCatalog = { ...catalog, updatedAt: new Date().toISOString() };
      const response = await publishRepositoryCatalog(finalCatalog, pendingAssets, commitMessage.trim() || "Update product catalog", repositorySha);
      pendingAssets.forEach((asset) => URL.revokeObjectURL(asset.previewUrl));
      setPendingAssets([]);
      setCatalog(finalCatalog);
      setBaseline(cloneCatalog(finalCatalog));
      setRepositorySha(response.commitSha);
      localStorage.removeItem(DRAFT_KEY);
      setNotice({ type: "success", text: `Published commit ${response.commitSha.slice(0, 7)}. Cloudflare can now build the update.` });
    } catch (error) {
      setNotice({ type: "error", text: error instanceof Error ? error.message : "Publish failed." });
    } finally {
      setPublishing(false);
    }
  }

  function addProduct(categorySlug: string) {
    const suffix = Date.now().toString().slice(-6);
    const product: ProductModel = {
      slug: `new-product-${suffix}`,
      name: "New Product",
      eyebrow: "Drawing-based fastener",
      description: "Add a concise description of this product and its intended industrial service.",
      size: "Drawing-defined",
      length: "Drawing-defined",
      standard: "Customer drawing and agreed specification",
      configuration: "Project-specific",
      threads: "Standard or special thread forms",
      image: catalog.categories.find((category) => category.slug === categorySlug)?.image ?? "/assets/product-fasteners.jpg",
      alt: "New BYBOLT alloy fastener product",
      status: "draft",
      sortOrder: 999,
      translation: { zh: {} },
    };
    mutateCatalog((draft) => { draft.categories.find((category) => category.slug === categorySlug)?.models.push(product); });
    setExpanded((current) => new Set(current).add(categorySlug));
    select({ kind: "product", categorySlug, productSlug: product.slug });
  }

  function duplicateProduct(categorySlug: string, productSlug: string) {
    const source = catalog.categories.find((category) => category.slug === categorySlug)?.models.find((product) => product.slug === productSlug);
    if (!source) return;
    const duplicate = structuredClone(source);
    duplicate.slug = `${source.slug}-copy-${Date.now().toString().slice(-4)}`;
    duplicate.name = `${source.name} Copy`;
    duplicate.status = "draft";
    duplicate.sortOrder = source.sortOrder + 1;
    mutateCatalog((draft) => { draft.categories.find((category) => category.slug === categorySlug)?.models.push(duplicate); });
    select({ kind: "product", categorySlug, productSlug: duplicate.slug });
  }

  function deleteProduct(categorySlug: string, productSlug: string) {
    const product = catalog.categories.find((category) => category.slug === categorySlug)?.models.find((item) => item.slug === productSlug);
    if (!product || !window.confirm(`Delete ${product.name}? The change is not permanent until published.`)) return;
    mutateCatalog((draft) => {
      const category = draft.categories.find((item) => item.slug === categorySlug);
      if (category) category.models = category.models.filter((item) => item.slug !== productSlug);
    });
    select({ kind: "category", categorySlug });
  }

  function hideCategory(categorySlug: string) {
    const category = catalog.categories.find((item) => item.slug === categorySlug);
    if (!category || category.status === "archived") return;
    categoryStatusBeforeHide.current.set(categorySlug, category.status);
    mutateCatalog((draft) => {
      const target = draft.categories.find((item) => item.slug === categorySlug);
      if (target) target.status = "archived";
    });
    setExpanded((current) => {
      const next = new Set(current);
      next.delete(categorySlug);
      return next;
    });
    setNotice({ type: "success", text: `${category.name} marked hidden and moved to the bottom. Publish to remove it from public pages.` });
  }

  function restoreCategory(categorySlug: string) {
    const category = catalog.categories.find((item) => item.slug === categorySlug);
    if (!category || category.status !== "archived") return;
    const repositoryStatus = baseline.categories.find((item) => item.slug === categorySlug)?.status;
    const previousStatus = categoryStatusBeforeHide.current.get(categorySlug);
    const restoredStatus = previousStatus && previousStatus !== "archived"
      ? previousStatus
      : repositoryStatus && repositoryStatus !== "archived"
        ? repositoryStatus
        : "draft";
    mutateCatalog((draft) => {
      const target = draft.categories.find((item) => item.slug === categorySlug);
      if (target) target.status = restoredStatus;
    });
    categoryStatusBeforeHide.current.delete(categorySlug);
    setNotice({ type: "success", text: `${category.name} restored as ${restoredStatus}.` });
  }

  function deleteCategory(categorySlug: string) {
    const category = catalog.categories.find((item) => item.slug === categorySlug);
    if (!category) return;
    if (category.models.length > 0) {
      setNotice({ type: "error", text: `Delete all ${category.models.length} products in ${category.name} before deleting the folder.` });
      return;
    }
    if (!window.confirm(`Delete the empty ${category.name} folder? The change is not permanent until published.`)) return;
    mutateCatalog((draft) => {
      draft.categories = draft.categories.filter((item) => item.slug !== categorySlug);
    });
    setExpanded((current) => {
      const next = new Set(current);
      next.delete(categorySlug);
      return next;
    });
    categoryStatusBeforeHide.current.delete(categorySlug);
    const fallback = catalog.categories
      .filter((item) => item.slug !== categorySlug)
      .sort(compareProductCategories)[0];
    if (fallback) select({ kind: "category", categorySlug: fallback.slug });
    setNotice({ type: "success", text: `${category.name} folder deleted from the local draft.` });
  }

  function addCategory() {
    const suffix = Date.now().toString().slice(-6);
    const category: ProductCategory = {
      slug: `new-category-${suffix}`,
      name: "New Category",
      index: String(catalog.categories.length + 1).padStart(2, "0"),
      image: "/assets/product-fasteners.jpg",
      alt: "BYBOLT alloy fastener category",
      summary: "Add a concise summary for this product category.",
      intro: "Add the category introduction shown above its complete product range.",
      status: "draft",
      sortOrder: catalog.categories.length + 1,
      translation: { zh: {} },
      models: [],
    };
    mutateCatalog((draft) => { draft.categories.push(category); });
    setExpanded((current) => new Set(current).add(category.slug));
    setExpandedRanges((current) => new Set(current).add("range1"));
    select({ kind: "category", categorySlug: category.slug });
  }

  function addMaterial() {
    const suffix = Date.now().toString().slice(-6);
    const material: AlloyMaterial = {
      slug: `new-material-${suffix}`,
      index: String(catalog.materials.length + 1).padStart(2, "0"),
      name: "New Alloy Material",
      uns: "UNS designation",
      label: "Material positioning",
      summary: "Add a concise description of the alloy and the service conditions it is intended to address.",
      headline: "New Alloy Fasteners",
      description: "Describe how this material is positioned for fasteners, which operating conditions matter and what must be confirmed with the order.",
      positioning: "Application-specific service",
      forms: "Bolts, studs, nuts, washers, machined parts and round bar",
      documentation: "MTC / MTR and testing as specified",
      standards: "Applicable material and fastener specifications",
      service: "Project-specific industrial equipment",
      status: "draft",
      sortOrder: catalog.materials.length + 1,
      translation: { zh: {} },
      comparison: createDefaultComparison(),
    };
    mutateCatalog((draft) => { draft.materials.push(material); });
    setSelectedMaterialSlug(material.slug);
    switchCatalog("materials");
  }

  function duplicateMaterial(materialSlug: string) {
    const source = catalog.materials.find((material) => material.slug === materialSlug);
    if (!source) return;
    const duplicate = structuredClone(source);
    duplicate.slug = `${source.slug}-copy-${Date.now().toString().slice(-4)}`;
    duplicate.name = `${source.name} Copy`;
    duplicate.status = "draft";
    duplicate.sortOrder = source.sortOrder + 1;
    mutateCatalog((draft) => { draft.materials.push(duplicate); });
    setSelectedMaterialSlug(duplicate.slug);
  }

  function deleteMaterial(materialSlug: string) {
    const material = catalog.materials.find((item) => item.slug === materialSlug);
    if (!material || !window.confirm(`Delete ${material.name}? The change is not permanent until published.`)) return;
    mutateCatalog((draft) => { draft.materials = draft.materials.filter((item) => item.slug !== materialSlug); });
    const fallback = catalog.materials.find((item) => item.slug !== materialSlug);
    if (fallback) setSelectedMaterialSlug(fallback.slug);
  }

  function updateSelectedMaterial(field: string, value: MaterialFieldValue) {
    if (!selectedMaterial) return;
    const previousSlug = selectedMaterial.slug;
    mutateCatalog((draft) => updateMaterial(draft, previousSlug, localeTab, field, value));
    if (field === "slug" && typeof value === "string" && value) setSelectedMaterialSlug(value);
  }

  async function uploadImage(file: File, slug: string, onReady: (sitePath: string) => void) {
    try {
      const asset = await prepareProductImage(file, slug);
      setPendingAssets((current) => [...current, asset]);
      onReady(`/${asset.path.replace(/^public\//, "")}`);
      setNotice({ type: "success", text: "Image optimized to WebP and queued for the next Git commit." });
    } catch (error) {
      setNotice({ type: "error", text: error instanceof Error ? error.message : "Image processing failed." });
    }
  }

  function updateSelectedCategory(field: string, value: string | number) {
    if (!selectedCategory) return;
    const previousSlug = selectedCategory.slug;
    mutateCatalog((draft) => updateCategory(draft, previousSlug, localeTab, field, value));
    if (field === "slug" && typeof value === "string" && value) {
      setExpanded((current) => { const next = new Set(current); next.delete(previousSlug); next.add(value); return next; });
      setSelection({ kind: "category", categorySlug: value });
    }
  }

  function updateSelectedProduct(field: string, value: string | number) {
    if (!selectedCategory || !selectedProduct) return;
    const categorySlug = selectedCategory.slug;
    const previousSlug = selectedProduct.slug;
    mutateCatalog((draft) => updateProduct(draft, categorySlug, previousSlug, localeTab, field, value));
    if (field === "slug" && typeof value === "string" && value) {
      setSelection({ kind: "product", categorySlug, productSlug: value });
    }
  }

  const selectedCategory = catalog.categories.find((category) => category.slug === selection.categorySlug);
  const selectedProduct = selection.kind === "product" ? selectedCategory?.models.find((product) => product.slug === selection.productSlug) : undefined;
  const selectedMaterial = catalog.materials.find((material) => material.slug === selectedMaterialSlug) ?? catalog.materials[0];
  const productRange1Categories = catalog.categories
    .filter((category) => category.slug !== ROUND_BAR_CATEGORY_SLUG)
    .sort(compareProductCategories);
  const productRange2Categories = catalog.categories
    .filter((category) => category.slug === ROUND_BAR_CATEGORY_SLUG)
    .sort(compareProductCategories);

  return (
    <main className={styles.admin}>
      <header className={styles.topbar}>
        <button className={styles.mobileMenuButton} type="button" aria-label="Open product navigation" onClick={() => setMobileMenu(true)}><Menu /></button>
        <a className={styles.brand} href="/en/" target="_blank" rel="noreferrer"><span>BY</span>BOLT <b>Admin</b></a>
        <div className={styles.topbarStatus}>
          <span className={`${styles.connectionDot} ${styles[connection]}`} aria-hidden="true" />
          {connection === "ready" ? `${session.repository ?? "GitHub connected"}${repositorySha ? ` · ${repositorySha.slice(0, 7)}` : ""}` : connection === "loading" ? "Connecting" : "Local draft mode"}
        </div>
        <div className={styles.topbarActions}>
          {isDirty && <span className={styles.unsaved}>Unsaved changes</span>}
          <button className={styles.iconButton} type="button" title="Discard local changes" disabled={!isDirty} onClick={resetDraft}><RotateCcw /></button>
          <button className={styles.secondaryButton} type="button" onClick={saveLocalDraft}><Save /> Save draft</button>
          <button className={styles.publishButton} type="button" disabled={publishing || !isDirty} onClick={() => void publish()}>
            {publishing ? <LoaderCircle className={styles.spin} /> : <CloudUpload />} Publish
          </button>
          {session.authenticated ? <button className={styles.iconButton} type="button" title="Sign out" onClick={disconnect}><LogOut /></button> : adminApiUrl ? <a className={styles.githubButton} href={getLoginUrl(windowLocation())}><GitBranch /> Connect</a> : null}
        </div>
      </header>

      {notice && <div className={`${styles.notice} ${styles[notice.type]}`} role="status">{notice.type === "success" ? <Check /> : <CircleAlert />}<span>{notice.text}</span><button type="button" aria-label="Dismiss notification" onClick={() => setNotice(null)}><X /></button></div>}

      <div className={styles.workspace}>
        <aside className={`${styles.sidebar} ${mobileMenu ? styles.sidebarOpen : ""}`}>
          <div className={styles.sidebarHeader}>
            <div><p>Catalog</p><strong>{catalogMode === "products" ? `${publishedCount} published products` : `${publishedMaterialCount} published materials`}</strong></div>
            <button className={styles.mobileClose} type="button" aria-label="Close product navigation" onClick={() => setMobileMenu(false)}><X /></button>
          </div>
          <div className={styles.catalogTabs} aria-label="Catalog type">
            <button className={catalogMode === "products" ? styles.activeCatalogTab : ""} type="button" onClick={() => switchCatalog("products")}><Package />Products</button>
            <button className={catalogMode === "materials" ? styles.activeCatalogTab : ""} type="button" onClick={() => switchCatalog("materials")}><Atom />Materials</button>
          </div>
          <label className={styles.search}><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={catalogMode === "products" ? "Search products" : "Search materials"} /></label>
          {catalogMode === "products" ? <nav className={styles.catalogNav} aria-label="Product catalog editor">
            <ProductRangeGroup
              id="range1"
              label="Product range1"
              categories={productRange1Categories}
              query={query}
              expanded={expandedRanges.has("range1")}
              expandedCategories={expanded}
              selection={selection}
              onToggle={() => setExpandedRanges((current) => toggleSetValue(current, "range1"))}
              onToggleCategory={(categorySlug) => setExpanded((current) => toggleSetValue(current, categorySlug))}
              onSelect={select}
              onAddProduct={addProduct}
              onAddCategory={addCategory}
            />
            <ProductRangeGroup
              id="range2"
              label="Product range2"
              categories={productRange2Categories}
              query={query}
              expanded={expandedRanges.has("range2")}
              expandedCategories={expanded}
              selection={selection}
              onToggle={() => setExpandedRanges((current) => toggleSetValue(current, "range2"))}
              onToggleCategory={(categorySlug) => setExpanded((current) => toggleSetValue(current, categorySlug))}
              onSelect={select}
              onAddProduct={addProduct}
            />
          </nav> : <nav className={`${styles.catalogNav} ${styles.materialNav}`} aria-label="Material catalog editor">
            {catalog.materials
              .filter((material) => `${material.name} ${material.uns} ${material.slug}`.toLowerCase().includes(query.toLowerCase()))
              .sort((left, right) => left.sortOrder - right.sortOrder)
              .map((material) => (
                <button className={`${styles.productRow} ${selectedMaterial?.slug === material.slug ? styles.activeRow : ""}`} type="button" key={material.slug} onClick={() => { setSelectedMaterialSlug(material.slug); setMobileMenu(false); }}>
                  <Atom /><span><b>{material.name}</b><small>{material.uns}</small></span><StatusMark status={material.status} />
                </button>
              ))}
          </nav>}
          <button className={styles.addCategory} type="button" onClick={catalogMode === "products" ? addCategory : addMaterial}><Plus /> {catalogMode === "products" ? "Add Product range1 category" : "Add material"}</button>
        </aside>

        <section className={styles.editorArea}>
          <div className={styles.editorHeader}>
            <div>
              <p>{catalogMode === "materials" ? "Material catalog" : selection.kind === "product" ? selectedCategory?.name : "Category settings"}</p>
              <h1>{catalogMode === "materials" ? selectedMaterial?.name : selection.kind === "product" ? selectedProduct?.name : selectedCategory?.name}</h1>
            </div>
            <div className={styles.localeTabs} aria-label="Content language">
              <button className={localeTab === "en" ? styles.activeLocale : ""} type="button" onClick={() => setLocaleTab("en")}>English</button>
              <button className={localeTab === "zh" ? styles.activeLocale : ""} type="button" onClick={() => setLocaleTab("zh")}>中文</button>
            </div>
          </div>
          {catalogMode === "products" && selectedCategory && selection.kind === "category" && <CategoryEditor category={selectedCategory} locale={localeTab} lockedSlug={productCatalogDocument.categories.some((item) => item.slug === selectedCategory.slug && item.status === "published")} update={updateSelectedCategory} upload={(file) => void uploadImage(file, selectedCategory.slug, (path) => mutateCatalog((draft) => updateCategory(draft, selectedCategory.slug, "en", "image", path)))} hide={() => hideCategory(selectedCategory.slug)} restore={() => restoreCategory(selectedCategory.slug)} remove={() => deleteCategory(selectedCategory.slug)} />}
          {catalogMode === "products" && selectedCategory && selectedProduct && selection.kind === "product" && <ProductEditor product={selectedProduct} locale={localeTab} lockedSlug={productCatalogDocument.categories.some((category) => category.slug === selectedCategory.slug && category.models.some((item) => item.slug === selectedProduct.slug && item.status === "published"))} update={updateSelectedProduct} upload={(file) => void uploadImage(file, selectedProduct.slug, (path) => mutateCatalog((draft) => updateProduct(draft, selectedCategory.slug, selectedProduct.slug, "en", "image", path)))} duplicate={() => duplicateProduct(selectedCategory.slug, selectedProduct.slug)} remove={() => deleteProduct(selectedCategory.slug, selectedProduct.slug)} />}
          {catalogMode === "materials" && selectedMaterial && <MaterialEditor material={selectedMaterial} locale={localeTab} lockedSlug={productCatalogDocument.materials.some((item) => item.slug === selectedMaterial.slug && item.status === "published")} update={updateSelectedMaterial} duplicate={() => duplicateMaterial(selectedMaterial.slug)} remove={() => deleteMaterial(selectedMaterial.slug)} />}
        </section>

        <aside className={styles.previewRail}>
          <div className={styles.previewHeader}><div><p>Live preview</p><strong>{localeTab === "zh" ? "Chinese with English fallback" : "English content"}</strong></div><a href={catalogMode === "materials" && selectedMaterial ? `/en/alloys/${selectedMaterial.slug}/` : selectedCategory ? `/en/products/${selectedCategory.slug}/${selectedProduct?.slug ?? ""}` : "/en/products/"} target="_blank" rel="noreferrer" title="Open public page"><ExternalLink /></a></div>
          {catalogMode === "products" && selectedCategory && <CatalogPreview category={selectedCategory} product={selectedProduct} locale={localeTab} assets={pendingAssets} />}
          {catalogMode === "materials" && selectedMaterial && <MaterialPreview material={selectedMaterial} locale={localeTab} />}
          <div className={styles.validationPanel}>
            <div className={styles.validationHeading}>{validation.success ? <Check /> : <CircleAlert />}<div><strong>{validation.success ? "Ready to publish" : `${validation.error.issues.length} validation issues`}</strong><span>{pendingAssets.length} image{pendingAssets.length === 1 ? "" : "s"} queued</span></div></div>
            {!validation.success && <ul>{validation.error.issues.slice(0, 5).map((issue, index) => <li key={`${issue.path.join("-")}-${index}`}>{issue.message}</li>)}</ul>}
            <label className={styles.commitField}>Commit message<input value={commitMessage} onChange={(event) => setCommitMessage(event.target.value)} maxLength={72} /></label>
            {!adminApiUrl && <div className={styles.setupHint}><Settings2 /><p><strong>Git API not configured</strong><span>Editing and browser drafts work now. Add `NEXT_PUBLIC_ADMIN_API_URL` after deploying the included Worker to enable GitHub publishing.</span></p></div>}
            {adminApiUrl && !session.authenticated && <a className={styles.connectPanelButton} href={getLoginUrl(windowLocation())}><GitBranch /> Sign in with authorized GitHub account</a>}
          </div>
        </aside>
      </div>
    </main>
  );
}

function ProductRangeGroup({
  id,
  label,
  categories,
  query,
  expanded,
  expandedCategories,
  selection,
  onToggle,
  onToggleCategory,
  onSelect,
  onAddProduct,
  onAddCategory,
}: {
  id: ProductRangeKey;
  label: string;
  categories: ProductCategory[];
  query: string;
  expanded: boolean;
  expandedCategories: Set<string>;
  selection: Selection;
  onToggle: () => void;
  onToggleCategory: (categorySlug: string) => void;
  onSelect: (selection: Selection) => void;
  onAddProduct: (categorySlug: string) => void;
  onAddCategory?: () => void;
}) {
  const normalizedQuery = query.trim().toLowerCase();
  const visibleCategories = categories
    .map((category) => {
      const products = category.models
        .filter((product) => `${product.name} ${product.slug}`.toLowerCase().includes(normalizedQuery))
        .sort((left, right) => left.sortOrder - right.sortOrder);
      const categoryMatches = `${category.name} ${category.slug}`.toLowerCase().includes(normalizedQuery);
      return normalizedQuery && products.length === 0 && !categoryMatches ? null : { category, products };
    })
    .filter((entry): entry is { category: ProductCategory; products: ProductModel[] } => entry !== null);

  if (normalizedQuery && visibleCategories.length === 0) return null;
  const isRangeExpanded = expanded || Boolean(normalizedQuery);

  return <div className={styles.rangeGroup} data-product-range={id}>
    <div className={styles.rangeRow}>
      <button className={styles.expandButton} type="button" aria-label={`${isRangeExpanded ? "Collapse" : "Expand"} ${label}`} onClick={onToggle}>{isRangeExpanded ? <ChevronDown /> : <ChevronRight />}</button>
      <button className={styles.rangeSelect} type="button" onClick={onToggle}>
        <Folder />
        <span><b>{label}</b><small>{categories.length} categor{categories.length === 1 ? "y" : "ies"}</small></span>
      </button>
      {onAddCategory ? <button className={styles.addInline} type="button" title={`Add category to ${label}`} aria-label={`Add category to ${label}`} onClick={onAddCategory}><Plus /></button> : <span />}
    </div>
    {isRangeExpanded && <div className={styles.rangeCategories}>
      {visibleCategories.map(({ category, products }) => {
        const isCategoryExpanded = expandedCategories.has(category.slug) || Boolean(normalizedQuery);
        const isHidden = category.status === "archived";
        return <div className={`${styles.categoryGroup} ${isHidden ? styles.hiddenCategory : ""}`} data-category-slug={category.slug} data-category-status={category.status} key={category.slug}>
          <div className={`${styles.categoryRow} ${selection.kind === "category" && selection.categorySlug === category.slug ? styles.activeRow : ""}`}>
            <button className={styles.expandButton} type="button" aria-label={`${isCategoryExpanded ? "Collapse" : "Expand"} ${category.name}`} onClick={() => onToggleCategory(category.slug)}>{isCategoryExpanded ? <ChevronDown /> : <ChevronRight />}</button>
            <button className={styles.categorySelect} type="button" aria-label={`Edit ${category.name} category`} onClick={() => onSelect({ kind: "category", categorySlug: category.slug })}><Folder /><span>{category.name}</span><small>{category.models.length}</small></button>
            <button className={styles.addInline} type="button" title={`Add product to ${category.name}`} aria-label={`Add product to ${category.name}`} onClick={() => onAddProduct(category.slug)}><Plus /></button>
          </div>
          {isCategoryExpanded && <div className={styles.productRows}>
            {products.map((product) => <button className={`${styles.productRow} ${selection.kind === "product" && selection.productSlug === product.slug ? styles.activeRow : ""}`} type="button" key={product.slug} onClick={() => onSelect({ kind: "product", categorySlug: category.slug, productSlug: product.slug })}>
              <Package /><span>{product.name}</span><StatusMark status={product.status} />
            </button>)}
          </div>}
        </div>;
      })}
    </div>}
  </div>;
}

function CategoryEditor({ category, locale, lockedSlug, update, upload, hide, restore, remove }: { category: ProductCategory; locale: LocaleTab; lockedSlug: boolean; update: (field: string, value: string | number) => void; upload: (file: File) => void; hide: () => void; restore: () => void; remove: () => void }) {
  const copy = locale === "en" ? category : { ...category, ...category.translation.zh };
  const canDelete = category.models.length === 0;
  const isHidden = category.status === "archived";
  return <div className={styles.formSections}>
    <FormSection title="Category identity" description="Controls the category index page and its permanent route.">
      <div className={styles.twoColumns}><Field label="Category name" value={copy.name ?? ""} onChange={(value) => update("name", value)} /><Field label="URL slug" value={category.slug} disabled={lockedSlug} hint={lockedSlug ? "Locked to preserve the accepted URL." : undefined} onChange={(value) => update("slug", slugify(value))} /></div>
      {locale === "en" && <div className={styles.threeColumns}><Field label="Index" value={category.index} onChange={(value) => update("index", value)} /><Field label="Sort order" type="number" value={String(category.sortOrder)} onChange={(value) => update("sortOrder", Number(value))} /><StatusField value={category.status} onChange={(value) => update("status", value)} /></div>}
      <Field label="Summary" multiline value={copy.summary ?? ""} onChange={(value) => update("summary", value)} />
      <Field label="Category introduction" multiline rows={4} value={copy.intro ?? ""} onChange={(value) => update("intro", value)} />
    </FormSection>
    {locale === "en" && <FormSection title="Category image" description="Used on the category card and as fallback media for products."><ImageField path={category.image} alt={category.alt} onAltChange={(value) => update("alt", value)} onUpload={upload} /></FormSection>}
    <FormSection title="Search appearance" description="Optional metadata overrides. Empty fields use the category name and summary."><Field label="SEO title" value={copy.seoTitle ?? ""} maxLength={70} onChange={(value) => update("seoTitle", value)} /><Field label="SEO description" multiline value={copy.seoDescription ?? ""} maxLength={180} onChange={(value) => update("seoDescription", value)} /></FormSection>
    {locale === "en" && <FormSection title="Folder controls" description="Hidden folders stay editable here and are excluded from public pages after publishing.">
      <div className={styles.folderActions}>
        <button type="button" onClick={isHidden ? restore : hide}>{isHidden ? <Eye /> : <EyeOff />}{isHidden ? "Restore folder" : "Hide folder"}</button>
        <button className={styles.deleteButton} type="button" disabled={!canDelete} title={canDelete ? "Delete this empty folder" : "Delete every product in this folder first"} onClick={remove}><Trash2 />Delete folder</button>
      </div>
      <p className={styles.folderActionNote}>{canDelete ? "This empty folder can be deleted after confirmation." : `Deletion is locked while this folder contains ${category.models.length} product${category.models.length === 1 ? "" : "s"}.`}</p>
    </FormSection>}
  </div>;
}

function ProductEditor({ product, locale, lockedSlug, update, upload, duplicate, remove }: { product: ProductModel; locale: LocaleTab; lockedSlug: boolean; update: (field: string, value: string | number) => void; upload: (file: File) => void; duplicate: () => void; remove: () => void }) {
  const copy = locale === "en" ? product : { ...product, ...product.translation.zh };
  return <div className={styles.formSections}>
    <FormSection title="Product identity" description="The English slug remains the canonical URL for both language routes.">
      <div className={styles.twoColumns}><Field label="Product name" value={copy.name ?? ""} onChange={(value) => update("name", value)} /><Field label="URL slug" value={product.slug} disabled={lockedSlug} hint={lockedSlug ? "Locked to preserve the existing product URL." : undefined} onChange={(value) => update("slug", slugify(value))} /></div>
      <div className={styles.twoColumns}><Field label="Product type" value={copy.eyebrow ?? ""} onChange={(value) => update("eyebrow", value)} />{locale === "en" && <StatusField value={product.status} onChange={(value) => update("status", value)} />}</div>
      <Field label="Product description" multiline rows={4} value={copy.description ?? ""} onChange={(value) => update("description", value)} />
    </FormSection>
    {locale === "en" && <FormSection title="Product image" description="Images are resized to 1920 px, converted to WebP and committed with the catalog."><ImageField path={product.image} alt={product.alt} onAltChange={(value) => update("alt", value)} onUpload={upload} /></FormSection>}
    <FormSection title="Technical specification" description="These values populate the specification rail and product detail page.">
      <div className={styles.twoColumns}><Field label="Size range" value={copy.size ?? ""} onChange={(value) => update("size", value)} /><Field label="Length / thickness" value={copy.length ?? ""} onChange={(value) => update("length", value)} /></div>
      <Field label="Standard" value={copy.standard ?? ""} onChange={(value) => update("standard", value)} />
      <Field label="Configuration" value={copy.configuration ?? ""} onChange={(value) => update("configuration", value)} />
      <Field label="Threads" value={copy.threads ?? ""} onChange={(value) => update("threads", value)} />
      {locale === "en" && <Field label="Sort order" type="number" value={String(product.sortOrder)} onChange={(value) => update("sortOrder", Number(value))} />}
    </FormSection>
    <FormSection title="Search appearance" description="Optional metadata overrides. Empty fields use the product name and description."><Field label="SEO title" value={copy.seoTitle ?? ""} maxLength={70} onChange={(value) => update("seoTitle", value)} /><Field label="SEO description" multiline value={copy.seoDescription ?? ""} maxLength={180} onChange={(value) => update("seoDescription", value)} /></FormSection>
    {locale === "en" && <div className={styles.dangerActions}><button type="button" onClick={duplicate}><Copy /> Duplicate as draft</button><button className={styles.deleteButton} type="button" onClick={remove}><Trash2 /> Delete product</button></div>}
  </div>;
}

function MaterialEditor({ material, locale, lockedSlug, update, duplicate, remove }: { material: AlloyMaterial; locale: LocaleTab; lockedSlug: boolean; update: (field: string, value: MaterialFieldValue) => void; duplicate: () => void; remove: () => void }) {
  const copy = locale === "en" ? material : { ...material, ...material.translation.zh };
  const comparison = material.comparison;

  return <div className={styles.formSections}>
    <FormSection title="Material identity" description="Controls the material card, permanent route and publication state.">
      <div className={styles.twoColumns}><Field label="Material name" value={copy.name ?? ""} onChange={(value) => update("name", value)} /><Field label="URL slug" value={material.slug} disabled={lockedSlug} hint={lockedSlug ? "Locked to preserve the existing material URL." : undefined} onChange={(value) => update("slug", slugify(value))} /></div>
      <div className={styles.twoColumns}><Field label="UNS / designation" value={material.uns} onChange={(value) => update("uns", value)} /><Field label="Material positioning label" value={copy.label ?? ""} onChange={(value) => update("label", value)} /></div>
      {locale === "en" && <div className={styles.threeColumns}><Field label="Index" value={material.index} onChange={(value) => update("index", value)} /><Field label="Sort order" type="number" value={String(material.sortOrder)} onChange={(value) => update("sortOrder", Number(value))} /><StatusField value={material.status} onChange={(value) => update("status", value)} /></div>}
      <Field label="Card summary" multiline rows={3} value={copy.summary ?? ""} onChange={(value) => update("summary", value)} />
    </FormSection>

    <FormSection title="Material introduction" description="Populates the material detail hero and positioning panel.">
      <Field label="Detail headline" value={copy.headline ?? ""} onChange={(value) => update("headline", value)} />
      <Field label="Detailed introduction" multiline rows={5} value={copy.description ?? ""} onChange={(value) => update("description", value)} />
      <div className={styles.twoColumns}><Field label="Positioning" value={copy.positioning ?? ""} onChange={(value) => update("positioning", value)} /><Field label="Available forms" value={copy.forms ?? ""} onChange={(value) => update("forms", value)} /></div>
      <Field label="Documentation overview" value={copy.documentation ?? ""} onChange={(value) => update("documentation", value)} />
      <Field label="Standards overview" value={copy.standards ?? ""} onChange={(value) => update("standards", value)} />
      <Field label="Typical service" multiline rows={3} value={copy.service ?? ""} onChange={(value) => update("service", value)} />
    </FormSection>

    {locale === "en" && !comparison && <FormSection title="Comparison attributes" description="Enable structured engineering fields so this material can be selected on the comparison page.">
      <button className={styles.enableComparison} type="button" onClick={() => update("comparison", createDefaultComparison())}><Plus /> Enable comparison attributes</button>
    </FormSection>}

    {locale === "en" && comparison && <>
      <FormSection title="Comparison identity" description="Controls the compact material label and comparison data color.">
        <div className={styles.twoColumns}>
          <Field label="Short symbol" value={comparison.symbol} onChange={(value) => update("comparison.symbol", value)} />
          <SelectField label="Data color" value={comparison.accent} options={["blue", "green", "violet", "copper", "steel"]} onChange={(value) => update("comparison.accent", value as MaterialAccent)} />
        </div>
      </FormSection>
      <FormSection title="Performance indicators" description="Relative 0-100 comparison scores. These are preliminary positioning indicators, not design allowables.">
        <div className={styles.twoColumns}><Field label="Corrosion resistance" type="number" value={String(comparison.performance.corrosion)} onChange={(value) => update("comparison.performance.corrosion", Number(value))} /><Field label="Tensile strength" type="number" value={String(comparison.performance.tensile)} onChange={(value) => update("comparison.performance.tensile", Number(value))} /></div>
        <div className={styles.twoColumns}><Field label="Temperature performance" type="number" value={String(comparison.performance.temperature)} onChange={(value) => update("comparison.performance.temperature", Number(value))} /><Field label="Oxidation resistance" type="number" value={String(comparison.performance.oxidation)} onChange={(value) => update("comparison.performance.oxidation", Number(value))} /></div>
      </FormSection>
      <FormSection title="Mechanical reference" description="Representative values must state their product-form and heat-treatment limitations.">
        <Field label="Typical tensile strength" value={comparison.mechanical.tensileStrength} onChange={(value) => update("comparison.mechanical.tensileStrength", value)} />
        <Field label="Typical yield strength" value={comparison.mechanical.yieldStrength} onChange={(value) => update("comparison.mechanical.yieldStrength", value)} />
        <Field label="Typical elongation" value={comparison.mechanical.elongation} onChange={(value) => update("comparison.mechanical.elongation", value)} />
        <Field label="Reference condition" value={comparison.mechanical.condition} onChange={(value) => update("comparison.mechanical.condition", value)} />
      </FormSection>
      <FormSection title="Service and heat treatment" description="Technical copy shared by material details and the comparison page.">
        <Field label="Temperature capability" multiline rows={4} value={comparison.temperatureCapability} onChange={(value) => update("comparison.temperatureCapability", value)} />
        <Field label="Corrosion characteristics" multiline rows={4} value={comparison.corrosionCharacteristics} onChange={(value) => update("comparison.corrosionCharacteristics", value)} />
        <Field label="Typical heat treatment" value={comparison.heatTreatment} onChange={(value) => update("comparison.heatTreatment", value)} />
        <Field label="Typical supply condition" value={comparison.supplyCondition} onChange={(value) => update("comparison.supplyCondition", value)} />
      </FormSection>
      <FormSection title="Applications and support" description="Enter one item per line. These lists populate comparison and material detail pages.">
        <ListField label="Typical media and conditions" value={comparison.mediaAndConditions} onChange={(value) => update("comparison.mediaAndConditions", value)} />
        <ListField label="Typical applications" value={comparison.applications} onChange={(value) => update("comparison.applications", value)} />
        <ListField label="Standards support" value={comparison.standardsSupport} onChange={(value) => update("comparison.standardsSupport", value)} />
        <ListField label="Documentation support" value={comparison.documentationSupport} onChange={(value) => update("comparison.documentationSupport", value)} />
      </FormSection>
    </>}

    <FormSection title="Search appearance" description="Optional metadata overrides. Empty fields use the material name and summary."><Field label="SEO title" value={copy.seoTitle ?? ""} maxLength={70} onChange={(value) => update("seoTitle", value)} /><Field label="SEO description" multiline value={copy.seoDescription ?? ""} maxLength={180} onChange={(value) => update("seoDescription", value)} /></FormSection>
    {locale === "en" && <div className={styles.dangerActions}><button type="button" onClick={duplicate}><Copy /> Duplicate as draft</button><button className={styles.deleteButton} type="button" onClick={remove}><Trash2 /> Delete material</button></div>}
  </div>;
}

function FormSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <section className={styles.formSection}><header><h2>{title}</h2><p>{description}</p></header><div className={styles.fields}>{children}</div></section>;
}

function Field({ label, value, onChange, multiline = false, rows = 3, disabled = false, hint, maxLength, type = "text" }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean; rows?: number; disabled?: boolean; hint?: string; maxLength?: number; type?: string }) {
  const input = multiline ? <textarea value={value} rows={rows} disabled={disabled} maxLength={maxLength} onChange={(event) => onChange(event.target.value)} /> : <input type={type} value={value} disabled={disabled} maxLength={maxLength} onChange={(event) => onChange(event.target.value)} />;
  return <label className={styles.field}><span>{label}{maxLength && <small>{value.length}/{maxLength}</small>}</span>{input}{hint && <em>{hint}</em>}</label>;
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <label className={styles.field}><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option value={option} key={option}>{option}</option>)}</select></label>;
}

function ListField({ label, value, onChange }: { label: string; value: string[]; onChange: (value: string[]) => void }) {
  return <label className={styles.field}><span>{label}<small>One item per line</small></span><textarea rows={5} value={value.join("\n")} onChange={(event) => onChange(event.target.value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean))} /></label>;
}

function StatusField({ value, onChange }: { value: PublicationStatus; onChange: (value: PublicationStatus) => void }) {
  return <label className={styles.field}><span>Visibility</span><select value={value} onChange={(event) => onChange(event.target.value as PublicationStatus)}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label>;
}

function ImageField({ path, alt, onAltChange, onUpload }: { path: string; alt: string; onAltChange: (value: string) => void; onUpload: (file: File) => void }) {
  const input = useRef<HTMLInputElement>(null);
  return <div className={styles.imageField}><div className={styles.imagePath}><FileImage /><span>{path}</span><button type="button" onClick={() => input.current?.click()}><Upload /> Replace image</button><input ref={input} hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (file) onUpload(file); event.currentTarget.value = ""; }} /></div><Field label="Alternative text" value={alt} onChange={onAltChange} /></div>;
}

function CatalogPreview({ category, product, locale, assets }: { category: ProductCategory; product?: ProductModel; locale: LocaleTab; assets: PendingAsset[] }) {
  const productCopy = product ? (locale === "zh" ? { ...product, ...product.translation.zh } : product) : null;
  const categoryCopy = locale === "zh" ? { ...category, ...category.translation.zh } : category;
  const image = previewAsset(product?.image ?? category.image, assets);
  return <div className={styles.previewCard}>
    <figure><img src={image} alt="" /></figure>
    <div className={styles.previewCopy}>
      {productCopy && <span>{productCopy.eyebrow}</span>}
      <h2>{productCopy?.name ?? categoryCopy.name}</h2>
      <p>{productCopy?.description ?? categoryCopy.summary}</p>
      {productCopy && <dl><div><dt>Size</dt><dd>{productCopy.size}</dd></div><div><dt>Standard</dt><dd>{productCopy.standard}</dd></div><div><dt>Threads</dt><dd>{productCopy.threads}</dd></div></dl>}
    </div>
  </div>;
}

function MaterialPreview({ material, locale }: { material: AlloyMaterial; locale: LocaleTab }) {
  const copy = locale === "zh" ? { ...material, ...material.translation.zh } : material;
  return <div className={`${styles.previewCard} ${styles.materialPreview}`}>
    <div className={styles.previewCopy}>
      <span>{material.uns}</span>
      <h2>{copy.name}</h2>
      <p>{copy.summary}</p>
      <dl>
        <div><dt>Positioning</dt><dd>{copy.positioning}</dd></div>
        <div><dt>Available forms</dt><dd>{copy.forms}</dd></div>
        <div><dt>Standards</dt><dd>{copy.standards}</dd></div>
      </dl>
      {material.comparison && <div className={styles.previewScores}>
        <span>Corrosion <b>{material.comparison.performance.corrosion}</b></span>
        <span>Tensile <b>{material.comparison.performance.tensile}</b></span>
        <span>Temperature <b>{material.comparison.performance.temperature}</b></span>
        <span>Oxidation <b>{material.comparison.performance.oxidation}</b></span>
      </div>}
    </div>
  </div>;
}

function StatusMark({ status }: { status: PublicationStatus }) {
  return <span className={`${styles.statusMark} ${styles[status]}`} title={status}>{status === "published" ? <Check /> : status === "archived" ? <Archive /> : null}</span>;
}

function updateCategory(catalog: ProductCatalogDocument, slug: string, locale: LocaleTab, field: string, value: string | number) {
  const category = catalog.categories.find((item) => item.slug === slug);
  if (!category) return;
  if (locale === "zh" && field !== "status" && field !== "sortOrder" && field !== "image" && field !== "slug" && field !== "index") {
    (category.translation.zh as Record<string, string | number>)[field] = value;
  } else {
    (category as unknown as Record<string, string | number>)[field] = value;
  }
}

function updateProduct(catalog: ProductCatalogDocument, categorySlug: string, productSlug: string, locale: LocaleTab, field: string, value: string | number) {
  const product = catalog.categories.find((category) => category.slug === categorySlug)?.models.find((item) => item.slug === productSlug);
  if (!product) return;
  if (locale === "zh" && field !== "status" && field !== "sortOrder" && field !== "image" && field !== "slug" && field !== "alt") {
    (product.translation.zh as Record<string, string | number>)[field] = value;
  } else {
    (product as unknown as Record<string, string | number>)[field] = value;
  }
}

function updateMaterial(catalog: ProductCatalogDocument, slug: string, locale: LocaleTab, field: string, value: MaterialFieldValue) {
  const material = catalog.materials.find((item) => item.slug === slug);
  if (!material) return;
  const localizedFields = new Set(["name", "label", "summary", "headline", "description", "positioning", "forms", "documentation", "standards", "service", "seoTitle", "seoDescription"]);
  if (locale === "zh" && localizedFields.has(field)) {
    (material.translation.zh as Record<string, string | number>)[field] = value as string | number;
    return;
  }
  setNestedValue(material, field, value);
}

function setNestedValue(target: object, path: string, value: MaterialFieldValue) {
  const parts = path.split(".");
  let cursor = target as Record<string, unknown>;
  for (const part of parts.slice(0, -1)) {
    const next = cursor[part];
    if (!next || typeof next !== "object") return;
    cursor = next as Record<string, unknown>;
  }
  cursor[parts.at(-1) ?? path] = value;
}

function createDefaultComparison(): AlloyComparison {
  return {
    accent: "steel",
    symbol: "NEW",
    performance: { corrosion: 50, tensile: 50, temperature: 50, oxidation: 50 },
    mechanical: {
      tensileStrength: "Confirm against the selected product form and governing specification",
      yieldStrength: "Confirm against the selected product form and governing specification",
      elongation: "Confirm against the selected product form and governing specification",
      condition: "Order-specific material condition",
    },
    temperatureCapability: "Define the service-temperature range after reviewing load, environment, product form and governing standard.",
    corrosionCharacteristics: "Describe the media, concentration, temperature and corrosion mechanism used to position this material.",
    mediaAndConditions: ["Project-specific operating environment"],
    heatTreatment: "Heat treatment to the governing material specification",
    supplyCondition: "Order-specific condition",
    applications: ["Project-specific industrial equipment"],
    standardsSupport: ["Applicable material and fastener specifications"],
    documentationSupport: ["MTC / MTR", "Traceability records"],
  };
}

function previewAsset(path: string, assets: PendingAsset[]): string {
  const pending = assets.find((asset) => `/${asset.path.replace(/^public\//, "")}` === path);
  return pending?.previewUrl ?? path;
}

function readLocalDraft(): ProductCatalogDocument | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as Partial<ProductCatalogDocument>;
    if (!draft.materials) draft.materials = structuredClone(productCatalogDocument.materials);
    const result = productCatalogSchema.safeParse(draft);
    return result.success ? result.data as ProductCatalogDocument : null;
  } catch {
    return null;
  }
}

function normalizeCatalog(value: ProductCatalogDocument | Partial<ProductCatalogDocument>): ProductCatalogDocument {
  const candidate = structuredClone(value) as Partial<ProductCatalogDocument>;
  if (!candidate.materials) candidate.materials = structuredClone(productCatalogDocument.materials);
  const result = productCatalogSchema.safeParse(candidate);
  if (!result.success) throw new Error("The repository catalog is not compatible with this editor.");
  return result.data as ProductCatalogDocument;
}

function slugify(value: string): string {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function windowLocation(): string {
  return typeof window === "undefined" ? "/admin/" : window.location.href.split("?")[0];
}
