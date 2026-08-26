import fs from "node:fs";
import path from "node:path";

export function walkFiles(root, predicate = () => true) {
  if (!fs.existsSync(root)) return [];
  const result = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const absolute = path.join(root, entry.name);
    if (entry.isDirectory()) result.push(...walkFiles(absolute, predicate));
    else if (predicate(absolute)) result.push(absolute);
  }
  return result.sort();
}

export function toPosix(value) {
  return value.replaceAll(path.sep, "/");
}
