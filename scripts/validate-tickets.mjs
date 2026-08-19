import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadTickets } from "./lib/tickets.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tickets = loadTickets(repoRoot);
const errors = [];
const byId = new Map();
const allowed = {
  epic: new Set(Array.from({ length: 12 }, (_, index) => `E${String(index).padStart(2, "0")}`)),
  milestone: new Set(Array.from({ length: 6 }, (_, index) => `M${index}`)),
  priority: new Set(["P0", "P1", "P2"]),
  size: new Set(["XS", "S", "M", "L", "XL"]),
  status: new Set(["planned", "ready", "active", "blocked", "done"]),
};

for (const ticket of tickets) {
  if (byId.has(ticket.id)) errors.push(`Duplicate ticket ID ${ticket.id}.`);
  byId.set(ticket.id, ticket);
  const basename = path.basename(ticket.path);
  if (!basename.startsWith(`${ticket.id}-`))
    errors.push(`${ticket.id}: filename does not start with its ID.`);
  for (const key of ["epic", "milestone", "priority", "size", "status"]) {
    if (!allowed[key].has(ticket[key])) errors.push(`${ticket.id}: invalid ${key} ${ticket[key]}.`);
  }
  if (!ticket.outcome) errors.push(`${ticket.id}: missing Outcome.`);
  if (ticket.scope.length === 0) errors.push(`${ticket.id}: missing Scope bullets.`);
  if (ticket.acceptance.length === 0) errors.push(`${ticket.id}: missing acceptance criteria.`);
  const ticketNumber = Number.parseInt(ticket.id.replace("HUD-", ""), 10);
  if (ticket.status === "done" && ticketNumber >= 8 && ticketNumber <= 72) {
    for (const item of ticket.acceptance) {
      if (item && typeof item === "object" && item.checked !== true) {
        errors.push(`${ticket.id}: done ticket has unchecked acceptance: ${item.text}`);
      }
    }
  }
  if (ticket.verification.length === 0) errors.push(`${ticket.id}: missing Verification bullets.`);
  const requiredLabels = [
    `epic:${ticket.epic}`,
    `milestone:${ticket.milestone}`,
    `priority:${ticket.priority}`,
    `size:${ticket.size}`,
    `type:${ticket.type}`,
  ];
  for (const label of requiredLabels)
    if (!ticket.labels.includes(label)) errors.push(`${ticket.id}: missing label ${label}.`);
  const issueBody = path.join(repoRoot, ticket.issue_body_path);
  if (!fs.existsSync(issueBody))
    errors.push(`${ticket.id}: missing GitHub issue body ${ticket.issue_body_path}.`);
}

for (const ticket of tickets) {
  for (const dependency of ticket.blocked_by) {
    if (!byId.has(dependency)) errors.push(`${ticket.id}: unknown dependency ${dependency}.`);
    if (dependency === ticket.id) errors.push(`${ticket.id}: self dependency.`);
  }
}

const visiting = new Set();
const visited = new Set();
function visit(id, chain = []) {
  if (visited.has(id)) return;
  if (visiting.has(id)) {
    const start = chain.indexOf(id);
    errors.push(`Dependency cycle: ${[...chain.slice(start), id].join(" -> ")}.`);
    return;
  }
  visiting.add(id);
  const ticket = byId.get(id);
  for (const dependency of ticket?.blocked_by ?? []) visit(dependency, [...chain, id]);
  visiting.delete(id);
  visited.add(id);
}
for (const id of byId.keys()) visit(id);

const expectedIds = Array.from(
  { length: tickets.length },
  (_, index) => `HUD-${String(index + 1).padStart(3, "0")}`,
);
for (const id of expectedIds)
  if (!byId.has(id)) errors.push(`Expected contiguous ticket ${id} is missing.`);

if (errors.length) {
  console.error(`Ticket validation failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

const counts = Object.groupBy(tickets, (ticket) => ticket.epic);
console.log(
  `Ticket validation passed: ${tickets.length} tickets, ${Object.keys(counts).length} epics, dependency DAG valid.`,
);
