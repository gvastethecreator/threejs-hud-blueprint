import fs from "node:fs";
import path from "node:path";

export const TICKET_SCHEMA_VERSION = "three-hud/ticket-index/v0";

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

export function parseTicket(file, repoRoot) {
  const text = fs.readFileSync(file, "utf8");
  const normalized = text.replace(/\r\n/g, "\n");
  if (!normalized.startsWith("---\n")) throw new Error(`${file}: missing frontmatter opener.`);
  const end = normalized.indexOf("\n---\n", 4);
  if (end < 0) throw new Error(`${file}: missing frontmatter closer.`);
  const frontmatter = parseSimpleYaml(normalized.slice(4, end));
  const body = normalized.slice(end + 5);

  const id = stringField(frontmatter, "id", file);
  const title = stringField(frontmatter, "title", file);
  const relativePath = toPosix(path.relative(repoRoot, file));
  const issueBodyPath = `planning/github/issue-bodies/${id}.md`;

  return {
    id,
    title,
    epic: stringField(frontmatter, "epic", file),
    milestone: stringField(frontmatter, "milestone", file),
    type: stringField(frontmatter, "type", file),
    priority: stringField(frontmatter, "priority", file),
    size: stringField(frontmatter, "size", file),
    status: stringField(frontmatter, "status", file),
    blocked_by: arrayField(frontmatter, "blocked_by"),
    outcome: sectionParagraph(body, "Outcome"),
    scope: sectionBullets(body, "Scope"),
    acceptance: sectionChecklist(body, "Acceptance criteria"),
    verification: sectionBullets(body, "Verification"),
    out_of_scope: sectionBullets(body, "Out of scope"),
    evidence: sectionBullets(body, "Evidence to attach"),
    risks: sectionBullets(body, "Risks"),
    labels: arrayField(frontmatter, "labels"),
    path: relativePath,
    issue_body_path: issueBodyPath,
    acceptance_count: sectionChecklist(body, "Acceptance criteria").length,
  };
}

export function loadTickets(repoRoot) {
  const ticketRoot = path.join(repoRoot, "planning", "tickets");
  return walkFiles(ticketRoot, (file) => /HUD-\d{3}-.+\.md$/.test(path.basename(file)))
    .map((file) => parseTicket(file, repoRoot))
    .sort((a, b) => a.id.localeCompare(b.id));
}

export function buildTicketIndex(repoRoot) {
  const tickets = loadTickets(repoRoot);
  return {
    schemaVersion: TICKET_SCHEMA_VERSION,
    generatedAt: new Date().toISOString().slice(0, 10),
    count: tickets.length,
    tickets,
  };
}

function parseSimpleYaml(source) {
  const result = {};
  let currentList = null;
  for (const rawLine of source.split("\n")) {
    if (!rawLine.trim() || rawLine.trimStart().startsWith("#")) continue;
    const item = /^\s+-\s+(.*)$/.exec(rawLine);
    if (item) {
      if (!currentList) throw new Error(`Unexpected list item: ${rawLine}`);
      result[currentList].push(parseScalar(item[1]));
      continue;
    }
    const pair = /^([A-Za-z0-9_]+):(?:\s*(.*))?$/.exec(rawLine);
    if (!pair) throw new Error(`Unsupported frontmatter syntax: ${rawLine}`);
    const [, key, rawValue = ""] = pair;
    if (rawValue === "") {
      result[key] = [];
      currentList = key;
    } else {
      result[key] = parseScalar(rawValue);
      currentList = null;
    }
  }
  return result;
}

function parseScalar(raw) {
  const value = raw.trim();
  if (value === "[]") return [];
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "null") return null;
  if (/^-?\d+(?:\.\d+)?$/.test(value)) return Number(value);
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    if (value.startsWith('"')) return JSON.parse(value);
    return value.slice(1, -1).replace(/''/g, "'");
  }
  return value;
}

function section(body, heading) {
  const marker = `## ${heading}\n`;
  const start = body.indexOf(marker);
  if (start < 0) return "";
  const contentStart = start + marker.length;
  const next = body.indexOf("\n## ", contentStart);
  return body.slice(contentStart, next < 0 ? body.length : next).trim();
}

function sectionParagraph(body, heading) {
  const value = section(body, heading);
  return value.split(/\n\s*\n/)[0]?.trim() ?? "";
}

function sectionBullets(body, heading) {
  return section(body, heading)
    .split("\n")
    .map((line) => /^-\s+(.*)$/.exec(line)?.[1]?.trim())
    .filter(Boolean);
}

function sectionChecklist(body, heading) {
  return section(body, heading)
    .split("\n")
    .map((line) => {
      const match = /^-\s+\[([ xX])\]\s+(.*)$/.exec(line);
      if (!match) return null;
      return { checked: match[1] !== " ", text: match[2]?.trim() ?? "" };
    })
    .filter(Boolean);
}

function stringField(record, key, file) {
  const value = record[key];
  if (typeof value !== "string" || !value)
    throw new Error(`${file}: frontmatter ${key} must be a non-empty string.`);
  return value;
}

function arrayField(record, key) {
  const value = record[key];
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw new Error(`Frontmatter ${key} must be a list.`);
  return value.map(String);
}

export function toPosix(value) {
  return value.replaceAll(path.sep, "/");
}
