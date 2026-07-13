#!/usr/bin/env node
/**
 * assemble-cap — build the full CAP app under run/output/cap2UI5 from two
 * inputs:
 *
 *   src/**                                →  run/output/cap2UI5/**  (verbatim — the source)
 *   run/input/core/**                     →  core/**                (the vendored core package,
 *                                            mirrored from builder-abap2UI5-js — run
 *                                            `npm run mirror_core` first)
 *   run/input/core/app/z2ui5/webapp/**    →  app/z2ui5/webapp/**    (replace — the webapp copy
 *                                            served by CDS statics and zipped by the mta html5
 *                                            module)
 *
 * The framework is consumed as the npm dependency `abap2UI5`: in src/ it
 * links the mirrored package (file:../run/input/core), in the published app
 * the vendored copy (file:./core). The copy rewrites that dependency path in
 * package.json and package-lock.json, and — because the vendored core is
 * INSIDE the app's package root, so npm manages its deps as part of the app
 * tree — merges the core's own lock entries into the app lock under
 * core/node_modules/. These are the only transformations in the build.
 *
 *   npm run assemble
 */
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");          // repo root
const base = path.join(root, "src");
const coreSrc = path.join(root, "run", "input", "core");
const dest = path.join(root, "run", "output", "cap2UI5");

// src/ links the mirrored core (one directory up), the published app the
// vendored copy at ./core — rewrite the dependency path accordingly.
// Ordered: the file: specifier first, then the bare path keys in the lock.
const REWRITES = [
  ["file:../run/input/core", "file:./core"],
  ["../run/input/core", "core"],
];
const REWRITE = new Set(["package.json", "package-lock.json"]);

// Local-only artifacts that may exist in src/ when it was run standalone
// (npm install, cds watch, mbt build) — never part of the published app.
const COPY_IGNORE = new Set(["node_modules", "gen", "resources", "mta_archives", "@cds-models"]);

// Local, non-published entries kept across the wipe of run/output/cap2UI5
// (all gitignored) — avoids a full reinstall after each build.
const PRESERVE = new Set(["node_modules"]);

function copyDir(from, to, topLevel) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    if (COPY_IGNORE.has(entry.name) || entry.name.endsWith(".sqlite") || entry.name.endsWith(".log")) continue;
    const src = path.join(from, entry.name);
    const dst = path.join(to, entry.name);
    if (entry.isDirectory()) {
      copyDir(src, dst, false);
    } else if (topLevel && REWRITE.has(entry.name)) {
      let text = fs.readFileSync(src, "utf8");
      for (const [from_, to_] of REWRITES) text = text.split(from_).join(to_);
      fs.writeFileSync(dst, text);
    } else {
      fs.copyFileSync(src, dst);
    }
  }
}

function countFiles(d) {
  let n = 0;
  for (const e of fs.readdirSync(d, { withFileTypes: true })) n += e.isDirectory() ? countFiles(path.join(d, e.name)) : 1;
  return n;
}

if (!fs.existsSync(base)) {
  console.error("src not found — it is the hand-maintained source of the CAP app");
  process.exit(1);
}
if (!fs.existsSync(path.join(coreSrc, "package.json"))) {
  console.error("run/input/core not found — run `npm run mirror_core` first");
  process.exit(1);
}

fs.mkdirSync(dest, { recursive: true });
for (const entry of fs.readdirSync(dest)) {
  if (PRESERVE.has(entry)) continue;
  fs.rmSync(path.join(dest, entry), { recursive: true, force: true });
}
copyDir(base, dest, true);
console.log(`src → run/output/cap2UI5 (source skeleton copied, core dep path rewritten)`);

// vendor the mirrored core package into the app (mirror-core already
// strips node_modules from the snapshot)
const coreDest = path.join(dest, "core");
fs.rmSync(coreDest, { recursive: true, force: true });
copyDir(coreSrc, coreDest, false);
console.log(`  vendor core (from run/input/core) → core: ${countFiles(coreDest)} files`);

const webappSrc = path.join(coreSrc, "app", "z2ui5", "webapp");
if (!fs.existsSync(webappSrc)) {
  console.error("run/input/core/app/z2ui5/webapp not found — incomplete core mirror?");
  process.exit(1);
}
const webappDest = path.join(dest, "app", "z2ui5", "webapp");
fs.rmSync(webappDest, { recursive: true, force: true });
copyDir(webappSrc, webappDest, false);
console.log(`  overlay webapp (from the core) → app/z2ui5/webapp: ${countFiles(webappDest)} files`);

// The vendored core sits inside the app's package root, so `npm ci` there
// expects the core's dependency tree in the app lock. Merge the core's own
// lock entries in under core/node_modules/ — that keeps them physically
// inside core/ (same layout as a standalone install of the core) and the
// app lock deterministic without a registry roundtrip.
const appLockPath = path.join(dest, "package-lock.json");
const appLock = JSON.parse(fs.readFileSync(appLockPath, "utf8"));
const coreLock = JSON.parse(fs.readFileSync(path.join(coreSrc, "package-lock.json"), "utf8"));
let merged = 0;
for (const [key, entry] of Object.entries(coreLock.packages || {})) {
  if (!key.startsWith("node_modules/")) continue;
  appLock.packages[`core/${key}`] = entry;
  merged++;
}
fs.writeFileSync(appLockPath, JSON.stringify(appLock, null, 2) + "\n");
console.log(`  merge core lock → package-lock.json: ${merged} entries under core/node_modules/`);

console.log(`\nassembled → run/output/cap2UI5`);
