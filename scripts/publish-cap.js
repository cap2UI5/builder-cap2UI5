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
 *   npm run publish -- --dry-run           # show what would happen, touch nothing
 *   (usually via `npm run build_cap` = assemble + publish)
 */
"use strict";

const fs = require("fs");
const path = require("path");

// repo root — overridable for the unit tests (test/publish-cap.test.js),
// which run the script against temporary fixture trees. Same override
// mechanism as assemble-cap.js's ASSEMBLE_ROOT.
const root = process.env.PUBLISH_ROOT
  ? path.resolve(process.env.PUBLISH_ROOT)
  : path.join(__dirname, "..");
const src = path.join(root, "run", "output", "cap2UI5");
const dest = process.env.PUBLISH_TARGET || path.join(root, "..", "cap2UI5");
const dryRun = process.argv.includes("--dry-run");

// Local / repo-owned entries kept across a wipe — and never copied from the
// assembled tree either (run/output/cap2UI5 may carry a local node_modules
// from a test install).
const PRESERVE = new Set(["node_modules", ".git", ".github"]);

// Build litter that can accumulate in run/output/cap2UI5 from a local
// `npm test` / `cds build` / `mbt build`. assemble-cap.js filters the same
// names on the way in; without this the two copy steps disagree and the
// artifacts land in the published checkout (gitignored there, but still
// written to disk and confusing to anyone looking at it).
//
// `node_modules` is in here as well as in PRESERVE, and the two mean different
// things: PRESERVE keeps the TARGET's install from being deleted, this keeps
// the SOURCE's from being copied. Only the top level was covered before, so a
// local `npm ci` in the assembled app made the publish copy the whole vendored
// core/node_modules tree (~34k files) into the app checkout. An installed
// dependency tree is never part of the artifact, at any depth.
const COPY_IGNORE = new Set(["node_modules", "gen", "resources", "mta_archives", "@cds-models"]);

function copyDir(from, to, topLevel) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    if (topLevel && PRESERVE.has(entry.name)) continue;
    if (COPY_IGNORE.has(entry.name) || entry.name.endsWith(".sqlite") || entry.name.endsWith(".log")) continue;
    const s = path.join(from, entry.name);
    const d = path.join(to, entry.name);
    // Symlinks are neither isDirectory() nor a plain file for copyFileSync's
    // purposes — a symlinked directory makes it throw EISDIR. The core ships
    // none today; recreate rather than dereference if one ever appears.
    if (entry.isSymbolicLink()) {
      fs.symlinkSync(fs.readlinkSync(s), d);
    } else if (entry.isDirectory()) {
      copyDir(s, d, false);
    } else {
      fs.copyFileSync(s, d);
      // Preserve the executable bit — a copied hook/script must stay runnable.
      fs.chmodSync(d, fs.statSync(s).mode & 0o777);
    }
  }
}

/**
 * Refuse to wipe anything that is not recognisably the app repository.
 *
 * This script deletes its target's contents recursively. The target comes
 * from an environment variable, so a typo, a stale shell or a mistaken
 * absolute path points it at something else entirely — and everything except
 * node_modules/.git/.github is gone with no undo. The published app is
 * identifiable (its package.json is named cap2ui5, or its git remote is the
 * app repo), so require that identification before destroying anything.
 */
function assertLooksLikeAppRepo(dir) {
  const reasons = [];

  // An empty directory is a fresh clone target — nothing to destroy, allow it.
  const entries = fs.readdirSync(dir).filter((e) => e !== ".git" && e !== ".github" && e !== "node_modules");
  if (entries.length === 0) return "empty checkout";

  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(dir, "package.json"), "utf8"));
    if (String(pkg.name).toLowerCase() === "cap2ui5") return `package.json name "${pkg.name}"`;
    reasons.push(`package.json is named "${pkg.name}", expected "cap2ui5"`);
  } catch (e) {
    reasons.push(`no readable package.json (${e.code || e.message})`);
  }

  try {
    const cfg = fs.readFileSync(path.join(dir, ".git", "config"), "utf8");
    if (/cap2UI5\/cap2UI5(\.git)?/i.test(cfg)) return "git remote cap2UI5/cap2UI5";
    reasons.push("git remote does not point at cap2UI5/cap2UI5");
  } catch {
    reasons.push("no .git/config");
  }

  console.error(
    `publish target does not look like the cap2UI5 app repository:\n  ${dest}\n` +
    reasons.map((r) => `  - ${r}`).join("\n") +
    `\n\nThis script wipes its target. Point PUBLISH_TARGET at a checkout of ` +
    `cap2UI5/cap2UI5, or use --dry-run to see what it would do.`,
  );
  process.exit(1);
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

const identified = assertLooksLikeAppRepo(dest);

const count = (function walk(d, topLevel) {
  let n = 0;
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (topLevel && PRESERVE.has(e.name)) continue;
    if (COPY_IGNORE.has(e.name) || e.name.endsWith(".sqlite") || e.name.endsWith(".log")) continue;
    n += e.isDirectory() ? walk(path.join(d, e.name), false) : 1;
  }
  return n;
})(src, true);

if (dryRun) {
  const wiped = fs.readdirSync(dest).filter((e) => !PRESERVE.has(e));
  console.log(`DRY RUN — nothing written.`);
  console.log(`  target    : ${dest}  (identified by ${identified})`);
  console.log(`  would wipe: ${wiped.length} top-level entr${wiped.length === 1 ? "y" : "ies"}` +
    (wiped.length ? ` (${wiped.slice(0, 10).join(", ")}${wiped.length > 10 ? ", …" : ""})` : ""));
  console.log(`  would copy: ${count} files from run/output/cap2UI5`);
  console.log(`  preserved : ${[...PRESERVE].join(", ")}`);
  process.exit(0);
}

// Wipe the target (except preserved entries), then copy the assembled tree in.
for (const entry of fs.readdirSync(dest)) {
  if (PRESERVE.has(entry)) continue;
  fs.rmSync(path.join(dest, entry), { recursive: true, force: true });
}
copyDir(src, dest, true);

console.log(`published ${count} files → ${dest} (1:1 copy of run/output/cap2UI5)`);
