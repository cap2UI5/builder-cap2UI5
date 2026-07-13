#!/usr/bin/env node
/**
 * publish-cap — the very last build step: copy the assembled app 1:1 from
 * run/output/cap2UI5 into a checkout of the deployable app repository
 * (cap2UI5/cap2UI5).
 *
 * The target is a pure build artifact — it is wiped and rewritten on every
 * publish, so nothing there should be hand-edited (edit src/ instead). Only
 * `node_modules/` (local install), `.git` and `.github` (the app repo's own
 * workflows) are preserved.
 *
 *   npm run publish                        # publishes to ../cap2UI5 (sibling checkout)
 *   PUBLISH_TARGET=/path/to/cap2UI5 npm run publish
 *   (usually via `npm run build_cap` = assemble + publish)
 */
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");          // repo root
const src = path.join(root, "run", "output", "cap2UI5");
const dest = process.env.PUBLISH_TARGET || path.join(root, "..", "cap2UI5");

// Local / repo-owned entries kept across a wipe — and never copied from the
// assembled tree either (run/output/cap2UI5 may carry a local node_modules
// from a test install).
const PRESERVE = new Set(["node_modules", ".git", ".github"]);

function copyDir(from, to, topLevel) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    if (topLevel && PRESERVE.has(entry.name)) continue;
    const s = path.join(from, entry.name);
    const d = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(s, d, false);
    else fs.copyFileSync(s, d);
  }
}

if (!fs.existsSync(src)) {
  console.error("run/output/cap2UI5 not found — run `npm run assemble` first");
  process.exit(1);
}
if (!fs.existsSync(dest)) {
  console.error(`publish target not found: ${dest}\n` +
    "clone cap2UI5/cap2UI5 next to this repo or set PUBLISH_TARGET=/path/to/checkout");
  process.exit(1);
}

// Wipe the target (except preserved entries), then copy the assembled tree in.
for (const entry of fs.readdirSync(dest)) {
  if (PRESERVE.has(entry)) continue;
  fs.rmSync(path.join(dest, entry), { recursive: true, force: true });
}
copyDir(src, dest, true);

const count = (function walk(d, topLevel) {
  let n = 0;
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (topLevel && PRESERVE.has(e.name)) continue;
    n += e.isDirectory() ? walk(path.join(d, e.name), false) : 1;
  }
  return n;
})(src, true);
console.log(`published ${count} files → ${dest} (1:1 copy of run/output/cap2UI5)`);
