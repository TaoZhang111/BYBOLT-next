import type { AdminEnv } from "./env";

type ActorSession = { login: string };
type FieldKind = "text" | "number";
type ResourceDefinition = { table: string; fields: Record<string, FieldKind>; required: string[]; search: string[]; defaultStatus?: string };

const resources = {
  leads: { table: "customs_leads", fields: { importer_name: "text", country: "text", contact_name: "text", email: "text", whatsapp: "text", hs_code: "text", product_interest: "text", supplier: "text", last_shipment_date: "text", shipment_count: "number", opportunity_stage: "text", source: "text", notes: "text" }, required: ["importer_name"], search: ["importer_name", "country", "product_interest", "hs_code", "contact_name"], defaultStatus: "new" },
  quotes: { table: "quotes", fields: { status: "text", company: "text", contact_name: "text", email: "text", whatsapp: "text", country: "text", destination: "text", application: "text", target_delivery: "text", currency: "text", subtotal: "number", freight: "number", tax: "number", total: "number", bom: "text", testing: "text", notes: "text", confidentiality: "number", source: "text" }, required: ["company"], search: ["id", "company", "contact_name", "email", "application"], defaultStatus: "draft" },
  contracts: { table: "contracts", fields: { contract_no: "text", quote_id: "text", customer_company: "text", status: "text", currency: "text", total_amount: "number", signed_date: "text", delivery_date: "text", terms: "text", notes: "text" }, required: ["contract_no", "customer_company"], search: ["contract_no", "customer_company", "quote_id"], defaultStatus: "draft" },
  settlements: { table: "settlements", fields: { settlement_no: "text", contract_id: "text", status: "text", currency: "text", amount: "number", due_date: "text", paid_date: "text", payment_method: "text", reference: "text", notes: "text" }, required: ["settlement_no"], search: ["settlement_no", "contract_id", "reference"], defaultStatus: "unpaid" },
  drawings: { table: "drawings", fields: { drawing_no: "text", quote_id: "text", contract_id: "text", project_name: "text", owner_type: "text", product_name: "text", version: "text", filename: "text", object_key: "text", content_type: "text", size_bytes: "number", status: "text", notes: "text" }, required: ["drawing_no", "filename", "object_key"], search: ["drawing_no", "filename", "project_name", "product_name", "quote_id"], defaultStatus: "active" },
  templates: { table: "templates", fields: { type: "text", name: "text", subject: "text", content: "text", status: "text" }, required: ["name"], search: ["name", "type", "subject"], defaultStatus: "active" },
  settings: { table: "settings", fields: { category: "text", setting_key: "text", setting_value: "text", description: "text" }, required: ["setting_key"], search: ["setting_key", "category", "description"] },
} satisfies Record<string, ResourceDefinition>;

type ResourceName = keyof typeof resources;

class BusinessError extends Error { constructor(public status: number, message: string) { super(message); } }

export async function handleBusinessRequest(request: Request, env: AdminEnv, session: ActorSession): Promise<Response> {
  const url = new URL(request.url);
  const parts = url.pathname.split("/").filter(Boolean);
  if (url.pathname === "/api/business/overview" && request.method === "GET") return overview(env);
  if (url.pathname === "/api/business/drawings/upload" && request.method === "POST") return uploadDrawing(request, env, session);
  const resourceName = parts[2] as ResourceName;
  const definition = resources[resourceName];
  if (!definition) throw new BusinessError(404, "Business resource not found.");
  const id = parts[3];
  const action = parts[4];

  if (resourceName === "drawings" && id && action === "file" && request.method === "GET") return drawingFile(env, id);
  if (resourceName === "quotes" && id && action === "contract" && request.method === "POST") return createContractFromQuote(env, session, id);
  if (resourceName === "contracts" && id && action === "settlement" && request.method === "POST") return createSettlementFromContract(env, session, id);
  if (request.method === "GET" && !id) return listRecords(env, definition, url);
  if (request.method === "POST" && !id) return createRecord(request, env, session, resourceName, definition);
  if (request.method === "PATCH" && id) return updateRecord(request, env, session, resourceName, definition, id);
  if (request.method === "DELETE" && id) return deleteRecord(env, session, resourceName, definition, id);
  throw new BusinessError(405, "Method not allowed.");
}

async function overview(env: AdminEnv) {
  const statements = [
    env.DB.prepare("SELECT COUNT(*) AS count FROM customs_leads WHERE opportunity_stage NOT IN ('lost','archived')"),
    env.DB.prepare("SELECT COUNT(*) AS count FROM quotes WHERE status IN ('new','draft','quoted')"),
    env.DB.prepare("SELECT COUNT(*) AS count FROM contracts WHERE status IN ('draft','confirmed','in_production')"),
    env.DB.prepare("SELECT COALESCE(SUM(amount),0) AS amount FROM settlements WHERE status = 'unpaid'"),
    env.DB.prepare("SELECT id, company, status, total, currency, created_at FROM quotes ORDER BY created_at DESC LIMIT 6"),
  ];
  const [leads, quotes, contracts, outstanding, recent] = await env.DB.batch(statements);
  const metric = (result: D1Result, key: string) => Number((result.results[0] as Record<string, unknown> | undefined)?.[key] ?? 0);
  return json({ counts: { leads: metric(leads, "count"), quotes: metric(quotes, "count"), contracts: metric(contracts, "count"), outstanding: metric(outstanding, "amount") }, recentQuotes: recent.results });
}

async function listRecords(env: AdminEnv, definition: ResourceDefinition, url: URL) {
  const search = (url.searchParams.get("search") ?? "").trim().slice(0, 120);
  const status = (url.searchParams.get("status") ?? "").trim().slice(0, 40);
  const clauses: string[] = [];
  const values: unknown[] = [];
  if (search) { clauses.push(`(${definition.search.map((field) => `${field} LIKE ?`).join(" OR ")})`); definition.search.forEach(() => values.push(`%${search}%`)); }
  const statusColumn = definition.fields.status ? "status" : definition.fields.opportunity_stage ? "opportunity_stage" : "";
  if (status && statusColumn) { clauses.push(`${statusColumn} = ?`); values.push(status); }
  const where = clauses.length ? ` WHERE ${clauses.join(" AND ")}` : "";
  const query = `SELECT * FROM ${definition.table}${where} ORDER BY updated_at DESC LIMIT 200`;
  const result = await env.DB.prepare(query).bind(...values).all();
  return json({ records: result.results });
}

async function createRecord(request: Request, env: AdminEnv, session: ActorSession, name: ResourceName, definition: ResourceDefinition) {
  const body = await readJson(request);
  const values = sanitize(definition, body);
  for (const field of definition.required) if (!String(values[field] ?? "").trim()) throw new BusinessError(400, `${field} is required.`);
  if (definition.defaultStatus) {
    const statusField = definition.fields.status ? "status" : "opportunity_stage";
    values[statusField] ||= definition.defaultStatus;
  }
  const id = typeof body.id === "string" && /^[-A-Za-z0-9]{4,80}$/.test(body.id) ? body.id : `${name.slice(0, 3)}-${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  const columns = ["id", ...Object.keys(values), "created_at", "updated_at"];
  const params = [id, ...Object.values(values), now, now];
  await env.DB.prepare(`INSERT INTO ${definition.table} (${columns.join(",")}) VALUES (${columns.map(() => "?").join(",")})`).bind(...params).run();
  await audit(env, session.login, "create", name, id);
  return json({ record: await findRecord(env, definition, id) }, 201);
}

async function updateRecord(request: Request, env: AdminEnv, session: ActorSession, name: ResourceName, definition: ResourceDefinition, id: string) {
  const body = await readJson(request);
  const values = sanitize(definition, body);
  if (!Object.keys(values).length) throw new BusinessError(400, "No valid fields supplied.");
  values.updated_at = new Date().toISOString();
  await env.DB.prepare(`UPDATE ${definition.table} SET ${Object.keys(values).map((field) => `${field} = ?`).join(", ")} WHERE id = ?`).bind(...Object.values(values), id).run();
  await audit(env, session.login, "update", name, id);
  return json({ record: await findRecord(env, definition, id) });
}

async function deleteRecord(env: AdminEnv, session: ActorSession, name: ResourceName, definition: ResourceDefinition, id: string) {
  if (name === "drawings") {
    const drawing = await findRecord(env, definition, id) as { object_key?: string } | null;
    if (drawing?.object_key) await env.DRAWINGS.delete(drawing.object_key);
  }
  await env.DB.prepare(`DELETE FROM ${definition.table} WHERE id = ?`).bind(id).run();
  await audit(env, session.login, "delete", name, id);
  return json({ deleted: true });
}

async function createContractFromQuote(env: AdminEnv, session: ActorSession, quoteId: string) {
  const quote = await env.DB.prepare("SELECT * FROM quotes WHERE id = ?").bind(quoteId).first<Record<string, unknown>>();
  if (!quote) throw new BusinessError(404, "Quote not found.");
  const existing = await env.DB.prepare("SELECT * FROM contracts WHERE quote_id = ? LIMIT 1").bind(quoteId).first();
  if (existing) return json({ record: existing });
  const id = `con-${crypto.randomUUID()}`;
  const contractNo = `BYB-SC-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`;
  const now = new Date().toISOString();
  await env.DB.prepare("INSERT INTO contracts (id,contract_no,quote_id,customer_company,status,currency,total_amount,delivery_date,terms,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)").bind(id, contractNo, quoteId, quote.company, "draft", quote.currency, quote.total, quote.target_delivery, "Payment and delivery terms to be confirmed.", now, now).run();
  await env.DB.prepare("UPDATE quotes SET status = 'confirmed', updated_at = ? WHERE id = ?").bind(now, quoteId).run();
  await audit(env, session.login, "generate_contract", "quotes", quoteId, contractNo);
  return json({ record: await env.DB.prepare("SELECT * FROM contracts WHERE id = ?").bind(id).first() }, 201);
}

async function createSettlementFromContract(env: AdminEnv, session: ActorSession, contractId: string) {
  const contract = await env.DB.prepare("SELECT * FROM contracts WHERE id = ?").bind(contractId).first<Record<string, unknown>>();
  if (!contract) throw new BusinessError(404, "Contract not found.");
  const id = `set-${crypto.randomUUID()}`;
  const settlementNo = `BYB-SET-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`;
  const now = new Date().toISOString();
  await env.DB.prepare("INSERT INTO settlements (id,settlement_no,contract_id,status,currency,amount,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)").bind(id, settlementNo, contractId, "unpaid", contract.currency, contract.total_amount, now, now).run();
  await audit(env, session.login, "generate_settlement", "contracts", contractId, settlementNo);
  return json({ record: await env.DB.prepare("SELECT * FROM settlements WHERE id = ?").bind(id).first() }, 201);
}

async function uploadDrawing(request: Request, env: AdminEnv, session: ActorSession) {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (!length || length > 12 * 1024 * 1024) throw new BusinessError(length ? 413 : 411, "Drawing upload must be 10 MB or smaller.");
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || !file.size || file.size > 10 * 1024 * 1024) throw new BusinessError(400, "A drawing file up to 10 MB is required.");
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!new Set(["pdf", "dwg", "dxf", "step", "stp", "jpg", "jpeg", "png", "webp", "xlsx", "xls", "csv"]).has(extension)) throw new BusinessError(400, "Unsupported drawing format.");
  const id = `drw-${crypto.randomUUID()}`;
  const safeName = file.name.replace(/[^A-Za-z0-9._-]+/g, "-").slice(-160);
  const key = `drawings/${new Date().getUTCFullYear()}/${id}/${safeName}`;
  await env.DRAWINGS.put(key, file.stream(), { httpMetadata: { contentType: file.type || "application/octet-stream" }, customMetadata: { uploadedBy: session.login } });
  const now = new Date().toISOString();
  const values = [id, value(form, "drawing_no", 120) || safeName.replace(/\.[^.]+$/, ""), value(form, "quote_id", 100) || null, value(form, "contract_id", 100) || null, value(form, "project_name", 180), value(form, "owner_type", 30) || "customer", value(form, "product_name", 180), value(form, "version", 30) || "A", file.name, key, file.type || "application/octet-stream", file.size, value(form, "notes", 1000), now, now];
  try {
    await env.DB.prepare("INSERT INTO drawings (id,drawing_no,quote_id,contract_id,project_name,owner_type,product_name,version,filename,object_key,content_type,size_bytes,notes,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)").bind(...values).run();
  } catch (error) { await env.DRAWINGS.delete(key); throw error; }
  await audit(env, session.login, "upload", "drawings", id, file.name);
  return json({ record: await findRecord(env, resources.drawings, id) }, 201);
}

async function drawingFile(env: AdminEnv, id: string) {
  const drawing = await findRecord(env, resources.drawings, id) as { object_key?: string; filename?: string; content_type?: string } | null;
  if (!drawing?.object_key) throw new BusinessError(404, "Drawing not found.");
  const object = await env.DRAWINGS.get(drawing.object_key);
  if (!object) throw new BusinessError(404, "Drawing file not found.");
  return new Response(object.body, { headers: { "Content-Type": drawing.content_type || "application/octet-stream", "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(drawing.filename || "drawing")}`, ETag: object.httpEtag } });
}

function sanitize(definition: ResourceDefinition, body: Record<string, unknown>) {
  const result: Record<string, string | number | null> = {};
  const nullableForeignKeys = new Set(["quote_id", "contract_id"]);
  for (const [field, kind] of Object.entries(definition.fields)) {
    if (!(field in body)) continue;
    if (kind === "number") { const number = Number(body[field]); if (!Number.isFinite(number)) throw new BusinessError(400, `${field} must be a number.`); result[field] = number; }
    else {
      const text = String(body[field] ?? "").trim().slice(0, field === "content" || field === "bom" ? 20_000 : field === "notes" || field === "terms" ? 5_000 : 500);
      result[field] = nullableForeignKeys.has(field) && !text ? null : text;
    }
  }
  return result;
}

async function findRecord(env: AdminEnv, definition: ResourceDefinition, id: string) { return env.DB.prepare(`SELECT * FROM ${definition.table} WHERE id = ?`).bind(id).first(); }
async function audit(env: AdminEnv, actor: string, action: string, entityType: string, entityId: string, details = "") { await env.DB.prepare("INSERT INTO audit_log (id,actor,action,entity_type,entity_id,details,created_at) VALUES (?,?,?,?,?,?,?)").bind(`aud-${crypto.randomUUID()}`, actor, action, entityType, entityId, details.slice(0, 1000), new Date().toISOString()).run(); }
async function readJson(request: Request) {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (!length) throw new BusinessError(411, "Content-Length is required.");
  if (length > 512 * 1024) throw new BusinessError(413, "Request is too large.");
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > 512 * 1024) throw new BusinessError(413, "Request is too large.");
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch { throw new BusinessError(400, "Valid JSON is required."); }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new BusinessError(400, "JSON object required.");
  return parsed as Record<string, unknown>;
}
function value(form: FormData, name: string, max: number) { return String(form.get(name) ?? "").trim().slice(0, max); }
function json(value: unknown, status = 200) { return Response.json(value, { status, headers: { "Cache-Control": "no-store" } }); }

export { BusinessError };
