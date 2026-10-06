// Checks the index and the pack files it lists: formats, required fields,
// ids, versions and that every listed file exists. N-WAVE checks each node
// against its source when the pack is imported; this catches broken
// entries before they're merged. Run with: node scripts/check.mjs
import { existsSync, readFileSync, readdirSync } from "node:fs";

const PACK_ID = /^[a-z0-9][a-z0-9._-]{0,79}$/;
const NODE_ID = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,119}$/;
const PORT_NAME = /^[A-Za-z_][A-Za-z0-9_]*$/;
const errors = [];
const fail = (where, message) => errors.push(`${where}: ${message}`);

const readJson = (path) => {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    fail(path, `isn't valid JSON (${error.message})`);
    return null;
  }
};

const checkPack = (path, entry) => {
  const pack = readJson(path);
  if (!pack) return;
  if (pack.format !== "n-wave-node-pack") fail(path, 'format must be "n-wave-node-pack"');
  if (pack.formatVersion !== 1) fail(path, "formatVersion must be 1");
  for (const key of ["id", "name", "version"]) {
    if (typeof pack[key] !== "string" || !pack[key].trim()) fail(path, `"${key}" is required`);
  }
  if (typeof pack.id === "string" && !PACK_ID.test(pack.id)) fail(path, `invalid pack id "${pack.id}"`);
  for (const key of ["id", "name", "version"]) {
    if (entry[key] !== undefined && entry[key] !== pack[key]) {
      fail(path, `"${key}" is "${pack[key]}" but the index says "${entry[key]}"`);
    }
  }
  if (!Array.isArray(pack.nodes) || pack.nodes.length === 0) {
    fail(path, "the pack has no nodes");
    return;
  }
  const ids = new Set();
  pack.nodes.forEach((node, index) => {
    const where = `${path} node ${index + 1}`;
    if (typeof node.id !== "string" || !NODE_ID.test(node.id)) fail(where, "invalid or missing id");
    else if (ids.has(node.id)) fail(where, `duplicate id "${node.id}"`);
    else ids.add(node.id);
    for (const key of ["label", "processName", "source"]) {
      if (typeof node[key] !== "string" || !node[key].trim()) fail(where, `"${key}" is required`);
    }
    const kind = node.kind === "workflow" ? "workflow" : "process";
    if (typeof node.source === "string" && typeof node.processName === "string") {
      const declares = new RegExp(`\\b${kind}\\s+${node.processName}\\s*\\{`);
      if (!declares.test(node.source)) fail(where, `the source doesn't declare ${kind} ${node.processName}`);
    }
    for (const input of node.inputs ?? []) {
      if (!PORT_NAME.test(input.name ?? "")) fail(where, `invalid input name "${input.name}"`);
      if (input.kind !== "path" && input.kind !== "val") fail(where, `input "${input.name}" needs kind "path" or "val"`);
    }
    for (const output of node.outputs ?? []) {
      if (!PORT_NAME.test(output.name ?? "")) fail(where, `invalid output name "${output.name}"`);
      if (typeof output.emit !== "string") fail(where, `output "${output.name}" needs "emit"`);
    }
  });
};

const index = readJson("index.json");
const listed = new Set();
if (index) {
  if (index.format !== "n-wave-node-pack-index") fail("index.json", 'format must be "n-wave-node-pack-index"');
  if (!Array.isArray(index.packs)) fail("index.json", '"packs" must be a list');
  const packIds = new Set();
  for (const [position, entry] of (index.packs ?? []).entries()) {
    const where = `index.json entry ${position + 1}`;
    for (const key of ["id", "name", "version", "url"]) {
      if (typeof entry[key] !== "string" || !entry[key].trim()) fail(where, `"${key}" is required`);
    }
    if (packIds.has(entry.id)) fail(where, `pack "${entry.id}" is listed twice`);
    packIds.add(entry.id);
    if (typeof entry.url !== "string" || /^[a-z]+:\/\//i.test(entry.url)) continue;
    if (!existsSync(entry.url)) {
      fail(where, `${entry.url} doesn't exist`);
      continue;
    }
    listed.add(entry.url);
    checkPack(entry.url, entry);
  }
}
for (const file of readdirSync("packs")) {
  if (file.endsWith(".json") && !listed.has(`packs/${file}`)) {
    fail(`packs/${file}`, "isn't listed in index.json");
  }
}

if (errors.length > 0) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}
console.log(`index.json and ${listed.size} pack file(s) look good.`);
