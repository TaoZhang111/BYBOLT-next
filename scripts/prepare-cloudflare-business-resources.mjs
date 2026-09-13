import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const configPaths = process.argv.slice(2);
if (!configPaths.length) throw new Error("Provide at least one Wrangler config path.");

function wrangler(args, options = {}) {
  return execFileSync("pnpm", ["exec", "wrangler", ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], ...options });
}

function databases() {
  return JSON.parse(wrangler(["d1", "list", "--json"]));
}

let database = databases().find((item) => item.name === "bybolt-business");
if (!database) {
  try { wrangler(["d1", "create", "bybolt-business", "--location", "apac"]); } catch { /* A concurrent workflow may create it first. */ }
  database = databases().find((item) => item.name === "bybolt-business");
}
if (!database?.uuid) throw new Error("Unable to resolve the bybolt-business D1 database.");

try { wrangler(["r2", "bucket", "create", "bybolt-drawings"]); } catch { /* Existing bucket is the expected steady state. */ }

for (const configPath of configPaths) {
  const config = JSON.parse(readFileSync(configPath, "utf8"));
  const binding = config.d1_databases?.find((item) => item.binding === "DB");
  if (!binding) throw new Error(`DB binding is missing in ${configPath}.`);
  binding.database_id = database.uuid;
  writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);
}

console.log(`Prepared shared business resources. D1: ${database.uuid}`);
