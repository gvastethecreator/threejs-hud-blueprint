const [gate = "unknown", ticket = "unassigned"] = process.argv.slice(2);
console.error(
  `Gate '${gate}' is intentionally not implemented in the blueprint skeleton. Complete ${ticket} before treating it as a release gate.`,
);
process.exit(1);
