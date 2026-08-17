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

// repo root — overridable for the unit tests (test/assemble-cap.test.js),
// which run the script against temporary fixture trees.
const root = process.env.ASSEMBLE_ROOT
  ? path.resolve(process.env.ASSEMBLE_ROOT)
  : path.join(__dirname, "..");
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
// (.core_node_modules.keep is the stash for core/node_modules, which the
// app lock places INSIDE the vendored core/ — see below.)
const PRESERVE = new Set(["node_modules", ".core_node_modules.keep"]);

// `ignore` is the set applied at EVERY level of this copy. For src/ that is
// COPY_IGNORE (local build litter can appear at any depth). For the vendored
// core it must be empty: those names are meaningful inside a package —
// `resources/` in particular is an ordinary UI5 folder — and silently
// dropping one would ship a broken core with no error anywhere.
function copyDir(from, to, topLevel, ignore = COPY_IGNORE) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    if (ignore.has(entry.name) || entry.name.endsWith(".sqlite") || entry.name.endsWith(".log")) continue;
    const src = path.join(from, entry.name);
    const dst = path.join(to, entry.name);
    if (entry.isDirectory()) {
      copyDir(src, dst, false, ignore);
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
// core/node_modules lives inside the wiped core/ — stash it before the wipe
// (restored after the core vendor step), same preservation as the top-level
// node_modules.
const coreNm = path.join(dest, "core", "node_modules");
const coreNmKeep = path.join(dest, ".core_node_modules.keep");
fs.rmSync(coreNmKeep, { recursive: true, force: true });
if (fs.existsSync(coreNm)) fs.renameSync(coreNm, coreNmKeep);
for (const entry of fs.readdirSync(dest)) {
  if (PRESERVE.has(entry)) continue;
  fs.rmSync(path.join(dest, entry), { recursive: true, force: true });
}
copyDir(base, dest, true);
console.log(`src → run/output/cap2UI5 (source skeleton copied, core dep path rewritten)`);

// vendor the mirrored core package into the app (mirror-core already
// strips node_modules from the snapshot), then restore the stashed
// core/node_modules install
const coreDest = path.join(dest, "core");
fs.rmSync(coreDest, { recursive: true, force: true });
// NO_IGNORE: the core is a package, not a source folder — see copyDir.
copyDir(coreSrc, coreDest, false, new Set());
// Count BEFORE restoring the stash, otherwise the number is a walk over the
// whole installed dependency tree rather than over the vendored core.
const coreFiles = countFiles(coreDest);
if (fs.existsSync(coreNmKeep)) fs.renameSync(coreNmKeep, coreNm);
console.log(`  vendor core (from run/input/core) → core: ${coreFiles} files`);

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
let appLock, coreLock;
try {
  appLock = JSON.parse(fs.readFileSync(appLockPath, "utf8"));
  coreLock = JSON.parse(fs.readFileSync(path.join(coreSrc, "package-lock.json"), "utf8"));
} catch (e) {
  // Symmetry with the guarded parse in the validation block below — fail with
  // a clear message instead of a raw stack trace.
  console.error(`assemble: failed to read/parse a lockfile before the core-lock merge: ${e.message}`);
  process.exit(1);
}
let merged = 0;
for (const [key, entry] of Object.entries(coreLock.packages || {})) {
  if (!key.startsWith("node_modules/")) continue;
  appLock.packages[`core/${key}`] = entry;
  merged++;
}
fs.writeFileSync(appLockPath, JSON.stringify(appLock, null, 2) + "\n");
console.log(`  merge core lock → package-lock.json: ${merged} entries under core/node_modules/`);

// Guardrails over the blind string rewrite + lock merge — fail the build
// here instead of in the downstream `npm ci`:
{
  const problems = [];
  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(path.join(dest, "package.json"), "utf8"));
  } catch (e) {
    problems.push(`package.json is not valid JSON after rewrite: ${e.message}`);
  }
  if (pkg && pkg.dependencies?.abap2UI5 !== "file:./core") {
    problems.push(`package.json dependency abap2UI5 is "${pkg?.dependencies?.abap2UI5}", expected "file:./core"`);
  }
  // Residual-string sweep over the ENTIRE published tree, not just the two
  // rewritten manifests: the rewrite only touches top-level package.json /
  // package-lock.json, so any other file that names the build-time core path
  // (a nested manifest, a config, a doc) would ship pointing at a directory
  // that does not exist in the app. Milliseconds over ~2k files.
  {
    const stale = [];
    (function sweep(dir) {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        if (PRESERVE.has(e.name) || e.name === "node_modules") continue;
        const p = path.join(dir, e.name);
        if (e.isDirectory()) { sweep(p); continue; }
        if (!/\.(json|js|cjs|mjs|md|ya?ml|cds|txt)$/i.test(e.name)) continue;
        if (fs.readFileSync(p, "utf8").includes("run/input/core")) {
          stale.push(path.relative(dest, p));
        }
      }
    })(dest);
    for (const f of stale) problems.push(`${f} still references run/input/core after rewrite`);
  }
  // npm lockfileVersion 1 has no `packages` map at all. Say so, rather than
  // letting the checks below report a pile of confusing absences.
  if (!appLock.packages) {
    problems.push(
      `package-lock.json has no "packages" map (lockfileVersion ` +
      `${appLock.lockfileVersion ?? "?"}) — regenerate src/package-lock.json with npm >= 7`,
    );
  }
  const linkEntry = appLock.packages?.["node_modules/abap2UI5"];
  if (!linkEntry || linkEntry.resolved !== "core") {
    problems.push(`lock entry node_modules/abap2UI5 does not link "core" (got ${JSON.stringify(linkEntry?.resolved)})`);
  }
  if (!appLock.packages?.["core"]) problems.push(`lock has no "core" package entry`);
  if (merged === 0) problems.push("core lock merge produced 0 entries — empty/renamed core lock?");

  // Stale core-lock drift guard — the biggest latent risk in this pipeline.
  // The app lock's "core" entry is a FROZEN snapshot of the core's
  // package.json, taken when src/package-lock.json was last regenerated.
  // mirror_core does NOT refresh it, so if the mirrored core changed its own
  // dependencies, the vendored core/node_modules/* entries merged above
  // disagree with this frozen entry and `npm ci` in the app fails with an
  // out-of-sync lock. Catch it here with an actionable message.
  try {
    const coreManifest = JSON.parse(fs.readFileSync(path.join(coreSrc, "package.json"), "utf8"));
    // All three dependency kinds npm records in a lock entry — a change to
    // optional/peer deps breaks `npm ci` exactly like a change to `dependencies`.
    const KINDS = ["dependencies", "optionalDependencies", "peerDependencies"];
    const pick = (o) => Object.fromEntries(KINDS.map((k) => [k, o?.[k] ?? {}]));
    const frozen = JSON.stringify(pick(appLock.packages?.["core"]));
    const actual = JSON.stringify(pick(coreManifest));
    if (frozen !== actual) {
      problems.push(
        `core dependencies drifted from the frozen lock: the mirrored core declares ${actual} but ` +
        `src/package-lock.json's "core" entry has ${frozen}. Run \`npm install\` in src/ to refresh the lock.`,
      );
    }
  } catch (e) {
    problems.push(`could not compare core dependencies for drift: ${e.message}`);
  }

  if (problems.length) {
    console.error(`assemble: output validation FAILED —\n  - ${problems.join("\n  - ")}`);
    process.exit(1);
  }
  console.log(`  validate: dep rewrite + lock merge OK`);
}

console.log(`\nassembled → run/output/cap2UI5`);
