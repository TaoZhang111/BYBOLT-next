import { productCatalogSchema } from "../../../src/lib/products/schema";

type Env = {
  ADMIN_ORIGIN: string;
  GITHUB_OWNER: string;
  GITHUB_REPO: string;
  GITHUB_BRANCH: string;
  ALLOWED_GITHUB_LOGIN: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  SESSION_SECRET: string;
};

type Session = { token: string; login: string; avatarUrl: string; exp: number };
type StatePayload = { returnTo: string; exp: number };
type GitHubUser = { login: string; avatar_url: string };
type GitHubRepository = { full_name: string; permissions?: { push?: boolean } };

const SESSION_COOKIE = "bybolt_admin_session";
const STATE_COOKIE = "bybolt_oauth_state";
const CATALOG_PATH = "src/content/product-catalog.json";
const MAX_BODY_BYTES = 18 * 1024 * 1024;
const MAX_FILE_BYTES = 5 * 1024 * 1024;

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return corsResponse(request, env, new Response(null, { status: 204 }));

    try {
      if (url.pathname === "/health") return json({ ok: true, repository: `${env.GITHUB_OWNER}/${env.GITHUB_REPO}` });
      if (url.pathname === "/auth/login") return beginLogin(request, env);
      if (url.pathname === "/auth/callback") return completeLogin(request, env);
      if (url.pathname === "/auth/logout") return logout(request, env);
      if (url.pathname === "/api/session" && request.method === "GET") return corsResponse(request, env, await sessionResponse(request, env));

      if (url.pathname.startsWith("/api/")) {
        enforceOrigin(request, env);
        const session = await readSession(request, env);
        if (!session) return corsResponse(request, env, json({ error: "Authentication required." }, 401));
        if (url.pathname === "/api/catalog" && request.method === "GET") return corsResponse(request, env, await readCatalog(env, session));
        if (url.pathname === "/api/publish" && request.method === "POST") return corsResponse(request, env, await publishCatalog(request, env, session));
      }
      return json({ error: "Not found." }, 404);
    } catch (error) {
      const status = error instanceof ApiError ? error.status : 500;
      const message = error instanceof Error ? error.message : "Unexpected admin API error.";
      return corsResponse(request, env, json({ error: message }, status));
    }
  },
};

export default worker;

async function beginLogin(request: Request, env: Env): Promise<Response> {
  assertConfiguration(env);
  const url = new URL(request.url);
  const returnTo = safeReturnTo(url.searchParams.get("returnTo"), env);
  const state = await encryptToken({ returnTo, exp: Date.now() + 10 * 60 * 1000 }, env.SESSION_SECRET);
  const redirectUri = `${url.origin}/auth/callback`;
  const authorize = new URL("https://github.com/login/oauth/authorize");
  authorize.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
  authorize.searchParams.set("redirect_uri", redirectUri);
  authorize.searchParams.set("state", state);
  return new Response(null, {
    status: 302,
    headers: {
      Location: authorize.toString(),
      "Set-Cookie": cookie(STATE_COOKIE, state, { maxAge: 600, sameSite: "Lax" }),
      "Cache-Control": "no-store",
    },
  });
}

async function completeLogin(request: Request, env: Env): Promise<Response> {
  assertConfiguration(env);
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = readCookie(request, STATE_COOKIE);
  if (!code || !state || !storedState || !timingSafeEqual(state, storedState)) throw new ApiError(400, "Invalid or expired GitHub login state.");
  const statePayload = await decryptToken<StatePayload>(state, env.SESSION_SECRET);
  if (!statePayload || statePayload.exp < Date.now()) throw new ApiError(400, "GitHub login state has expired.");

  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json", "User-Agent": "BYBOLT-Admin" },
    body: JSON.stringify({ client_id: env.GITHUB_CLIENT_ID, client_secret: env.GITHUB_CLIENT_SECRET, code }),
  });
  const tokenPayload = await tokenResponse.json() as { access_token?: string; error_description?: string };
  if (!tokenResponse.ok || !tokenPayload.access_token) throw new ApiError(401, tokenPayload.error_description || "GitHub did not issue an access token.");

  const user = await github<GitHubUser>(env, tokenPayload.access_token, "/user");
  if (user.login.toLowerCase() !== env.ALLOWED_GITHUB_LOGIN.toLowerCase()) throw new ApiError(403, "This GitHub account is not authorized for BYBOLT Admin.");
  const repository = await github<GitHubRepository>(env, tokenPayload.access_token, `/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}`);
  if (repository.permissions && !repository.permissions.push) throw new ApiError(403, "The GitHub App does not have write access to the BYBOLT repository.");

  const encryptedSession = await encryptToken({ token: tokenPayload.access_token, login: user.login, avatarUrl: user.avatar_url, exp: Date.now() + 8 * 60 * 60 * 1000 }, env.SESSION_SECRET);
  return new Response(null, {
    status: 302,
    headers: [
      ["Location", `${statePayload.returnTo.split("#")[0]}#bybolt_session=${encodeURIComponent(encryptedSession)}`],
      ["Set-Cookie", cookie(SESSION_COOKIE, encryptedSession, { maxAge: 8 * 60 * 60, sameSite: "None" })],
      ["Set-Cookie", cookie(STATE_COOKIE, "", { maxAge: 0, sameSite: "Lax" })],
      ["Cache-Control", "no-store"],
    ],
  });
}

function logout(request: Request, env: Env): Response {
  const url = new URL(request.url);
  return new Response(null, {
    status: 302,
    headers: {
      Location: safeReturnTo(url.searchParams.get("returnTo"), env),
      "Set-Cookie": cookie(SESSION_COOKIE, "", { maxAge: 0, sameSite: "None" }),
      "Cache-Control": "no-store",
    },
  });
}

async function sessionResponse(request: Request, env: Env): Promise<Response> {
  enforceOrigin(request, env);
  const session = await readSession(request, env);
  if (!session) return json({ authenticated: false });
  return json({ authenticated: true, login: session.login, avatarUrl: session.avatarUrl, repository: `${env.GITHUB_OWNER}/${env.GITHUB_REPO}` });
}

async function readCatalog(env: Env, session: Session): Promise<Response> {
  const result = await github<{ content: string; encoding: string; sha: string }>(env, session.token, `/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${CATALOG_PATH}?ref=${encodeURIComponent(env.GITHUB_BRANCH)}`);
  if (result.encoding !== "base64") throw new ApiError(502, "GitHub returned an unsupported catalog encoding.");
  const catalog = productCatalogSchema.parse(JSON.parse(decodeUtf8(result.content.replace(/\s/g, ""))));
  const ref = await getHead(env, session.token);
  return json({ catalog, commitSha: ref.object.sha, repository: `${env.GITHUB_OWNER}/${env.GITHUB_REPO}` });
}

async function publishCatalog(request: Request, env: Env, session: Session): Promise<Response> {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) throw new ApiError(413, "Publish payload is too large.");
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) throw new ApiError(413, "Publish payload is too large.");
  const body = JSON.parse(raw) as { catalog?: unknown; files?: unknown; message?: unknown; expectedCommitSha?: unknown };
  const catalog = productCatalogSchema.parse(body.catalog);
  const message = typeof body.message === "string" && body.message.trim() ? body.message.trim().slice(0, 72) : "Update product catalog";
  const expectedCommitSha = typeof body.expectedCommitSha === "string" ? body.expectedCommitSha : "";
  const files = parseFiles(body.files);
  const head = await getHead(env, session.token);
  if (expectedCommitSha && head.object.sha !== expectedCommitSha) throw new ApiError(409, "The repository changed after this editor loaded. Reload the catalog before publishing.");

  const parent = await github<{ tree: { sha: string } }>(env, session.token, `/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/git/commits/${head.object.sha}`);
  const entries: Array<{ path: string; mode: "100644"; type: "blob"; sha: string }> = [];
  const catalogBlob = await createBlob(env, session.token, encodeUtf8(`${JSON.stringify(catalog, null, 2)}\n`));
  entries.push({ path: CATALOG_PATH, mode: "100644", type: "blob", sha: catalogBlob.sha });
  for (const file of files) {
    const blob = await createBlob(env, session.token, file.contentBase64);
    entries.push({ path: file.path, mode: "100644", type: "blob", sha: blob.sha });
  }

  const tree = await github<{ sha: string }>(env, session.token, `/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/git/trees`, {
    method: "POST",
    body: JSON.stringify({ base_tree: parent.tree.sha, tree: entries }),
  });
  const commit = await github<{ sha: string; html_url: string }>(env, session.token, `/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/git/commits`, {
    method: "POST",
    body: JSON.stringify({ message, tree: tree.sha, parents: [head.object.sha] }),
  });
  await github(env, session.token, `/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/git/refs/heads/${encodeURIComponent(env.GITHUB_BRANCH)}`, {
    method: "PATCH",
    body: JSON.stringify({ sha: commit.sha, force: false }),
  });
  return json({ commitSha: commit.sha, commitUrl: commit.html_url });
}

function parseFiles(value: unknown): Array<{ path: string; contentBase64: string }> {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > 12) throw new ApiError(400, "A publish can contain at most 12 images.");
  return value.map((item) => {
    if (!item || typeof item !== "object") throw new ApiError(400, "Invalid image payload.");
    const path = "path" in item && typeof item.path === "string" ? item.path : "";
    const contentBase64 = "contentBase64" in item && typeof item.contentBase64 === "string" ? item.contentBase64 : "";
    if (!/^public\/uploads\/products\/[a-z0-9-]+\.(?:webp|jpg|jpeg|png)$/.test(path)) throw new ApiError(400, "Image path is outside the product upload directory.");
    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(contentBase64)) throw new ApiError(400, "Image content is not valid base64.");
    if (Math.ceil(contentBase64.length * 0.75) > MAX_FILE_BYTES) throw new ApiError(413, "Each optimized image must be 5 MB or smaller.");
    return { path, contentBase64 };
  });
}

async function getHead(env: Env, token: string) {
  return github<{ object: { sha: string } }>(env, token, `/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/git/ref/heads/${encodeURIComponent(env.GITHUB_BRANCH)}`);
}

function createBlob(env: Env, token: string, content: string) {
  return github<{ sha: string }>(env, token, `/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/git/blobs`, { method: "POST", body: JSON.stringify({ content, encoding: "base64" }) });
}

async function github<T>(env: Env, token: string, path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "BYBOLT-Admin",
      "X-GitHub-Api-Version": "2022-11-28",
      ...init.headers,
    },
  });
  const payload = await response.json().catch(() => null) as { message?: string } | null;
  if (!response.ok) throw new ApiError(response.status, payload?.message || `GitHub API failed (${response.status}).`);
  return payload as T;
}

async function readSession(request: Request, env: Env): Promise<Session | null> {
  const authorization = request.headers.get("Authorization");
  const encrypted = authorization?.startsWith("Bearer ") ? authorization.slice(7) : readCookie(request, SESSION_COOKIE);
  if (!encrypted) return null;
  const session = await decryptToken<Session>(encrypted, env.SESSION_SECRET);
  if (!session || session.exp < Date.now() || session.login.toLowerCase() !== env.ALLOWED_GITHUB_LOGIN.toLowerCase()) return null;
  return session;
}

async function encryptToken(payload: object, secret: string): Promise<string> {
  const key = await encryptionKey(secret);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(JSON.stringify(payload)));
  return `${base64Url(iv)}.${base64Url(new Uint8Array(encrypted))}`;
}

async function decryptToken<T>(token: string, secret: string): Promise<T | null> {
  try {
    const [ivPart, dataPart] = token.split(".");
    if (!ivPart || !dataPart) return null;
    const key = await encryptionKey(secret);
    const iv = fromBase64Url(ivPart) as BufferSource;
    const data = fromBase64Url(dataPart) as BufferSource;
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
    return JSON.parse(new TextDecoder().decode(decrypted)) as T;
  } catch {
    return null;
  }
}

async function encryptionKey(secret: string): Promise<CryptoKey> {
  if (secret.length < 32) throw new ApiError(500, "SESSION_SECRET must contain at least 32 characters.");
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
  return crypto.subtle.importKey("raw", digest, "AES-GCM", false, ["encrypt", "decrypt"]);
}

function corsResponse(request: Request, env: Env, response: Response): Response {
  const origin = request.headers.get("Origin");
  if (origin === env.ADMIN_ORIGIN) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    response.headers.set("Vary", "Origin");
  }
  response.headers.set("Cache-Control", "no-store");
  return response;
}

function enforceOrigin(request: Request, env: Env) {
  if (request.headers.get("Origin") !== env.ADMIN_ORIGIN) throw new ApiError(403, "Origin is not allowed.");
}

function safeReturnTo(value: string | null, env: Env): string {
  try {
    const result = new URL(value || `${env.ADMIN_ORIGIN}/admin/`);
    if (result.origin !== env.ADMIN_ORIGIN) throw new Error();
    return result.toString();
  } catch {
    return `${env.ADMIN_ORIGIN}/admin/`;
  }
}

function assertConfiguration(env: Env) {
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET || !env.SESSION_SECRET) throw new ApiError(500, "Admin API secrets are not configured.");
}

function readCookie(request: Request, name: string): string | null {
  const match = request.headers.get("Cookie")?.split(/;\s*/).find((item) => item.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

function cookie(name: string, value: string, options: { maxAge: number; sameSite: "Lax" | "None" }): string {
  return `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${options.maxAge}; HttpOnly; Secure; SameSite=${options.sameSite}`;
}

function timingSafeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let result = 0;
  for (let index = 0; index < left.length; index += 1) result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return result === 0;
}

function encodeUtf8(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function decodeUtf8(value: string): string {
  const binary = atob(value);
  return new TextDecoder().decode(Uint8Array.from(binary, (character) => character.charCodeAt(0)));
}

function base64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return Uint8Array.from(atob(normalized), (character) => character.charCodeAt(0));
}

function json(value: unknown, status = 200): Response {
  return Response.json(value, { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}
