import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = resolve(projectRoot, "public", "prototype.css");
const targetPath = resolve(projectRoot, "src", "app", "prototype.css");
const source = await readFile(sourcePath, "utf8");
const bundledCss = source.replaceAll('url("assets/', 'url("/assets/').replaceAll("url('assets/", "url('/assets/");

await writeFile(targetPath, bundledCss, "utf8");
