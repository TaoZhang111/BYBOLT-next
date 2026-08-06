import type { ProductCatalogDocument } from "@/types/product-catalog";

export const adminApiUrl = (process.env.NEXT_PUBLIC_ADMIN_API_URL || "https://bybolt-admin-api.tao1461248574.workers.dev").replace(/\/$/, "");
const SESSION_KEY = "bybolt-admin-session-v1";

export type AdminSession = {
  authenticated: boolean;
  login?: string;
  avatarUrl?: string;
  repository?: string;
};

export type PendingAsset = {
  path: string;
  contentBase64: string;
  previewUrl: string;
};

type CatalogResponse = {
  catalog: ProductCatalogDocument;
  commitSha: string;
  repository: string;
  capabilities?: string[];
};

type PublishResponse = {
  commitSha: string;
  commitUrl: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!adminApiUrl) throw new Error("The admin API URL is not configured.");
  const response = await fetch(`${adminApiUrl}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(getAdminSessionToken() ? { Authorization: `Bearer ${getAdminSessionToken()}` } : {}),
      ...init?.headers,
    },
  });
  const payload = (await response.json().catch(() => null)) as { error?: string } | null;
  if (!response.ok) throw new Error(payload?.error || `Admin API request failed (${response.status}).`);
  return payload as T;
}

export function getLoginUrl(returnTo: string): string {
  return `${adminApiUrl}/auth/login?returnTo=${encodeURIComponent(returnTo)}`;
}

export function getLogoutUrl(returnTo: string): string {
  return `${adminApiUrl}/auth/logout?returnTo=${encodeURIComponent(returnTo)}`;
}

export function captureAdminSession(): boolean {
  if (typeof window === "undefined") return false;
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const token = hash.get("bybolt_session");
  if (!token) return false;
  sessionStorage.setItem(SESSION_KEY, token);
  window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  return true;
}

export function clearAdminSession() {
  if (typeof window !== "undefined") sessionStorage.removeItem(SESSION_KEY);
}

function getAdminSessionToken(): string {
  return typeof window === "undefined" ? "" : sessionStorage.getItem(SESSION_KEY) ?? "";
}

export function getSession(): Promise<AdminSession> {
  return request<AdminSession>("/api/session", { method: "GET" });
}

export function getRepositoryCatalog(): Promise<CatalogResponse> {
  return request<CatalogResponse>("/api/catalog", { method: "GET" });
}

export function publishRepositoryCatalog(
  catalog: ProductCatalogDocument,
  files: PendingAsset[],
  message: string,
  expectedCommitSha: string,
): Promise<PublishResponse> {
  return request<PublishResponse>("/api/publish", {
    method: "POST",
    body: JSON.stringify({
      catalog,
      message,
      expectedCommitSha,
      files: files.map(({ path, contentBase64 }) => ({ path, contentBase64 })),
    }),
  });
}
