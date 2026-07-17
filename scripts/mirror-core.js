#!/usr/bin/env node
/**
 * mirror-core — snapshots the published core package (the npm package
 * `abap2UI5`) from the upstream builder-abap2UI5-js repository into
 * run/input/core/ — the build's only external input.
 *
 *   node scripts/mirror-core.js                                # shallow-clone from GitHub
 *   MIRROR_SOURCE=/path/to/builder-abap2UI5-js node …          # copy a local checkout instead
 *
 * Only the published package subfolder (core/) is kept — that is all the
 * build reads. The upstream commit is recorded in run/input/UPSTREAM_COMMIT
 * (same convention as the run/input snapshots in builder-abap2UI5-js).
 * run/input/core/ is wiped and rewritten on every run, so upstream
 * deletions propagate.
 *
 * The sha in UPSTREAM_HEAD (the trigger slot written by builder-abap2UI5-js)
 * is honored when it is NEWER than the cloned default-branch HEAD (the
 * fast-double-push race: the announced commit is not yet what a fresh clone
 * sees). A stale slot — trigger_cap upstream is manual, so the slot lags —
 * must not pin the nightly to an old core, so the newer of the two commits
 * wins (committer date; equal-or-older slot ⇒ HEAD). If the slot sha cannot
 * be fetched at all, the mirror falls back to HEAD with a warning.
 */
"use strict";

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const UPSTREAM = "https://github.com/cap2UI5/builder-abap2UI5-js";

const root = path.join(__dirname, "..");
const inputDir = path.join(root, "run", "input");
const dest = path.join(inputDir, "core");
const tmp = path.join(root, ".mirror_tmp");

function copyCore(fromRepo, commit) {
  const from = path.join(fromRepo, "core");
  if (!fs.existsSync(path.join(from, "package.json"))) {
    console.error("upstream core/package.json not found — repository structure changed?");
    process.exit(1);
  }
  fs.rmSync(dest, { recursive: true, force: true });
  fs.mkdirSync(dest, { recursive: true });
  fs.cpSync(from, dest, {
    recursive: true,
    filter: (src) => !src.includes(`${path.sep}node_modules`),
  });
  fs.writeFileSync(path.join(inputDir, "UPSTREAM_COMMIT"), `${commit}\n`);
  console.log(`mirror: builder-abap2UI5-js@${commit.slice(0, 12)} core/ → run/input/core/`);
}

function pinnedSha() {
  const slot = path.join(root, "UPSTREAM_HEAD");
  if (!fs.existsSync(slot)) return null;
  const sha = fs.readFileSync(slot, "utf8").trim();
  return /^[0-9a-f]{40}$/.test(sha) ? sha : null;
}

const local = process.env.MIRROR_SOURCE;
if (local) {
  const commit = execFileSync("git", ["-C", local, "rev-parse", "HEAD"]).toString().trim();
  copyCore(local, commit);
} else {
  fs.rmSync(tmp, { recursive: true, force: true });
  try {
    execFileSync("git", ["clone", "--depth", "1", UPSTREAM, tmp], { stdio: "inherit" });
    const head = execFileSync("git", ["-C", tmp, "rev-parse", "HEAD"]).toString().trim();
    const pin = pinnedSha();
    if (pin && pin !== head) {
      try {
        execFileSync("git", ["-C", tmp, "fetch", "--depth", "1", "origin", pin], { stdio: "inherit" });
        const date = (sha) =>
          Number(execFileSync("git", ["-C", tmp, "show", "-s", "--format=%ct", sha]).toString().trim());
        if (date(pin) > date(head)) {
          execFileSync("git", ["-C", tmp, "checkout", "--force", pin], { stdio: "inherit" });
          console.log(`mirror: honoring UPSTREAM_HEAD ${pin.slice(0, 12)} (newer than cloned HEAD ${head.slice(0, 12)})`);
        } else {
          console.log(`mirror: UPSTREAM_HEAD ${pin.slice(0, 12)} is stale — mirroring HEAD ${head.slice(0, 12)}`);
        }
      } catch (e) {
        console.warn(`mirror: UPSTREAM_HEAD ${pin.slice(0, 12)} not fetchable — falling back to upstream HEAD`);
      }
    }
    const commit = execFileSync("git", ["-C", tmp, "rev-parse", "HEAD"]).toString().trim();
    copyCore(tmp, commit);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}
