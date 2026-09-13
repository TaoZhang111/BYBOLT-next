const MAX_BODY_BYTES = 4 * 1024 * 1024;
const MAX_ATTACHMENT_BYTES = 3 * 1024 * 1024;
const MAX_ATTACHMENTS = 8;
const MAX_ITEMS = 25;
const allowedExtensions = new Set(["pdf", "dwg", "dxf", "step", "stp", "xls", "xlsx", "csv", "jpg", "jpeg", "png", "webp"]);
const allowedUnits = new Set(["pcs", "sets", "kg"]);

type QuoteItem = {
  productName: string;
  material: string;
  requestedSize: string;
  standard: string;
  quantity: string;
  quantityUnit: string;
  notes: string;
};

class RequestError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);
}

function text(form: FormData, name: string, max: number, required = false) {
  const value = String(form.get(name) ?? "").trim();
  if (required && !value) throw new RequestError(400, `${name} is required.`);
  if (value.length > max) throw new RequestError(400, `${name} is too long.`);
  return value;
}

function parseItems(form: FormData): QuoteItem[] {
  const raw = text(form, "items", 50_000);
  if (!raw) return [];
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch { throw new RequestError(400, "Quote list is invalid."); }
  if (!Array.isArray(parsed) || parsed.length > MAX_ITEMS) throw new RequestError(400, "Quote list is invalid.");
  return parsed.map((value, index) => {
    if (!value || typeof value !== "object") throw new RequestError(400, `Quote line ${index + 1} is invalid.`);
    const source = value as Record<string, unknown>;
    const field = (key: string, max: number) => {
      const result = typeof source[key] === "string" ? source[key].trim() : "";
      if (result.length > max) throw new RequestError(400, `Quote line ${index + 1} is too long.`);
      return result;
    };
    const productName = field("productName", 180);
    const quantity = field("quantity", 20);
    const quantityUnit = field("quantityUnit", 10) || "pcs";
    if (!productName || !Number.isFinite(Number(quantity)) || Number(quantity) <= 0 || !allowedUnits.has(quantityUnit)) throw new RequestError(400, `Quote line ${index + 1} is incomplete.`);
    return { productName, material: field("material", 120), requestedSize: field("requestedSize", 140), standard: field("standard", 180), quantity, quantityUnit, notes: field("notes", 500) };
  });
}

function corsHeaders(origin: string | null, env: Env) {
  const allowed = new Set(env.ALLOWED_ORIGINS.split(",").map((value) => value.trim()).filter(Boolean));
  return {
    "Access-Control-Allow-Origin": origin && allowed.has(origin) ? origin : "",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Accept, Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function json(body: unknown, status: number, origin: string | null, env: Env) {
  return Response.json(body, { status, headers: corsHeaders(origin, env) });
}

function rows(items: QuoteItem[]) {
  if (!items.length) return "<p>No structured quote lines; see the BOM field or attachments.</p>";
  return `<table style="border-collapse:collapse;width:100%;font-family:Arial,sans-serif;font-size:13px"><thead><tr>${["#", "Product / drawing", "Material", "Size", "Quantity", "Standard", "Notes"].map((heading) => `<th style="border:1px solid #bbb;padding:8px;text-align:left;background:#eee">${heading}</th>`).join("")}</tr></thead><tbody>${items.map((item, index) => `<tr>${[String(index + 1), item.productName, item.material, item.requestedSize, `${item.quantity} ${item.quantityUnit}`, item.standard, item.notes].map((value) => `<td style="border:1px solid #bbb;padding:8px;vertical-align:top">${escapeHtml(value) || "—"}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
}

function asText(items: QuoteItem[]) {
  return items.map((item, index) => `${index + 1}. ${item.productName}\n   Material: ${item.material || "—"}\n   Size/drawing: ${item.requestedSize || "—"}\n   Quantity: ${item.quantity} ${item.quantityUnit}\n   Standard: ${item.standard || "—"}\n   Notes: ${item.notes || "—"}`).join("\n\n") || "No structured quote lines; see BOM or attachments.";
}

export default {
  async fetch(request, env): Promise<Response> {
    const origin = request.headers.get("Origin");
    const allowed = new Set(env.ALLOWED_ORIGINS.split(",").map((value) => value.trim()).filter(Boolean));
    if (request.method === "OPTIONS") return new Response(null, { status: origin && allowed.has(origin) ? 204 : 403, headers: corsHeaders(origin, env) });
    if (request.method === "GET" && new URL(request.url).pathname === "/health") {
      const database = await env.DB.prepare("SELECT 1 AS ok").first<{ ok: number }>();
      return json({ ok: true, database: database?.ok === 1, service: "bybolt-quote-api", recipientConfigured: Boolean(env.RECIPIENT_EMAIL) }, 200, origin, env);
    }
    if (request.method !== "POST" || !["/", "/api/quote"].includes(new URL(request.url).pathname)) return json({ error: "Not found." }, 404, origin, env);
    if (!origin || !allowed.has(origin)) return json({ error: "Origin is not allowed." }, 403, origin, env);

    const contentLength = Number(request.headers.get("Content-Length"));
    if (!contentLength) return json({ error: "Content-Length is required." }, 411, origin, env);
    if (contentLength > MAX_BODY_BYTES) return json({ error: "Request is too large." }, 413, origin, env);

    let inquiry = "";
    try {
      const form = await request.formData();
      inquiry = `BYB-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
      if (text(form, "website", 240)) return json({ inquiry }, 200, origin, env);

      const name = text(form, "name", 120, true);
      const email = text(form, "email", 180, true);
      const company = text(form, "company", 180, true);
      const whatsapp = text(form, "whatsapp", 80);
      const country = text(form, "country", 120, true);
      const application = text(form, "application", 240);
      const targetDelivery = text(form, "targetDelivery", 40);
      const destination = text(form, "destination", 180, true);
      const bom = text(form, "bom", 12_000);
      const notes = text(form, "notes", 5_000);
      const testingOther = text(form, "testingOther", 240);
      const privacyConsent = text(form, "privacyConsent", 20);
      if (!privacyConsent) throw new RequestError(400, "Consent is required.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new RequestError(400, "Email is invalid.");
      const items = parseItems(form);
      if (!items.length && !bom) throw new RequestError(400, "At least one quote line or BOM is required.");

      const files = form.getAll("attachments").filter((value): value is File => value instanceof File && value.size > 0);
      if (files.length > MAX_ATTACHMENTS) throw new RequestError(400, "Too many attachments.");
      let attachmentBytes = 0;
      for (const file of files) {
        attachmentBytes += file.size;
        const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
        if (!allowedExtensions.has(extension)) throw new RequestError(400, `Unsupported attachment: ${file.name}`);
      }
      if (attachmentBytes > MAX_ATTACHMENT_BYTES) throw new RequestError(413, "Attachments are too large.");

      const testing = form.getAll("testing").map(String).map((value) => value.slice(0, 120));
      if (testingOther) testing.push(testingOther);
      const confidential = Boolean(form.get("confidentiality"));
      const preparedFiles = await Promise.all(files.map(async (file) => ({ file, content: await file.arrayBuffer(), key: `inquiries/${inquiry}/${crypto.randomUUID()}-${file.name.replace(/[^A-Za-z0-9._-]+/g, "-").slice(-160)}` })));
      for (const attachment of preparedFiles) await env.DRAWINGS.put(attachment.key, attachment.content, { httpMetadata: { contentType: attachment.file.type || "application/octet-stream" } });
      const now = new Date().toISOString();
      const databaseStatements = [
        env.DB.prepare("INSERT INTO quotes (id,status,company,contact_name,email,whatsapp,country,destination,application,target_delivery,currency,bom,testing,notes,confidentiality,source,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)").bind(inquiry, "new", company, name, email, whatsapp, country, destination, application, targetDelivery, "USD", bom, testing.join(", "), notes, confidential ? 1 : 0, "website", now, now),
        ...items.map((item, index) => env.DB.prepare("INSERT INTO quote_items (id,quote_id,product_name,material,requested_size,standard,quantity,quantity_unit,notes,sort_order) VALUES (?,?,?,?,?,?,?,?,?,?)").bind(`qit-${crypto.randomUUID()}`, inquiry, item.productName, item.material, item.requestedSize, item.standard, Number(item.quantity), item.quantityUnit, item.notes, index)),
        ...preparedFiles.map((attachment, index) => env.DB.prepare("INSERT INTO drawings (id,drawing_no,quote_id,project_name,owner_type,product_name,version,filename,object_key,content_type,size_bytes,status,notes,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)").bind(`drw-${crypto.randomUUID()}`, `${inquiry}-${String(index + 1).padStart(2, "0")}`, inquiry, application, "customer", "RFQ attachment", "1", attachment.file.name, attachment.key, attachment.file.type || "application/octet-stream", attachment.file.size, "active", "Uploaded with website RFQ", now, now)),
      ];
      try { await env.DB.batch(databaseStatements); } catch (error) { for (const attachment of preparedFiles) await env.DRAWINGS.delete(attachment.key); throw error; }
      const safeCompany = company.replace(/[\r\n]/g, " ").slice(0, 80);
      const details = [
        ["Inquiry", inquiry], ["Buyer", name], ["Company", company], ["Email", email], ["WhatsApp / phone", whatsapp || "—"], ["Country", country], ["Destination", destination], ["Application / project", application || "—"], ["Target delivery", targetDelivery || "—"], ["Testing", testing.join(", ") || "—"], ["Confidentiality", confidential ? "Requested" : "Not requested"],
      ];
      const htmlDetails = details.map(([label, value]) => `<tr><th style="padding:6px 10px;text-align:left;background:#f3f3f3">${escapeHtml(label)}</th><td style="padding:6px 10px">${escapeHtml(value)}</td></tr>`).join("");
      const html = `<div style="font-family:Arial,sans-serif;color:#222"><h1>BYBOLT RFQ ${escapeHtml(inquiry)}</h1><table style="border-collapse:collapse;margin-bottom:24px">${htmlDetails}</table><h2>Quote list</h2>${rows(items)}<h2>BOM / procurement list</h2><pre style="white-space:pre-wrap">${escapeHtml(bom || "—")}</pre><h2>Quote notes</h2><pre style="white-space:pre-wrap">${escapeHtml(notes || "—")}</pre><p>${files.length} attachment(s) included.</p></div>`;
      const plain = `${details.map(([label, value]) => `${label}: ${value}`).join("\n")}\n\nQUOTE LIST\n${asText(items)}\n\nBOM / PROCUREMENT LIST\n${bom || "—"}\n\nQUOTE NOTES\n${notes || "—"}\n\nAttachments: ${files.length}`;

      await env.EMAIL.send({
        to: env.RECIPIENT_EMAIL,
        from: env.SENDER_EMAIL,
        replyTo: email,
        subject: `[BYBOLT RFQ ${inquiry}] ${safeCompany}`,
        text: plain,
        html,
        attachments: preparedFiles.map(({ file, content }) => ({ disposition: "attachment" as const, filename: file.name.replace(/[\r\n]/g, " ").slice(0, 180), type: file.type || "application/octet-stream", content })),
      });
      console.log(JSON.stringify({ event: "rfq_sent", inquiry, itemCount: items.length, attachmentCount: files.length }));
      return json({ inquiry }, 200, origin, env);
    } catch (error) {
      const status = error instanceof RequestError ? error.status : 500;
      if (inquiry) {
        try { await env.DB.prepare("UPDATE quotes SET status = 'delivery_failed', updated_at = ? WHERE id = ?").bind(new Date().toISOString(), inquiry).run(); } catch { /* Preserve the original failure response. */ }
      }
      console.error(JSON.stringify({ event: "rfq_failed", status, message: error instanceof Error ? error.message : "Unknown error" }));
      return json({ error: status < 500 && error instanceof Error ? error.message : "The RFQ could not be delivered." }, status, origin, env);
    }
  },
} satisfies ExportedHandler<Env>;
