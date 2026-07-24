"use client";

/* eslint-disable @next/next/no-img-element */

import {
  Archive,
  Check,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  CloudUpload,
  Copy,
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
import type { ProductCatalogDocument, ProductCategory, ProductModel, PublicationStatus } from "@/types/product-catalog";

import styles from "./admin.module.css";

const DRAFT_KEY = "bybolt-admin-product-draft-v1";
const cloneCatalog = (value: ProductCatalogDocument): ProductCatalogDocument => structuredClone(value);
type Selection = { kind: "category"; categorySlug: string } | { kind: "product"; categorySlug: string; productSlug: string };
type LocaleTab = "en" | "zh";

export function AdminApp() {
  const [catalog, setCatalog] = useState(() => cloneCatalog(productCatalogDocument));
  const [baseline, setBaseline] = useState(() => cloneCatalog(productCatalogDocument));
  const [selection, setSelection] = useState<Selection>(() => ({
    kind: "product",
    categorySlug: productCatalogDocument.categories[0].slug,
    productSlug: productCatalogDocument.categories[0].models[0].slug,
  }));
  const [localeTab, setLocaleTab] = useState<LocaleTab>("en");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(() => new Set(productCatalogDocument.categories.map((category) => category.slug)));
  const [session, setSession] = useState<AdminSession>({ authenticated: false });
  const [connection, setConnection] = useState<"loading" | "offline" | "ready" | "error">("loading");
  const [repositorySha, setRepositorySha] = useState("");
  const [pendingAssets, setPendingAssets] = useState<PendingAsset[]>([]);
  const [commitMessage, setCommitMessage] = useState("Update product catalog");
  const [publishing, setPublishing] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const initialized = useRef(false);

  const validation = useMemo(() => productCatalogSchema.safeParse(catalog), [catalog]);
  const isDirty = useMemo(() => JSON.stringify(catalog) !== JSON.stringify(baseline) || pendingAssets.length > 0, [baseline, catalog, pendingAssets.length]);
  const publishedCount = useMemo(
    () => catalog.categories.flatMap((category) => category.models).filter((product) => product.status === "published").length,
    [catalog],
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
        const repositoryCatalog = cloneCatalog(response.catalog);
        setBaseline(repositoryCatalog);
        setCatalog(localDraft && localDraft.updatedAt > repositoryCatalog.updatedAt ? localDraft : repositoryCatalog);
        setRepositorySha(response.commitSha);
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
    select({ kind: "category", categorySlug: category.slug });
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
            <div><p>Catalog</p><strong>{publishedCount} published products</strong></div>
            <button className={styles.mobileClose} type="button" aria-label="Close product navigation" onClick={() => setMobileMenu(false)}><X /></button>
          </div>
          <label className={styles.search}><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products" /></label>
          <nav className={styles.catalogNav} aria-label="Product catalog editor">
            {catalog.categories.map((category) => {
              const products = category.models.filter((product) => `${product.name} ${product.slug}`.toLowerCase().includes(query.toLowerCase()));
              if (query && products.length === 0 && !category.name.toLowerCase().includes(query.toLowerCase())) return null;
              const isExpanded = expanded.has(category.slug);
              return <div className={styles.categoryGroup} key={category.slug}>
                <div className={`${styles.categoryRow} ${selection.kind === "category" && selection.categorySlug === category.slug ? styles.activeRow : ""}`}>
                  <button className={styles.expandButton} type="button" aria-label={`${isExpanded ? "Collapse" : "Expand"} ${category.name}`} onClick={() => setExpanded((current) => { const next = new Set(current); if (isExpanded) next.delete(category.slug); else next.add(category.slug); return next; })}>{isExpanded ? <ChevronDown /> : <ChevronRight />}</button>
                  <button className={styles.categorySelect} type="button" onClick={() => select({ kind: "category", categorySlug: category.slug })}><Folder /><span>{category.name}</span><small>{category.models.length}</small></button>
                  <button className={styles.addInline} type="button" title={`Add product to ${category.name}`} onClick={() => addProduct(category.slug)}><Plus /></button>
                </div>
                {isExpanded && <div className={styles.productRows}>
                  {products.sort((a, b) => a.sortOrder - b.sortOrder).map((product) => <button className={`${styles.productRow} ${selection.kind === "product" && selection.productSlug === product.slug ? styles.activeRow : ""}`} type="button" key={product.slug} onClick={() => select({ kind: "product", categorySlug: category.slug, productSlug: product.slug })}>
                    <Package /><span>{product.name}</span><StatusMark status={product.status} />
                  </button>)}
                </div>}
              </div>;
            })}
          </nav>
          <button className={styles.addCategory} type="button" onClick={addCategory}><Plus /> Add category</button>
        </aside>

        <section className={styles.editorArea}>
          <div className={styles.editorHeader}>
            <div>
              <p>{selection.kind === "product" ? selectedCategory?.name : "Category settings"}</p>
              <h1>{selection.kind === "product" ? selectedProduct?.name : selectedCategory?.name}</h1>
            </div>
            <div className={styles.localeTabs} aria-label="Content language">
              <button className={localeTab === "en" ? styles.activeLocale : ""} type="button" onClick={() => setLocaleTab("en")}>English</button>
              <button className={localeTab === "zh" ? styles.activeLocale : ""} type="button" onClick={() => setLocaleTab("zh")}>中文</button>
            </div>
          </div>
          {selectedCategory && selection.kind === "category" && <CategoryEditor category={selectedCategory} locale={localeTab} lockedSlug={productCatalogDocument.categories.some((item) => item.slug === selectedCategory.slug && item.status === "published")} update={updateSelectedCategory} upload={(file) => void uploadImage(file, selectedCategory.slug, (path) => mutateCatalog((draft) => updateCategory(draft, selectedCategory.slug, "en", "image", path)))} />}
          {selectedCategory && selectedProduct && selection.kind === "product" && <ProductEditor product={selectedProduct} locale={localeTab} lockedSlug={productCatalogDocument.categories.some((category) => category.slug === selectedCategory.slug && category.models.some((item) => item.slug === selectedProduct.slug && item.status === "published"))} update={updateSelectedProduct} upload={(file) => void uploadImage(file, selectedProduct.slug, (path) => mutateCatalog((draft) => updateProduct(draft, selectedCategory.slug, selectedProduct.slug, "en", "image", path)))} duplicate={() => duplicateProduct(selectedCategory.slug, selectedProduct.slug)} remove={() => deleteProduct(selectedCategory.slug, selectedProduct.slug)} />}
        </section>

        <aside className={styles.previewRail}>
          <div className={styles.previewHeader}><div><p>Live preview</p><strong>{localeTab === "zh" ? "Chinese with English fallback" : "English content"}</strong></div><a href={selectedCategory ? `/en/products/${selectedCategory.slug}/${selectedProduct?.slug ?? ""}` : "/en/products/"} target="_blank" rel="noreferrer" title="Open public page"><ExternalLink /></a></div>
          {selectedCategory && <CatalogPreview category={selectedCategory} product={selectedProduct} locale={localeTab} assets={pendingAssets} />}
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

function CategoryEditor({ category, locale, lockedSlug, update, upload }: { category: ProductCategory; locale: LocaleTab; lockedSlug: boolean; update: (field: string, value: string | number) => void; upload: (file: File) => void }) {
  const copy = locale === "en" ? category : { ...category, ...category.translation.zh };
  return <div className={styles.formSections}>
    <FormSection title="Category identity" description="Controls the category index page and its permanent route.">
      <div className={styles.twoColumns}><Field label="Category name" value={copy.name ?? ""} onChange={(value) => update("name", value)} /><Field label="URL slug" value={category.slug} disabled={lockedSlug} hint={lockedSlug ? "Locked to preserve the accepted URL." : undefined} onChange={(value) => update("slug", slugify(value))} /></div>
      {locale === "en" && <div className={styles.threeColumns}><Field label="Index" value={category.index} onChange={(value) => update("index", value)} /><Field label="Sort order" type="number" value={String(category.sortOrder)} onChange={(value) => update("sortOrder", Number(value))} /><StatusField value={category.status} onChange={(value) => update("status", value)} /></div>}
      <Field label="Summary" multiline value={copy.summary ?? ""} onChange={(value) => update("summary", value)} />
      <Field label="Category introduction" multiline rows={4} value={copy.intro ?? ""} onChange={(value) => update("intro", value)} />
    </FormSection>
    {locale === "en" && <FormSection title="Category image" description="Used on the category card and as fallback media for products."><ImageField path={category.image} alt={category.alt} onAltChange={(value) => update("alt", value)} onUpload={upload} /></FormSection>}
    <FormSection title="Search appearance" description="Optional metadata overrides. Empty fields use the category name and summary."><Field label="SEO title" value={copy.seoTitle ?? ""} maxLength={70} onChange={(value) => update("seoTitle", value)} /><Field label="SEO description" multiline value={copy.seoDescription ?? ""} maxLength={180} onChange={(value) => update("seoDescription", value)} /></FormSection>
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

function FormSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <section className={styles.formSection}><header><h2>{title}</h2><p>{description}</p></header><div className={styles.fields}>{children}</div></section>;
}

function Field({ label, value, onChange, multiline = false, rows = 3, disabled = false, hint, maxLength, type = "text" }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean; rows?: number; disabled?: boolean; hint?: string; maxLength?: number; type?: string }) {
  const input = multiline ? <textarea value={value} rows={rows} disabled={disabled} maxLength={maxLength} onChange={(event) => onChange(event.target.value)} /> : <input type={type} value={value} disabled={disabled} maxLength={maxLength} onChange={(event) => onChange(event.target.value)} />;
  return <label className={styles.field}><span>{label}{maxLength && <small>{value.length}/{maxLength}</small>}</span>{input}{hint && <em>{hint}</em>}</label>;
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

function previewAsset(path: string, assets: PendingAsset[]): string {
  const pending = assets.find((asset) => `/${asset.path.replace(/^public\//, "")}` === path);
  return pending?.previewUrl ?? path;
}

function readLocalDraft(): ProductCatalogDocument | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const result = productCatalogSchema.safeParse(JSON.parse(raw));
    return result.success ? result.data as ProductCatalogDocument : null;
  } catch {
    return null;
  }
}

function slugify(value: string): string {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function windowLocation(): string {
  return typeof window === "undefined" ? "/admin/" : window.location.href.split("?")[0];
}
