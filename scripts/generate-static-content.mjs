import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const contentModules = [
  { source: "home-static.html", target: "home-static.ts", exportName: "homeStaticHtml" },
  { source: "quote-static.html", target: "quote-static.ts", exportName: "quoteStaticHtml" },
];

for (const { source, target, exportName } of contentModules) {
  const sourcePath = resolve(projectRoot, "src", "content", source);
  const targetPath = resolve(projectRoot, "src", "content", target);
  const html = await readFile(sourcePath, "utf8");
  const moduleSource = `export const ${exportName} = ${JSON.stringify(html)};\n`;

  await writeFile(targetPath, moduleSource, "utf8");
}
