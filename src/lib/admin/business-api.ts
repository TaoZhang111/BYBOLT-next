import { adminApiUrl } from "./api";

const SESSION_KEY = "bybolt-admin-session-v1";

export type BusinessResource = "leads" | "quotes" | "contracts" | "settlements" | "drawings" | "templates" | "settings";
export type BusinessRecord = Record<string, string | number | null> & { id: string; created_at?: string; updated_at?: string };
export type BusinessOverview = { counts: { leads: number; quotes: number; contracts: number; outstanding: number }; recentQuotes: BusinessRecord[] };

function token() { return typeof window === "undefined" ? "" : sessionStorage.getItem(SESSION_KEY) ?? ""; }

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${adminApiUrl}${path}`, {
    ...init,
    credentials: "include",
    headers: { ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }), ...(token() ? { Authorization: `Bearer ${token()}` } : {}), ...init?.headers },
  });
  const payload = await response.json().catch(() => null) as { error?: string } | null;
  if (!response.ok) throw new Error(payload?.error || `Business API failed (${response.status}).`);
  return payload as T;
}

export function getBusinessOverview() { return request<BusinessOverview>("/api/business/overview"); }
export function listBusinessRecords(resource: BusinessResource, search = "") { return request<{ records: BusinessRecord[] }>(`/api/business/${resource}?search=${encodeURIComponent(search)}`); }
export function createBusinessRecord(resource: BusinessResource, values: Record<string, unknown>) { return request<{ record: BusinessRecord }>(`/api/business/${resource}`, { method: "POST", body: JSON.stringify(values) }); }
export function updateBusinessRecord(resource: BusinessResource, id: string, values: Record<string, unknown>) { return request<{ record: BusinessRecord }>(`/api/business/${resource}/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(values) }); }
export function deleteBusinessRecord(resource: BusinessResource, id: string) { return request<{ deleted: boolean }>(`/api/business/${resource}/${encodeURIComponent(id)}`, { method: "DELETE" }); }
export function generateContract(quoteId: string) { return request<{ record: BusinessRecord }>(`/api/business/quotes/${encodeURIComponent(quoteId)}/contract`, { method: "POST" }); }
export function generateSettlement(contractId: string) { return request<{ record: BusinessRecord }>(`/api/business/contracts/${encodeURIComponent(contractId)}/settlement`, { method: "POST" }); }
export function drawingDownloadUrl(id: string) { return `${adminApiUrl}/api/business/drawings/${encodeURIComponent(id)}/file`; }

export function uploadBusinessDrawing(values: Record<string, string>, file: File) {
  const body = new FormData();
  Object.entries(values).forEach(([key, value]) => body.set(key, value));
  body.set("file", file, file.name);
  return request<{ record: BusinessRecord }>("/api/business/drawings/upload", { method: "POST", body });
}
