import { createReadStream } from "node:fs";
import { mkdir, readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { chromium } from "@playwright/test";

let baseUrl = process.env.QA_BASE_URL;
const outputDir = process.env.QA_OUTPUT_DIR ?? "C:/Users/TUF/AppData/Local/Temp/bybolt-admin-qa";
const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
];

await mkdir(outputDir, { recursive: true });
const server = baseUrl ? null : await startStaticServer();
baseUrl ??= `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true });
const results = [];

for (const viewport of viewports) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const consoleErrors = [];
  const failedRequests = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("requestfailed", (request) => failedRequests.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText}`));
  const response = await page.goto(`${baseUrl}/admin/`, { waitUntil: "networkidle" });
  const metrics = await page.evaluate(() => ({
    title: document.title,
    h1: document.querySelector("h1")?.textContent?.trim(),
    width: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    noIndex: document.querySelector('meta[name="robots"]')?.getAttribute("content"),
  }));
  const nameInput = page.getByLabel("Product name");
  await nameInput.fill("Hex Bolts QA");
  const dirty = await page.getByText("Unsaved changes").count();
  let uploadQueued = true;
  if (viewport.name === "desktop") {
    await page.locator('input[type="file"]').first().setInputFiles(join(process.cwd(), "public/assets/products/nickel-alloy-hex-bolts.jpg"));
    await page.getByText("Image optimized to WebP and queued for the next Git commit.").waitFor();
    uploadQueued = await page.getByText("1 image queued").isVisible();
  }

  let mobileNavigation = true;
  if (viewport.width < 861) {
    await page.getByRole("button", { name: "Open product navigation" }).click();
    mobileNavigation = await page.getByRole("navigation", { name: "Product catalog editor" }).isVisible();
    await page.getByRole("button", { name: "Close product navigation" }).click();
    await page.waitForTimeout(250);
  }

  await page.screenshot({ path: `${outputDir}/${viewport.name}.png`, fullPage: true });
  let draftSlug = true;
  if (viewport.name === "desktop") {
    await page.getByTitle("Add product to Bolts").click();
    await page.getByLabel("URL slug").fill("qa-new-fastener");
    draftSlug = await page.getByRole("heading", { level: 1, name: "New Product" }).isVisible() && await page.getByLabel("URL slug").inputValue() === "qa-new-fastener";
  }
  results.push({
    viewport,
    status: response?.status(),
    ...metrics,
    overflow: metrics.scrollWidth > metrics.width,
    dirty: dirty > 0,
    mobileNavigation,
    uploadQueued,
    draftSlug,
    consoleErrors,
    failedRequests,
  });
  await context.close();
}

const catalog = JSON.parse(await readFile(join(process.cwd(), "src/content/product-catalog.json"), "utf8"));
const productRoutes = ["en", "zh"].flatMap((locale) => catalog.categories.flatMap((category) => [
  `/${locale}/products/${category.slug}/`,
  ...category.models.map((product) => `/${locale}/products/${category.slug}/${product.slug}/`),
]));
const routeChecks = [
  "/en/",
  "/en/products/",
  "/en/products/bolts/",
  "/en/products/bolts/hex-bolts/",
  "/zh/products/bolts/hex-bolts/",
  "/robots.txt",
  "/sitemap.xml",
  ...productRoutes,
];
const routes = [];
for (const route of routeChecks) {
  const response = await fetch(`${baseUrl}${route}`, { redirect: "manual" });
  routes.push({ route, status: response.status });
}

await browser.close();
if (server) await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
console.log(JSON.stringify({ results, routes }, null, 2));

if (results.some((result) => result.status !== 200 || result.overflow || !result.dirty || !result.mobileNavigation || !result.uploadQueued || !result.draftSlug || result.consoleErrors.length || result.failedRequests.length) || routes.some((route) => route.status !== 200)) {
  process.exitCode = 1;
}

async function startStaticServer() {
  const root = join(process.cwd(), "out");
  const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".xml": "application/xml", ".txt": "text/plain; charset=utf-8", ".woff2": "font/woff2", ".jpg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".svg": "image/svg+xml" };
  const localServer = createServer(async (request, response) => {
    try {
      let pathname = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname);
      if (pathname.endsWith("/")) pathname += "index.html";
      const file = normalize(join(root, pathname));
      if (!file.startsWith(root)) throw new Error("Invalid path");
      const info = await stat(file);
      if (!info.isFile()) throw new Error("Not a file");
      response.writeHead(200, { "Content-Type": mime[extname(file)] ?? "application/octet-stream" });
      createReadStream(file).pipe(response);
    } catch {
      response.writeHead(404, { "Content-Type": "text/plain" });
      response.end("Not found");
    }
  });
  await new Promise((resolve) => localServer.listen(0, "127.0.0.1", resolve));
  return localServer;
}
