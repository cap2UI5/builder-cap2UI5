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

const local = process.env.MIRROR_SOURCE;
if (local) {
  const commit = execFileSync("git", ["-C", local, "rev-parse", "HEAD"]).toString().trim();
  copyCore(local, commit);
} else {
  fs.rmSync(tmp, { recursive: true, force: true });
  try {
    execFileSync("git", ["clone", "--depth", "1", UPSTREAM, tmp], { stdio: "inherit" });
    const commit = execFileSync("git", ["-C", tmp, "rev-parse", "HEAD"]).toString().trim();
    copyCore(tmp, commit);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}
