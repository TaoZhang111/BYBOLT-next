"use client";

/* eslint-disable @next/next/no-img-element */

import {
  Archive,
  Atom,
  BookOpenText,
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
  Pin,
  Plus,
  RotateCcw,
  Save,
  Search,
  Settings2,
  ShieldCheck,
  SquareUserRound,
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
import type { ContactDetails, FaqItem, ManufacturingProcess, NewsArticle, ProductCatalogDocument, ProductCategory, ProductModel, ProductRange, PublicationStatus, QualityCertificate } from "@/types/product-catalog";

import styles from "./admin.module.css";

const DRAFT_KEY = "bybolt-admin-product-draft-v2";
const cloneCatalog = (value: ProductCatalogDocument): ProductCatalogDocument => structuredClone(value);

function toggleSetValue<T>(current: Set<T>, value: T) {
  const next = new Set(current);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

type Selection = { kind: "category"; categorySlug: string } | { kind: "product"; categorySlug: string; productSlug: string };
type LocaleTab = "en" | "zh";
type CatalogMode = "products" | "materials" | "news" | "faqs" | "quality" | "processes" | "contact";
type ProductRangeKey = ProductRange;
type MaterialFieldValue = string | number | string[] | AlloyComparison | undefined;
type ResourceFieldValue = string | number | boolean | undefined;

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
  const [selectedNewsSlug, setSelectedNewsSlug] = useState(productCatalogDocument.news[0]?.slug ?? "");
  const [selectedFaqId, setSelectedFaqId] = useState(productCatalogDocument.faqs[0]?.id ?? "");
  const [selectedCertificateId, setSelectedCertificateId] = useState(productCatalogDocument.certificates[0]?.id ?? "");
  const [selectedProcessSlug, setSelectedProcessSlug] = useState(productCatalogDocument.processes[0]?.slug ?? "");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [expandedRanges, setExpandedRanges] = useState<Set<ProductRangeKey>>(() => new Set(["range1", "range2"]));
  const [session, setSession] = useState<AdminSession>({ authenticated: false });
  const [connection, setConnection] = useState<"loading" | "offline" | "ready" | "error">("loading");
  const [repositorySha, setRepositorySha] = useState("");
  const [supportsMaterialCatalog, setSupportsMaterialCatalog] = useState(false);
  const [supportsResourceCatalog, setSupportsResourceCatalog] = useState(false);
  const [supportsQualityCatalog, setSupportsQualityCatalog] = useState(false);
  const [supportsProcessCatalog, setSupportsProcessCatalog] = useState(false);
  const [supportsProductGallery, setSupportsProductGallery] = useState(false);
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
  const publishedNewsCount = useMemo(() => catalog.news.filter((article) => article.status === "published").length, [catalog.news]);
  const publishedFaqCount = useMemo(() => catalog.faqs.filter((faq) => faq.status === "published").length, [catalog.faqs]);
  const publishedCertificateCount = useMemo(() => catalog.certificates.filter((certificate) => certificate.status === "published").length, [catalog.certificates]);
  const publishedProcessCount = useMemo(() => catalog.processes.filter((process) => process.status === "published").length, [catalog.processes]);
  const publishedContactCount = useMemo(() => catalog.contact.filter((method) => method.status === "published").length, [catalog.contact]);

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
        setSupportsResourceCatalog(response.capabilities?.includes("resources") ?? false);
        setSupportsQualityCatalog(response.capabilities?.includes("quality") ?? false);
        setSupportsProcessCatalog(response.capabilities?.includes("processes") ?? false);
        setSupportsProductGallery(response.capabilities?.includes("product-gallery") ?? false);
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
    if (!supportsMaterialCatalog || !supportsResourceCatalog || !supportsQualityCatalog || !supportsProcessCatalog || !supportsProductGallery) {
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
    const category = catalog.categories.find((item) => item.slug === categorySlug);
    const isMillProduct = category?.productRange === "range2";
    const product: ProductModel = {
      slug: `new-product-${suffix}`,
      name: isMillProduct ? "New Mill Product" : "New Product",
      eyebrow: isMillProduct ? "High-temperature alloy mill product" : "Drawing-based fastener",
      description: isMillProduct ? "Add a concise description of this alloy mill product, supply condition and intended industrial service." : "Add a concise description of this product and its intended industrial service.",
      size: isMillProduct ? "Size range by review" : "Drawing-defined",
      length: isMillProduct ? "Mill length, coil or cut-to-size by order" : "Drawing-defined",
      standard: isMillProduct ? "Applicable ASTM / ASME material specification or purchase specification" : "Customer drawing and agreed specification",
      configuration: isMillProduct ? "Product form and supply condition by order" : "Project-specific",
      threads: isMillProduct ? "Surface, tolerance and finish by order" : "Standard or special thread forms",
      features: "",
      image: category?.image ?? "/assets/product-fasteners.jpg",
      alt: isMillProduct ? "New BYBOLT high-temperature alloy mill product" : "New BYBOLT alloy fastener product",
      gallery: [],
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

  function addCategory(productRange: ProductRangeKey) {
    const suffix = Date.now().toString().slice(-6);
    const isMillProduct = productRange === "range2";
    const rangeCategories = catalog.categories.filter((item) => item.productRange === productRange);
    const category: ProductCategory = {
      productRange,
      slug: `new-category-${suffix}`,
      name: isMillProduct ? "New Mill Product Category" : "New Fastener Category",
      index: String(rangeCategories.length + 1).padStart(2, "0"),
      image: isMillProduct ? "/assets/bars/ground-alloy-round-bars.webp" : "/assets/product-fasteners.jpg",
      alt: isMillProduct ? "BYBOLT high-temperature alloy mill product category" : "BYBOLT alloy fastener category",
      summary: isMillProduct ? "Add a concise summary for this mill product category." : "Add a concise summary for this fastener category.",
      intro: "Add the category introduction shown above its complete product range.",
      status: "draft",
      sortOrder: rangeCategories.length + 1,
      translation: { zh: {} },
      models: [],
    };
    mutateCatalog((draft) => { draft.categories.push(category); });
    setExpanded((current) => new Set(current).add(category.slug));
    setExpandedRanges((current) => new Set(current).add(productRange));
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

  function addNewsArticle() {
    const suffix = Date.now().toString().slice(-6);
    const article: NewsArticle = {
      slug: `new-technical-article-${suffix}`,
      category: "Technical guidance",
      title: "New technical article",
      excerpt: "Add a concise summary for the Resources page and news archive.",
      body: "Add the complete article body here. Separate paragraphs with a blank line so the public article remains easy to read.",
      publishedAt: new Date().toISOString(),
      status: "draft",
      pinned: false,
      sortOrder: catalog.news.length + 1,
      translation: { zh: {} },
    };
    mutateCatalog((draft) => { draft.news.push(article); });
    setSelectedNewsSlug(article.slug);
    switchCatalog("news");
  }

  function updateSelectedNews(field: string, value: ResourceFieldValue) {
    if (!selectedNews) return;
    if (field === "pinned" && value === true && !selectedNews.pinned && catalog.news.filter((article) => article.pinned).length >= 3) {
      setNotice({ type: "error", text: "Only three news articles can be pinned. Unpin another article first." });
      return;
    }
    const previousSlug = selectedNews.slug;
    mutateCatalog((draft) => updateNewsArticle(draft, previousSlug, localeTab, field, value));
    if (field === "slug" && typeof value === "string" && value) setSelectedNewsSlug(value);
  }

  function deleteNewsArticle(articleSlug: string) {
    const article = catalog.news.find((item) => item.slug === articleSlug);
    if (!article || !window.confirm(`Delete ${article.title}? The change is not permanent until published.`)) return;
    mutateCatalog((draft) => { draft.news = draft.news.filter((item) => item.slug !== articleSlug); });
    setSelectedNewsSlug(catalog.news.find((item) => item.slug !== articleSlug)?.slug ?? "");
  }

  function addFaq() {
    const suffix = Date.now().toString().slice(-6);
    const faq: FaqItem = {
      id: `new-question-${suffix}`,
      question: "New frequently asked question",
      answer: "Add a clear answer for buyers and engineering teams.",
      status: "draft",
      sortOrder: catalog.faqs.length + 1,
      translation: { zh: {} },
    };
    mutateCatalog((draft) => { draft.faqs.push(faq); });
    setSelectedFaqId(faq.id);
    switchCatalog("faqs");
  }

  function updateSelectedFaq(field: string, value: ResourceFieldValue) {
    if (!selectedFaq) return;
    const previousId = selectedFaq.id;
    mutateCatalog((draft) => updateFaqItem(draft, previousId, localeTab, field, value));
    if (field === "id" && typeof value === "string" && value) setSelectedFaqId(value);
  }

  function deleteFaq(faqId: string) {
    const faq = catalog.faqs.find((item) => item.id === faqId);
    if (!faq || !window.confirm(`Delete "${faq.question}"? The change is not permanent until published.`)) return;
    mutateCatalog((draft) => { draft.faqs = draft.faqs.filter((item) => item.id !== faqId); });
    setSelectedFaqId(catalog.faqs.find((item) => item.id !== faqId)?.id ?? "");
  }

  function addCertificate() {
    const suffix = Date.now().toString().slice(-6);
    const certificate: QualityCertificate = {
      id: `new-certificate-${suffix}`,
      title: "New quality certificate",
      description: "Add a concise description of this certificate or quality record and when it is supplied.",
      image: "/assets/certificates/alloy-fastener-quality-certificates.jpg",
      alt: "BYBOLT quality certificate",
      imagePosition: "50% 50%",
      status: "draft",
      sortOrder: catalog.certificates.length + 1,
      translation: { zh: {} },
    };
    mutateCatalog((draft) => { draft.certificates.push(certificate); });
    setSelectedCertificateId(certificate.id);
    switchCatalog("quality");
  }

  function updateSelectedCertificate(field: string, value: ResourceFieldValue) {
    if (!selectedCertificate) return;
    const previousId = selectedCertificate.id;
    mutateCatalog((draft) => updateQualityCertificate(draft, previousId, localeTab, field, value));
    if (field === "id" && typeof value === "string" && value) setSelectedCertificateId(value);
  }

  function deleteCertificate(certificateId: string) {
    const certificate = catalog.certificates.find((item) => item.id === certificateId);
    if (!certificate || !window.confirm(`Delete ${certificate.title}? The change is not permanent until published.`)) return;
    mutateCatalog((draft) => { draft.certificates = draft.certificates.filter((item) => item.id !== certificateId); });
    setSelectedCertificateId(catalog.certificates.find((item) => item.id !== certificateId)?.id ?? "");
  }

  function addProcess() {
    const suffix = Date.now().toString().slice(-6);
    const process: ManufacturingProcess = {
      slug: `new-process-${suffix}`,
      number: String(catalog.processes.length + 1).padStart(2, "0"),
      title: "New manufacturing process",
      summary: "Add a concise summary of this manufacturing stage and its role in the custom route.",
      description: "Add the complete process description here, including the production purpose, technical sequence and the records connected to this manufacturing stage.",
      control: "Describe the critical control point reviewed before the component moves to the next stage.",
      image: "/assets/manufacturing-process-white.png",
      imageAlt: "BYBOLT custom manufacturing process",
      imagePosition: "50% 50%",
      status: "draft",
      sortOrder: catalog.processes.length + 1,
      translation: { zh: {} },
    };
    mutateCatalog((draft) => { draft.processes.push(process); });
    setSelectedProcessSlug(process.slug);
    switchCatalog("processes");
  }

  function updateSelectedProcess(field: string, value: ResourceFieldValue) {
    if (!selectedProcess) return;
    const previousSlug = selectedProcess.slug;
    mutateCatalog((draft) => updateManufacturingProcess(draft, previousSlug, localeTab, field, value));
    if (field === "slug" && typeof value === "string" && value) setSelectedProcessSlug(value);
  }

  function deleteProcess(processSlug: string) {
    const process = catalog.processes.find((item) => item.slug === processSlug);
    if (!process || !window.confirm(`Delete ${process.title}? The change is not permanent until published.`)) return;
    mutateCatalog((draft) => { draft.processes = draft.processes.filter((item) => item.slug !== processSlug); });
    setSelectedProcessSlug(catalog.processes.find((item) => item.slug !== processSlug)?.slug ?? "");
  }

  function addContactMethod() {
    const suffix = Date.now().toString().slice(-6);
    const method: ContactDetails = {
      id: `contact-${suffix}`,
      label: "New contact method",
      value: "",
      href: "",
      type: "text",
      status: "draft",
      sortOrder: catalog.contact.length + 1,
    };
    mutateCatalog((draft) => { draft.contact.push(method); });
  }

  function updateContact(id: string, field: keyof ContactDetails, value: string | number) {
    mutateCatalog((draft) => {
      const method = draft.contact.find((item) => item.id === id);
      if (method) (method as unknown as Record<string, string | number>)[field] = value;
    });
  }

  function deleteContactMethod(id: string) {
    const method = catalog.contact.find((item) => item.id === id);
    if (!method || !window.confirm(`Delete ${method.label}? The change is not permanent until published.`)) return;
    mutateCatalog((draft) => { draft.contact = draft.contact.filter((item) => item.id !== id); });
  }

  async function uploadImage(file: File, slug: string, onReady: (sitePath: string) => void, directory: "products" | "news" | "certificates" | "processes" = "products") {
    try {
      const asset = await prepareProductImage(file, slug, directory);
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

  function addSelectedProductGalleryImages(files: File[]) {
    if (!selectedCategory || !selectedProduct) return;
    const categorySlug = selectedCategory.slug;
    const productSlug = selectedProduct.slug;
    const startOrder = Math.max(0, ...selectedProduct.gallery.map((image) => image.sortOrder)) + 10;
    files.forEach((file, index) => {
      void uploadImage(file, `${productSlug}-gallery`, (path) => {
        mutateCatalog((draft) => {
          const product = draft.categories.find((category) => category.slug === categorySlug)?.models.find((item) => item.slug === productSlug);
          if (!product || product.gallery.length >= 12) return;
          product.gallery.push({
            id: `image-${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 6)}`,
            image: path,
            alt: `${product.name} product view ${product.gallery.length + 2}`,
            imagePosition: "50% 50%",
            sortOrder: startOrder + index,
          });
        });
      });
    });
  }

  function updateSelectedProductGalleryImage(imageId: string, field: "alt" | "imagePosition" | "sortOrder", value: string | number) {
    if (!selectedCategory || !selectedProduct) return;
    mutateCatalog((draft) => {
      const image = draft.categories.find((category) => category.slug === selectedCategory.slug)?.models
        .find((product) => product.slug === selectedProduct.slug)?.gallery.find((item) => item.id === imageId);
      if (image) (image as unknown as Record<string, string | number>)[field] = value;
    });
  }

  function deleteSelectedProductGalleryImage(imageId: string) {
    if (!selectedCategory || !selectedProduct) return;
    const image = selectedProduct.gallery.find((item) => item.id === imageId);
    if (!image || !window.confirm("Remove this image from the product gallery? The change is not permanent until published.")) return;
    mutateCatalog((draft) => {
      const product = draft.categories.find((category) => category.slug === selectedCategory.slug)?.models.find((item) => item.slug === selectedProduct.slug);
      if (product) product.gallery = product.gallery.filter((item) => item.id !== imageId);
    });
  }

  const selectedCategory = catalog.categories.find((category) => category.slug === selection.categorySlug);
  const selectedProduct = selection.kind === "product" ? selectedCategory?.models.find((product) => product.slug === selection.productSlug) : undefined;
  const selectedMaterial = catalog.materials.find((material) => material.slug === selectedMaterialSlug) ?? catalog.materials[0];
  const selectedNews = catalog.news.find((article) => article.slug === selectedNewsSlug) ?? catalog.news[0];
  const selectedFaq = catalog.faqs.find((faq) => faq.id === selectedFaqId) ?? catalog.faqs[0];
  const selectedCertificate = catalog.certificates.find((certificate) => certificate.id === selectedCertificateId) ?? catalog.certificates[0];
  const selectedProcess = catalog.processes.find((process) => process.slug === selectedProcessSlug) ?? catalog.processes[0];
  const productRange1Categories = catalog.categories
    .filter((category) => category.productRange === "range1")
    .sort(compareProductCategories);
  const productRange2Categories = catalog.categories
    .filter((category) => category.productRange === "range2")
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
          {session.authenticated ? <button className={styles.iconButton} type="button" title="Sign out" onClick={disconnect}><LogOut /></button> : adminApiUrl ? <a className={styles.githubButton} href={getLoginUrl("/admin/")}><GitBranch /> Connect</a> : null}
        </div>
      </header>

      {notice && <div className={`${styles.notice} ${styles[notice.type]}`} role="status">{notice.type === "success" ? <Check /> : <CircleAlert />}<span>{notice.text}</span><button type="button" aria-label="Dismiss notification" onClick={() => setNotice(null)}><X /></button></div>}

      <div className={styles.workspace}>
        <aside className={`${styles.sidebar} ${mobileMenu ? styles.sidebarOpen : ""}`}>
          <div className={styles.sidebarHeader}>
            <div><p>Catalog</p><strong>{catalogMode === "products" ? `${publishedCount} published products` : catalogMode === "materials" ? `${publishedMaterialCount} published materials` : catalogMode === "news" ? `${publishedNewsCount} published articles` : catalogMode === "faqs" ? `${publishedFaqCount} published questions` : catalogMode === "quality" ? `${publishedCertificateCount} published certificates` : catalogMode === "processes" ? `${publishedProcessCount} published processes` : `${publishedContactCount} published contact methods`}</strong></div>
            <button className={styles.mobileClose} type="button" aria-label="Close product navigation" onClick={() => setMobileMenu(false)}><X /></button>
          </div>
          <div className={styles.catalogTabs} aria-label="Catalog type">
            <button className={catalogMode === "products" ? styles.activeCatalogTab : ""} type="button" onClick={() => switchCatalog("products")}><Package />Products</button>
            <button className={catalogMode === "materials" ? styles.activeCatalogTab : ""} type="button" onClick={() => switchCatalog("materials")}><Atom />Materials</button>
            <button className={catalogMode === "news" ? styles.activeCatalogTab : ""} type="button" onClick={() => switchCatalog("news")}><BookOpenText />News</button>
            <button className={catalogMode === "faqs" ? styles.activeCatalogTab : ""} type="button" onClick={() => switchCatalog("faqs")}><CircleAlert />FAQ</button>
            <button className={catalogMode === "quality" ? styles.activeCatalogTab : ""} type="button" onClick={() => switchCatalog("quality")}><ShieldCheck />Quality</button>
            <button className={catalogMode === "processes" ? styles.activeCatalogTab : ""} type="button" onClick={() => switchCatalog("processes")}><Settings2 />Processes</button>
            <button className={catalogMode === "contact" ? styles.activeCatalogTab : ""} type="button" onClick={() => switchCatalog("contact")}><SquareUserRound />Contact</button>
          </div>
          {catalogMode !== "contact" && <label className={styles.search}><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${catalogMode}`} /></label>}
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
              onAddCategory={() => addCategory("range1")}
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
              onAddCategory={() => addCategory("range2")}
            />
          </nav> : catalogMode === "materials" ? <nav className={`${styles.catalogNav} ${styles.materialNav}`} aria-label="Material catalog editor">
            {catalog.materials
              .filter((material) => `${material.name} ${material.uns} ${material.slug}`.toLowerCase().includes(query.toLowerCase()))
              .sort((left, right) => left.sortOrder - right.sortOrder)
              .map((material) => (
                <button className={`${styles.productRow} ${selectedMaterial?.slug === material.slug ? styles.activeRow : ""}`} type="button" key={material.slug} onClick={() => { setSelectedMaterialSlug(material.slug); setMobileMenu(false); }}>
                  <Atom /><span><b>{material.name}</b><small>{material.uns}</small></span><StatusMark status={material.status} />
                </button>
              ))}
          </nav> : catalogMode === "news" ? <nav className={`${styles.catalogNav} ${styles.materialNav}`} aria-label="News editor">
            {catalog.news
              .filter((article) => `${article.title} ${article.category} ${article.slug}`.toLowerCase().includes(query.toLowerCase()))
              .sort((left, right) => Number(right.pinned) - Number(left.pinned) || Number(left.status === "archived") - Number(right.status === "archived") || Date.parse(right.publishedAt) - Date.parse(left.publishedAt))
              .map((article) => <button className={`${styles.productRow} ${article.status === "archived" ? styles.hiddenResource : ""} ${selectedNews?.slug === article.slug ? styles.activeRow : ""}`} type="button" key={article.slug} onClick={() => { setSelectedNewsSlug(article.slug); setMobileMenu(false); }}>
                {article.pinned ? <Pin /> : <BookOpenText />}<span><b>{article.title}</b><small>{new Date(article.publishedAt).toLocaleDateString()}</small></span><StatusMark status={article.status} />
              </button>)}
          </nav> : catalogMode === "faqs" ? <nav className={`${styles.catalogNav} ${styles.materialNav}`} aria-label="FAQ editor">
            {catalog.faqs
              .filter((faq) => `${faq.question} ${faq.id}`.toLowerCase().includes(query.toLowerCase()))
              .sort((left, right) => Number(left.status === "archived") - Number(right.status === "archived") || left.sortOrder - right.sortOrder)
              .map((faq) => <button className={`${styles.productRow} ${faq.status === "archived" ? styles.hiddenResource : ""} ${selectedFaq?.id === faq.id ? styles.activeRow : ""}`} type="button" key={faq.id} onClick={() => { setSelectedFaqId(faq.id); setMobileMenu(false); }}>
                <CircleAlert /><span><b>{faq.question}</b><small>Order {faq.sortOrder}</small></span><StatusMark status={faq.status} />
              </button>)}
          </nav> : catalogMode === "quality" ? <nav className={`${styles.catalogNav} ${styles.materialNav}`} aria-label="Quality certificate editor">
            {catalog.certificates
              .filter((certificate) => `${certificate.title} ${certificate.id}`.toLowerCase().includes(query.toLowerCase()))
              .sort((left, right) => Number(left.status === "archived") - Number(right.status === "archived") || left.sortOrder - right.sortOrder)
              .map((certificate) => <button className={`${styles.productRow} ${certificate.status === "archived" ? styles.hiddenResource : ""} ${selectedCertificate?.id === certificate.id ? styles.activeRow : ""}`} type="button" key={certificate.id} onClick={() => { setSelectedCertificateId(certificate.id); setMobileMenu(false); }}>
                <ShieldCheck /><span><b>{certificate.title}</b><small>Order {certificate.sortOrder}</small></span><StatusMark status={certificate.status} />
              </button>)}
          </nav> : catalogMode === "processes" ? <nav className={`${styles.catalogNav} ${styles.materialNav}`} aria-label="Manufacturing process editor">
            {catalog.processes
              .filter((process) => `${process.title} ${process.slug} ${process.number}`.toLowerCase().includes(query.toLowerCase()))
              .sort((left, right) => Number(left.status === "archived") - Number(right.status === "archived") || left.sortOrder - right.sortOrder)
              .map((process) => <button className={`${styles.productRow} ${process.status === "archived" ? styles.hiddenResource : ""} ${selectedProcess?.slug === process.slug ? styles.activeRow : ""}`} type="button" key={process.slug} onClick={() => { setSelectedProcessSlug(process.slug); setMobileMenu(false); }}>
                <Settings2 /><span><b>{process.number} {process.title}</b><small>Order {process.sortOrder}</small></span><StatusMark status={process.status} />
              </button>)}
          </nav> : <div className={styles.contactSidebar}><SquareUserRound /><p>Manage the contact methods shared by Resources, About and other public sections.</p></div>}
          {catalogMode !== "products" && <button className={styles.addCategory} type="button" onClick={catalogMode === "materials" ? addMaterial : catalogMode === "news" ? addNewsArticle : catalogMode === "quality" ? addCertificate : catalogMode === "processes" ? addProcess : catalogMode === "contact" ? addContactMethod : addFaq}><Plus /> {catalogMode === "materials" ? "Add material" : catalogMode === "news" ? "Add news article" : catalogMode === "quality" ? "Add certificate" : catalogMode === "processes" ? "Add process" : catalogMode === "contact" ? "Add contact method" : "Add FAQ"}</button>}
        </aside>

        <section className={styles.editorArea}>
          <div className={styles.editorHeader}>
            <div>
              <p>{catalogMode === "materials" ? "Material catalog" : catalogMode === "news" ? "News and technical resources" : catalogMode === "faqs" ? "Frequently asked questions" : catalogMode === "quality" ? "Quality certificates" : catalogMode === "processes" ? "Custom manufacturing processes" : catalogMode === "contact" ? "Shared site settings" : selection.kind === "product" ? selectedCategory?.name : "Category settings"}</p>
              <h1>{catalogMode === "materials" ? selectedMaterial?.name : catalogMode === "news" ? selectedNews?.title : catalogMode === "faqs" ? selectedFaq?.question : catalogMode === "quality" ? selectedCertificate?.title : catalogMode === "processes" ? selectedProcess?.title : catalogMode === "contact" ? "Contact details" : selection.kind === "product" ? selectedProduct?.name : selectedCategory?.name}</h1>
            </div>
            <div className={styles.localeTabs} aria-label="Content language">
              <button className={localeTab === "en" ? styles.activeLocale : ""} type="button" onClick={() => setLocaleTab("en")}>English</button>
              <button className={localeTab === "zh" ? styles.activeLocale : ""} type="button" onClick={() => setLocaleTab("zh")}>中文</button>
            </div>
          </div>
          {catalogMode === "products" && selectedCategory && selection.kind === "category" && <CategoryEditor category={selectedCategory} locale={localeTab} lockedSlug={productCatalogDocument.categories.some((item) => item.slug === selectedCategory.slug && item.status === "published")} update={updateSelectedCategory} upload={(file) => void uploadImage(file, selectedCategory.slug, (path) => mutateCatalog((draft) => updateCategory(draft, selectedCategory.slug, "en", "image", path)))} hide={() => hideCategory(selectedCategory.slug)} restore={() => restoreCategory(selectedCategory.slug)} remove={() => deleteCategory(selectedCategory.slug)} />}
          {catalogMode === "products" && selectedCategory && selectedProduct && selection.kind === "product" && <ProductEditor product={selectedProduct} locale={localeTab} lockedSlug={productCatalogDocument.categories.some((category) => category.slug === selectedCategory.slug && category.models.some((item) => item.slug === selectedProduct.slug && item.status === "published"))} assets={pendingAssets} update={updateSelectedProduct} upload={(file) => void uploadImage(file, selectedProduct.slug, (path) => mutateCatalog((draft) => updateProduct(draft, selectedCategory.slug, selectedProduct.slug, "en", "image", path)))} uploadGallery={addSelectedProductGalleryImages} updateGallery={updateSelectedProductGalleryImage} removeGallery={deleteSelectedProductGalleryImage} duplicate={() => duplicateProduct(selectedCategory.slug, selectedProduct.slug)} remove={() => deleteProduct(selectedCategory.slug, selectedProduct.slug)} />}
          {catalogMode === "materials" && selectedMaterial && <MaterialEditor material={selectedMaterial} locale={localeTab} lockedSlug={productCatalogDocument.materials.some((item) => item.slug === selectedMaterial.slug && item.status === "published")} update={updateSelectedMaterial} duplicate={() => duplicateMaterial(selectedMaterial.slug)} remove={() => deleteMaterial(selectedMaterial.slug)} />}
          {catalogMode === "news" && selectedNews && <NewsEditor article={selectedNews} locale={localeTab} lockedSlug={productCatalogDocument.news.some((item) => item.slug === selectedNews.slug && item.status === "published")} pinnedCount={catalog.news.filter((article) => article.pinned).length} update={updateSelectedNews} upload={(file) => void uploadImage(file, selectedNews.slug, (path) => mutateCatalog((draft) => updateNewsArticle(draft, selectedNews.slug, "en", "image", path)), "news")} remove={() => deleteNewsArticle(selectedNews.slug)} />}
          {catalogMode === "faqs" && selectedFaq && <FaqEditor faq={selectedFaq} locale={localeTab} update={updateSelectedFaq} remove={() => deleteFaq(selectedFaq.id)} />}
          {catalogMode === "quality" && selectedCertificate && <CertificateEditor certificate={selectedCertificate} locale={localeTab} update={updateSelectedCertificate} upload={(file) => void uploadImage(file, selectedCertificate.id, (path) => mutateCatalog((draft) => updateQualityCertificate(draft, selectedCertificate.id, "en", "image", path)), "certificates")} remove={() => deleteCertificate(selectedCertificate.id)} />}
          {catalogMode === "processes" && selectedProcess && <ProcessEditor process={selectedProcess} locale={localeTab} update={updateSelectedProcess} upload={(file) => void uploadImage(file, selectedProcess.slug, (path) => mutateCatalog((draft) => updateManufacturingProcess(draft, selectedProcess.slug, "en", "image", path)), "processes")} remove={() => deleteProcess(selectedProcess.slug)} />}
          {catalogMode === "contact" && <ContactEditor contact={catalog.contact} update={updateContact} remove={deleteContactMethod} />}
        </section>

        <aside className={styles.previewRail}>
          <div className={styles.previewHeader}><div><p>Live preview</p><strong>{localeTab === "zh" ? "Chinese with English fallback" : "English content"}</strong></div><a href={catalogMode === "materials" && selectedMaterial ? `/en/alloys/${selectedMaterial.slug}/` : catalogMode === "news" && selectedNews ? `/en/news/${selectedNews.slug}/` : catalogMode === "quality" ? "/en/quality/" : catalogMode === "processes" && selectedProcess ? `/en/capabilities/${selectedProcess.slug}/` : catalogMode === "faqs" || catalogMode === "contact" ? "/en/resources/" : selectedCategory ? `/en/products/${selectedCategory.slug}/${selectedProduct?.slug ?? ""}` : "/en/products/"} target="_blank" rel="noreferrer" title="Open public page"><ExternalLink /></a></div>
          {catalogMode === "products" && selectedCategory && <CatalogPreview category={selectedCategory} product={selectedProduct} locale={localeTab} assets={pendingAssets} />}
          {catalogMode === "materials" && selectedMaterial && <MaterialPreview material={selectedMaterial} locale={localeTab} />}
          {catalogMode === "news" && selectedNews && <NewsPreview article={selectedNews} locale={localeTab} assets={pendingAssets} />}
          {catalogMode === "faqs" && selectedFaq && <FaqPreview faq={selectedFaq} locale={localeTab} />}
          {catalogMode === "quality" && selectedCertificate && <CertificatePreview certificate={selectedCertificate} locale={localeTab} assets={pendingAssets} />}
          {catalogMode === "processes" && selectedProcess && <ProcessPreview process={selectedProcess} locale={localeTab} assets={pendingAssets} />}
          {catalogMode === "contact" && <ContactPreview contact={catalog.contact} />}
          <div className={styles.validationPanel}>
            <div className={styles.validationHeading}>{validation.success ? <Check /> : <CircleAlert />}<div><strong>{validation.success ? "Ready to publish" : `${validation.error.issues.length} validation issues`}</strong><span>{pendingAssets.length} image{pendingAssets.length === 1 ? "" : "s"} queued</span></div></div>
            {!validation.success && <ul>{validation.error.issues.slice(0, 5).map((issue, index) => <li key={`${issue.path.join("-")}-${index}`}>{issue.message}</li>)}</ul>}
            <label className={styles.commitField}>Commit message<input value={commitMessage} onChange={(event) => setCommitMessage(event.target.value)} maxLength={72} /></label>
            {!adminApiUrl && <div className={styles.setupHint}><Settings2 /><p><strong>Git API not configured</strong><span>Editing and browser drafts work now. Add `NEXT_PUBLIC_ADMIN_API_URL` after deploying the included Worker to enable GitHub publishing.</span></p></div>}
            {adminApiUrl && !session.authenticated && <a className={styles.connectPanelButton} href={getLoginUrl("/admin/")}><GitBranch /> Sign in with authorized GitHub account</a>}
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
      {locale === "en" && <><div className={styles.twoColumns}><SelectField label="Product range" value={category.productRange} options={["range1", "range2"]} onChange={(value) => update("productRange", value)} /><StatusField value={category.status} onChange={(value) => update("status", value)} /></div><div className={styles.twoColumns}><Field label="Index" value={category.index} onChange={(value) => update("index", value)} /><Field label="Sort order" type="number" value={String(category.sortOrder)} onChange={(value) => update("sortOrder", Number(value))} /></div></>}
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

function ProductEditor({ product, locale, lockedSlug, assets, update, upload, uploadGallery, updateGallery, removeGallery, duplicate, remove }: { product: ProductModel; locale: LocaleTab; lockedSlug: boolean; assets: PendingAsset[]; update: (field: string, value: string | number) => void; upload: (file: File) => void; uploadGallery: (files: File[]) => void; updateGallery: (imageId: string, field: "alt" | "imagePosition" | "sortOrder", value: string | number) => void; removeGallery: (imageId: string) => void; duplicate: () => void; remove: () => void }) {
  const copy = locale === "en" ? product : { ...product, ...product.translation.zh };
  return <div className={styles.formSections}>
    <FormSection title="Product identity" description="The English slug remains the canonical URL for both language routes.">
      <div className={styles.twoColumns}><Field label="Product name" value={copy.name ?? ""} onChange={(value) => update("name", value)} /><Field label="URL slug" value={product.slug} disabled={lockedSlug} hint={lockedSlug ? "Locked to preserve the existing product URL." : undefined} onChange={(value) => update("slug", slugify(value))} /></div>
      <div className={styles.twoColumns}><Field label="Product type" value={copy.eyebrow ?? ""} onChange={(value) => update("eyebrow", value)} />{locale === "en" && <StatusField value={product.status} onChange={(value) => update("status", value)} />}</div>
      <Field label="Product description" multiline rows={4} value={copy.description ?? ""} onChange={(value) => update("description", value)} />
    </FormSection>
    <FormSection title="Product Features" description="Long-form product characteristics shown below the gallery and technical specification.">
      <Field label="Product feature text" multiline rows={7} value={copy.features ?? ""} maxLength={5000} onChange={(value) => update("features", value)} />
    </FormSection>
    {locale === "en" && <>
      <FormSection title="Primary product image" description="The primary image is always the first image on the product page."><ImageField path={product.image} alt={product.alt} onAltChange={(value) => update("alt", value)} onUpload={upload} /></FormSection>
      <FormSection title="Product image gallery" description="Add up to 12 additional views. Lower sort orders appear first after the primary image.">
        <ProductGalleryEditor images={product.gallery} assets={assets} onUpload={uploadGallery} onUpdate={updateGallery} onRemove={removeGallery} />
      </FormSection>
    </>}
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

function NewsEditor({ article, locale, lockedSlug, pinnedCount, update, upload, remove }: { article: NewsArticle; locale: LocaleTab; lockedSlug: boolean; pinnedCount: number; update: (field: string, value: ResourceFieldValue) => void; upload: (file: File) => void; remove: () => void }) {
  const copy = locale === "en" ? article : { ...article, ...article.translation.zh };
  const pinDisabled = !article.pinned && pinnedCount >= 3;
  return <div className={styles.formSections}>
    <FormSection title="Article identity" description="Controls the news route, category, publication state and Resources placement.">
      <div className={styles.twoColumns}><Field label="Article title" value={copy.title ?? ""} onChange={(value) => update("title", value)} /><Field label="URL slug" value={article.slug} disabled={lockedSlug} hint={lockedSlug ? "Locked to preserve the published URL." : undefined} onChange={(value) => update("slug", slugify(value))} /></div>
      <div className={styles.twoColumns}><Field label="Topic / category" value={copy.category ?? ""} onChange={(value) => update("category", value)} />{locale === "en" && <StatusField value={article.status} onChange={(value) => update("status", value)} />}</div>
      {locale === "en" && <div className={styles.threeColumns}><Field label="Publication date" type="datetime-local" value={article.publishedAt.slice(0, 16)} onChange={(value) => update("publishedAt", value ? new Date(value).toISOString() : article.publishedAt)} /><Field label="Sort order" type="number" value={String(article.sortOrder)} onChange={(value) => update("sortOrder", Number(value))} /><label className={`${styles.pinField} ${pinDisabled ? styles.pinDisabled : ""}`}><input type="checkbox" checked={article.pinned} disabled={pinDisabled} onChange={(event) => update("pinned", event.target.checked)} /><Pin /><span><b>Pin on Resources</b><small>{article.pinned ? "Pinned" : pinDisabled ? "Three articles already pinned" : `${pinnedCount}/3 pinned`}</small></span></label></div>}
      <Field label="Article excerpt" multiline rows={3} value={copy.excerpt ?? ""} onChange={(value) => update("excerpt", value)} />
    </FormSection>
    <FormSection title="Article body" description="Use a blank line between paragraphs. Content is rendered as readable article paragraphs."><Field label="Body" multiline rows={14} value={copy.body ?? ""} onChange={(value) => update("body", value)} /></FormSection>
    {locale === "en" && <FormSection title="Article image" description="Optional article media is resized to 1920 px, converted to WebP and committed with the catalog."><ImageField path={article.image ?? "No image selected"} alt={article.imageAlt ?? ""} onAltChange={(value) => update("imageAlt", value)} onUpload={upload} /></FormSection>}
    <FormSection title="Search appearance" description="Optional metadata overrides. Empty fields use the article title and excerpt."><Field label="SEO title" value={copy.seoTitle ?? ""} maxLength={70} onChange={(value) => update("seoTitle", value)} /><Field label="SEO description" multiline value={copy.seoDescription ?? ""} maxLength={180} onChange={(value) => update("seoDescription", value)} /></FormSection>
    {locale === "en" && <div className={styles.dangerActions}><button className={styles.deleteButton} type="button" onClick={remove}><Trash2 /> Delete article</button></div>}
  </div>;
}

function FaqEditor({ faq, locale, update, remove }: { faq: FaqItem; locale: LocaleTab; update: (field: string, value: ResourceFieldValue) => void; remove: () => void }) {
  const copy = locale === "en" ? faq : { ...faq, ...faq.translation.zh };
  return <div className={styles.formSections}>
    <FormSection title="FAQ entry" description="Published questions appear on Resources. Archived questions remain editable but are hidden publicly.">
      {locale === "en" && <div className={styles.threeColumns}><Field label="Internal ID" value={faq.id} onChange={(value) => update("id", slugify(value))} /><Field label="Sort order" type="number" value={String(faq.sortOrder)} onChange={(value) => update("sortOrder", Number(value))} /><StatusField value={faq.status} onChange={(value) => update("status", value)} /></div>}
      <Field label="Question" multiline rows={2} value={copy.question ?? ""} onChange={(value) => update("question", value)} />
      <Field label="Answer" multiline rows={7} value={copy.answer ?? ""} onChange={(value) => update("answer", value)} />
    </FormSection>
    {locale === "en" && <div className={styles.dangerActions}><button className={styles.deleteButton} type="button" onClick={remove}><Trash2 /> Delete FAQ</button></div>}
  </div>;
}

function CertificateEditor({ certificate, locale, update, upload, remove }: { certificate: QualityCertificate; locale: LocaleTab; update: (field: string, value: ResourceFieldValue) => void; upload: (file: File) => void; remove: () => void }) {
  const copy = locale === "en" ? certificate : { ...certificate, ...certificate.translation.zh };
  return <div className={styles.formSections}>
    <FormSection title="Certificate identity" description="Published certificates appear on Quality. Archived certificates remain editable and move to the bottom of this list.">
      {locale === "en" && <div className={styles.threeColumns}><Field label="Internal ID" value={certificate.id} onChange={(value) => update("id", slugify(value))} /><Field label="Sort order" type="number" value={String(certificate.sortOrder)} onChange={(value) => update("sortOrder", Number(value))} /><StatusField value={certificate.status} onChange={(value) => update("status", value)} /></div>}
      <Field label="Certificate title" value={copy.title ?? ""} onChange={(value) => update("title", value)} />
      <Field label="Description" multiline rows={5} value={copy.description ?? ""} onChange={(value) => update("description", value)} />
    </FormSection>
    {locale === "en" && <FormSection title="Certificate image" description="Upload a readable certificate image. It is resized, converted to WebP and committed with the catalog.">
      <ImageField path={certificate.image} alt={certificate.alt} onAltChange={(value) => update("alt", value)} onUpload={upload} />
      <Field label="Thumbnail focus" value={certificate.imagePosition ?? "50% 50%"} hint="CSS object position, for example 50% 50% or 0% 100%. The full image still opens when selected." onChange={(value) => update("imagePosition", value)} />
    </FormSection>}
    {locale === "zh" && <FormSection title="Chinese image description" description="Optional Chinese alternative text. Empty content falls back to English."><Field label="Alternative text" value={copy.alt ?? ""} onChange={(value) => update("alt", value)} /></FormSection>}
    {locale === "en" && <div className={styles.folderActions}>
      <button type="button" onClick={() => update("status", certificate.status === "archived" ? "draft" : "archived")}>{certificate.status === "archived" ? <Eye /> : <EyeOff />}{certificate.status === "archived" ? "Restore certificate" : "Hide certificate"}</button>
      <button className={styles.deleteButton} type="button" onClick={remove}><Trash2 /> Delete certificate</button>
    </div>}
  </div>;
}

function ContactEditor({ contact, update, remove }: { contact: ContactDetails[]; update: (id: string, field: keyof ContactDetails, value: string | number) => void; remove: (id: string) => void }) {
  return <div className={styles.formSections}>
    {[...contact]
      .sort((left, right) => Number(left.status === "archived") - Number(right.status === "archived") || left.sortOrder - right.sortOrder)
      .map((method) => <div className={method.status === "archived" ? styles.hiddenContactEditor : ""} key={method.id}>
        <FormSection title={method.label} description="Published methods appear in the shared Contact section on Resources and About.">
          <div className={styles.threeColumns}><Field label="Internal ID" value={method.id} onChange={(value) => update(method.id, "id", slugify(value))} /><Field label="Label" value={method.label} onChange={(value) => update(method.id, "label", value)} /><Field label="Sort order" type="number" value={String(method.sortOrder)} onChange={(value) => update(method.id, "sortOrder", Number(value))} /></div>
          <div className={styles.twoColumns}><SelectField label="Type" value={method.type} options={["email", "phone", "link", "text"]} onChange={(value) => update(method.id, "type", value)} /><StatusField value={method.status} onChange={(value) => update(method.id, "status", value)} /></div>
          <Field label="Displayed value" value={method.value} hint={method.type === "phone" ? "Include the international country code, for example +86." : undefined} onChange={(value) => update(method.id, "value", value)} />
          {method.type === "link" && <Field label="Link path or URL" value={method.href} hint="Use /contact for a localized site page, or a complete https:// URL." onChange={(value) => update(method.id, "href", value)} />}
          <div className={styles.folderActions}>
            <button type="button" onClick={() => update(method.id, "status", method.status === "archived" ? "draft" : "archived")}>{method.status === "archived" ? <Eye /> : <EyeOff />}{method.status === "archived" ? "Restore contact method" : "Hide contact method"}</button>
            <button className={styles.deleteButton} type="button" onClick={() => remove(method.id)}><Trash2 /> Delete contact method</button>
          </div>
        </FormSection>
      </div>)}
  </div>;
}

function ProcessEditor({ process, locale, update, upload, remove }: { process: ManufacturingProcess; locale: LocaleTab; update: (field: string, value: ResourceFieldValue) => void; upload: (file: File) => void; remove: () => void }) {
  const copy = locale === "zh" ? { ...process, ...process.translation.zh } : process;
  return <div className={styles.formSections}>
    <FormSection title="Process identity" description="Published processes appear on Custom and receive an individual static detail page.">
      <div className={styles.threeColumns}><Field label="Process title" value={copy.title ?? ""} onChange={(value) => update("title", value)} /><Field label="URL slug" value={process.slug} disabled={locale === "zh"} onChange={(value) => update("slug", slugify(value))} /><Field label="Index" value={process.number} disabled={locale === "zh"} onChange={(value) => update("number", value)} /></div>
      <div className={styles.twoColumns}><Field label="Sort order" type="number" value={String(process.sortOrder)} disabled={locale === "zh"} onChange={(value) => update("sortOrder", Number(value))} /><StatusField value={process.status} onChange={(value) => update("status", value)} /></div>
      <Field label="Summary" multiline rows={3} value={copy.summary ?? ""} onChange={(value) => update("summary", value)} />
      <Field label="Complete process description" multiline rows={8} value={copy.description ?? ""} hint="Separate paragraphs with a blank line." onChange={(value) => update("description", value)} />
      <Field label="Control point" multiline rows={4} value={copy.control ?? ""} onChange={(value) => update("control", value)} />
    </FormSection>
    {locale === "en" && <FormSection title="Process image" description="Used on the process detail page. Uploaded files are optimized and committed with the catalog.">
      <ImageField path={process.image} alt={process.imageAlt} onAltChange={(value) => update("imageAlt", value)} onUpload={upload} />
      <Field label="Image focus" value={process.imagePosition ?? "50% 50%"} hint="CSS object position, for example 50% 50% or 0% 50%." onChange={(value) => update("imagePosition", value)} />
    </FormSection>}
    {locale === "zh" && <FormSection title="Chinese image description" description="Optional Chinese alternative text. Empty content falls back to English."><Field label="Alternative text" value={copy.imageAlt ?? ""} onChange={(value) => update("imageAlt", value)} /></FormSection>}
    <FormSection title="Search appearance" description="Optional metadata overrides. Empty fields use the process title and summary.">
      <Field label="SEO title" maxLength={70} value={copy.seoTitle ?? ""} onChange={(value) => update("seoTitle", value)} />
      <Field label="SEO description" multiline rows={3} maxLength={180} value={copy.seoDescription ?? ""} onChange={(value) => update("seoDescription", value)} />
    </FormSection>
    {locale === "en" && <div className={styles.folderActions}>
      <button type="button" onClick={() => update("status", process.status === "archived" ? "draft" : "archived")}>{process.status === "archived" ? <Eye /> : <EyeOff />}{process.status === "archived" ? "Restore process" : "Hide process"}</button>
      <button className={styles.deleteButton} type="button" onClick={remove}><Trash2 /> Delete process</button>
    </div>}
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

function NewsPreview({ article, locale, assets }: { article: NewsArticle; locale: LocaleTab; assets: PendingAsset[] }) {
  const copy = locale === "zh" ? { ...article, ...article.translation.zh } : article;
  return <div className={styles.previewCard}>
    {article.image && <figure><img src={previewAsset(article.image, assets)} alt="" /></figure>}
    <div className={styles.previewCopy}>
      <span>{article.pinned ? "Pinned article" : copy.category}</span>
      <h2>{copy.title}</h2>
      <p>{copy.excerpt}</p>
      <dl><div><dt>Publication</dt><dd>{new Date(article.publishedAt).toLocaleString()}</dd></div><div><dt>Visibility</dt><dd>{article.status}</dd></div></dl>
    </div>
  </div>;
}

function FaqPreview({ faq, locale }: { faq: FaqItem; locale: LocaleTab }) {
  const copy = locale === "zh" ? { ...faq, ...faq.translation.zh } : faq;
  return <div className={`${styles.previewCard} ${styles.materialPreview}`}><div className={styles.previewCopy}><span>Frequently asked question</span><h2>{copy.question}</h2><p>{copy.answer}</p><dl><div><dt>Visibility</dt><dd>{faq.status}</dd></div><div><dt>Sort order</dt><dd>{faq.sortOrder}</dd></div></dl></div></div>;
}

function CertificatePreview({ certificate, locale, assets }: { certificate: QualityCertificate; locale: LocaleTab; assets: PendingAsset[] }) {
  const copy = locale === "zh" ? { ...certificate, ...certificate.translation.zh } : certificate;
  return <div className={styles.previewCard}>
    <figure><img src={previewAsset(certificate.image, assets)} alt="" style={{ objectPosition: certificate.imagePosition ?? "50% 50%" }} /></figure>
    <div className={styles.previewCopy}><span>Quality certificate</span><h2>{copy.title}</h2><p>{copy.description}</p><dl><div><dt>Visibility</dt><dd>{certificate.status}</dd></div><div><dt>Sort order</dt><dd>{certificate.sortOrder}</dd></div></dl></div>
  </div>;
}

function ContactPreview({ contact }: { contact: ContactDetails[] }) {
  const visible = contact.filter((method) => method.status === "published").sort((left, right) => left.sortOrder - right.sortOrder);
  return <div className={`${styles.previewCard} ${styles.materialPreview}`}><div className={styles.previewCopy}><span>Shared contact details</span><h2>Contact BYBOLT</h2><dl>{visible.map((method) => <div key={method.id}><dt>{method.label}</dt><dd>{method.value || "—"}</dd></div>)}</dl></div></div>;
}

function ProductGalleryEditor({ images, assets, onUpload, onUpdate, onRemove }: { images: ProductModel["gallery"]; assets: PendingAsset[]; onUpload: (files: File[]) => void; onUpdate: (imageId: string, field: "alt" | "imagePosition" | "sortOrder", value: string | number) => void; onRemove: (imageId: string) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const sortedImages = images.slice().sort((left, right) => left.sortOrder - right.sortOrder);
  return <div className={styles.galleryEditor}>
    <div className={styles.galleryToolbar}>
      <span>{images.length} / 12 additional images</span>
      <button type="button" disabled={images.length >= 12} onClick={() => input.current?.click()}><Upload /> Add images</button>
      <input ref={input} hidden multiple type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const files = Array.from(event.target.files ?? []).slice(0, 12 - images.length); if (files.length) onUpload(files); event.currentTarget.value = ""; }} />
    </div>
    {sortedImages.length === 0 ? <p className={styles.galleryEmpty}>No additional views yet. The primary product image remains visible on the public page.</p> : <div className={styles.galleryAdminGrid}>
      {sortedImages.map((image, index) => <article className={styles.galleryAdminItem} key={image.id}>
        <figure><img src={previewAsset(image.image, assets)} alt="" style={{ objectPosition: image.imagePosition ?? "50% 50%" }} /><span>{String(index + 2).padStart(2, "0")}</span></figure>
        <div className={styles.galleryAdminFields}>
          <Field label="Alternative text" value={image.alt} onChange={(value) => onUpdate(image.id, "alt", value)} />
          <div className={styles.twoColumns}>
            <Field label="Image focus" value={image.imagePosition ?? "50% 50%"} onChange={(value) => onUpdate(image.id, "imagePosition", value)} />
            <Field label="Sort order" type="number" value={String(image.sortOrder)} onChange={(value) => onUpdate(image.id, "sortOrder", Number(value))} />
          </div>
          <button className={styles.galleryRemove} type="button" onClick={() => onRemove(image.id)}><Trash2 /> Remove image</button>
        </div>
      </article>)}
    </div>}
  </div>;
}

function ProcessPreview({ process, locale, assets }: { process: ManufacturingProcess; locale: LocaleTab; assets: PendingAsset[] }) {
  const copy = locale === "zh" ? { ...process, ...process.translation.zh } : process;
  return <div className={styles.previewCard}>
    <figure><img src={previewAsset(process.image, assets)} alt="" style={{ objectPosition: process.imagePosition ?? "50% 50%" }} /></figure>
    <div className={styles.previewCopy}><span>{process.number} Custom process</span><h2>{copy.title}</h2><p>{copy.summary}</p><dl><div><dt>Visibility</dt><dd>{process.status}</dd></div><div><dt>Sort order</dt><dd>{process.sortOrder}</dd></div></dl></div>
  </div>;
}

function StatusMark({ status }: { status: PublicationStatus }) {
  return <span className={`${styles.statusMark} ${styles[status]}`} title={status}>{status === "published" ? <Check /> : status === "archived" ? <Archive /> : null}</span>;
}

function updateCategory(catalog: ProductCatalogDocument, slug: string, locale: LocaleTab, field: string, value: string | number) {
  const category = catalog.categories.find((item) => item.slug === slug);
  if (!category) return;
  if (locale === "zh" && field !== "productRange" && field !== "status" && field !== "sortOrder" && field !== "image" && field !== "slug" && field !== "index") {
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

function updateNewsArticle(catalog: ProductCatalogDocument, slug: string, locale: LocaleTab, field: string, value: ResourceFieldValue) {
  const article = catalog.news.find((item) => item.slug === slug);
  if (!article) return;
  const localizedFields = new Set(["category", "title", "excerpt", "body", "imageAlt", "seoTitle", "seoDescription"]);
  if (locale === "zh" && localizedFields.has(field)) {
    (article.translation.zh as Record<string, ResourceFieldValue>)[field] = value;
    return;
  }
  (article as unknown as Record<string, ResourceFieldValue>)[field] = value;
}

function updateFaqItem(catalog: ProductCatalogDocument, id: string, locale: LocaleTab, field: string, value: ResourceFieldValue) {
  const faq = catalog.faqs.find((item) => item.id === id);
  if (!faq) return;
  if (locale === "zh" && (field === "question" || field === "answer")) {
    (faq.translation.zh as Record<string, ResourceFieldValue>)[field] = value;
    return;
  }
  (faq as unknown as Record<string, ResourceFieldValue>)[field] = value;
}

function updateQualityCertificate(catalog: ProductCatalogDocument, id: string, locale: LocaleTab, field: string, value: ResourceFieldValue) {
  const certificate = catalog.certificates.find((item) => item.id === id);
  if (!certificate) return;
  if (locale === "zh" && (field === "title" || field === "description" || field === "alt")) {
    (certificate.translation.zh as Record<string, ResourceFieldValue>)[field] = value;
    return;
  }
  (certificate as unknown as Record<string, ResourceFieldValue>)[field] = value;
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
    if (!draft.news) draft.news = structuredClone(productCatalogDocument.news);
    if (!draft.faqs) draft.faqs = structuredClone(productCatalogDocument.faqs);
    if (!draft.certificates) draft.certificates = structuredClone(productCatalogDocument.certificates);
    if (!draft.processes) draft.processes = structuredClone(productCatalogDocument.processes);
    draft.contact = normalizeContactDetails(draft.contact);
    const result = productCatalogSchema.safeParse(draft);
    return result.success ? result.data as ProductCatalogDocument : null;
  } catch {
    return null;
  }
}

function normalizeCatalog(value: ProductCatalogDocument | Partial<ProductCatalogDocument>): ProductCatalogDocument {
  const candidate = structuredClone(value) as Partial<ProductCatalogDocument>;
  if (!candidate.materials) candidate.materials = structuredClone(productCatalogDocument.materials);
  if (!candidate.news) candidate.news = structuredClone(productCatalogDocument.news);
  if (!candidate.faqs) candidate.faqs = structuredClone(productCatalogDocument.faqs);
  if (!candidate.certificates) candidate.certificates = structuredClone(productCatalogDocument.certificates);
  if (!candidate.processes) candidate.processes = structuredClone(productCatalogDocument.processes);
  candidate.contact = normalizeContactDetails(candidate.contact);
  const result = productCatalogSchema.safeParse(candidate);
  if (!result.success) throw new Error("The repository catalog is not compatible with this editor.");
  return result.data as ProductCatalogDocument;
}

function updateManufacturingProcess(catalog: ProductCatalogDocument, slug: string, locale: LocaleTab, field: string, value: ResourceFieldValue) {
  const process = catalog.processes.find((item) => item.slug === slug);
  if (!process) return;
  const localizedFields = new Set(["title", "summary", "description", "control", "imageAlt", "seoTitle", "seoDescription"]);
  if (locale === "zh" && localizedFields.has(field)) {
    (process.translation.zh as Record<string, ResourceFieldValue>)[field] = value;
    return;
  }
  (process as unknown as Record<string, ResourceFieldValue>)[field] = value;
}

function normalizeContactDetails(value: unknown): ContactDetails[] {
  if (Array.isArray(value)) return value as ContactDetails[];
  if (value && typeof value === "object") {
    const legacy = value as { email?: string; phone?: string; wechat?: string };
    return [
      { id: "email", label: "Email", value: legacy.email ?? "", href: "", type: "email", status: "published", sortOrder: 1 },
      { id: "phone", label: "Phone", value: legacy.phone ?? "", href: "", type: "phone", status: "published", sortOrder: 2 },
      { id: "wechat", label: "WeChat", value: legacy.wechat ?? "", href: "", type: "text", status: legacy.wechat ? "published" : "archived", sortOrder: 3 },
      { id: "contact", label: "Contact", value: "Send an enquiry", href: "/contact", type: "link", status: "published", sortOrder: 4 },
    ];
  }
  return structuredClone(productCatalogDocument.contact);
}

function slugify(value: string): string {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function windowLocation(): string {
  return typeof window === "undefined" ? "/admin/" : window.location.href.split("?")[0];
}
