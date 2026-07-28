import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "standards");
const dest = join(root, "dist", "standards");

if (!existsSync(src)) {
  console.error("standards/ missing");
  process.exit(1);
}

mkdirSync(dirname(dest), { recursive: true });
cpSync(src, dest, { recursive: true });
console.log("Copied standards → dist/standards");
