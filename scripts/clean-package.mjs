import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const relative = process.argv[2];
if (!relative || relative.includes(".."))
  throw new Error("Expected a safe repository-relative package path.");
fs.rmSync(path.join(root, relative, "dist"), { recursive: true, force: true });
console.log(`Cleaned ${relative}/dist.`);
