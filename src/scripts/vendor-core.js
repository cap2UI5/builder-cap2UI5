#!/usr/bin/env node
/**
 * vendor-core — copy the vendored framework package into the production
 * build output.
 *
 * `cds build --production` stages the server module into gen/srv: the CDS
 * model, srv/, and a package.json copied from the app root. That copy keeps
 * the app's dependency on the framework verbatim —
 *
 *     "abap2UI5": "file:./core"
 *
 * — but `cds build` copies only the model and the source folders, never a
 * `file:` dependency's target. So gen/srv declared a dependency on a
 * directory that was not there. Nothing failed loudly: `npm ci` in gen/srv
 * happily created node_modules/abap2UI5 as a symlink to the missing ./core
 * (the app lock records it as `{"resolved":"core","link":true}`, and npm
 * does not check that a link target exists), and the module only died at
 * startup, on the Cloud Foundry instance, with
 *
 *     Error: Cannot find module 'abap2UI5/engine'   (srv/server.js:3)
 *
 * i.e. every deployment built from this repo was unstartable. `cds build`
 * exited 0, the archive built, the push succeeded, and the app crash-looped.
 *
 * This step closes that gap by copying core/ (its source — node_modules is
 * reinstalled by the buildpack from the lock gen/srv inherits) next to the
 * staged package.json, so the `file:./core` specifier resolves in the build
 * output exactly as it does in the app root.
 *
 * Run it after every production build — `npm run build:production` chains
 * the two, mta.yaml's before-all calls that, and test/production-build.test.js
 * gates the result. There is a supported CAP alternative (npm workspaces plus
 * `cds build --ws-pack`, which packs workspace dependencies to a tarball and
 * rewrites the specifier); it is not used here because the vendored core is a
 * plain folder inside the app and the app lock already carries the core's own
 * dependency tree under core/node_modules/ — a workspace layout would hoist
 * those and rewrite the lock the assemble step produces.
 *
 *   node scripts/vendor-core.js [appRoot]
 */
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(process.argv[2] || process.cwd());
const coreSrc = path.join(root, "core");
const genSrv = path.join(root, "gen", "srv");
const coreDest = path.join(genSrv, "core");

// The specifier this step exists to satisfy. If the staged package.json ever
// stops pointing at ./core — because CAP learned to package the dependency
// itself, or the app moved off the vendored copy — vendoring on top of that
// would put a stale second copy in the build output, so stop instead.
const EXPECTED_SPEC = "file:./core";

function fail(msg) {
  console.error(`vendor-core: ${msg}`);
  process.exit(1);
}

if (!fs.existsSync(path.join(coreSrc, "package.json"))) {
  fail(`no core package at ${path.relative(root, coreSrc)}/ — is this the assembled app root?`);
}
if (!fs.existsSync(path.join(genSrv, "package.json"))) {
  fail("no gen/srv/package.json — run `cds build --production` first");
}

const staged = JSON.parse(fs.readFileSync(path.join(genSrv, "package.json"), "utf8"));
const spec = staged.dependencies && staged.dependencies["abap2UI5"];
if (spec !== EXPECTED_SPEC) {
  console.log(`vendor-core: gen/srv declares abap2UI5 as ${JSON.stringify(spec)}, not ${JSON.stringify(EXPECTED_SPEC)} — nothing to vendor`);
  process.exit(0);
}

// node_modules is deliberately not copied: the buildpack installs gen/srv
// from the lock it inherits — copying an install from the build machine
// would ship the wrong platform's binaries and defeat that.
const IGNORE = new Set(["node_modules", "gen", ".git"]);

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  let n = 0;
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    if (IGNORE.has(entry.name)) continue;
    const src = path.join(from, entry.name);
    const dst = path.join(to, entry.name);
    if (entry.isDirectory()) n += copyDir(src, dst);
    else {
      fs.copyFileSync(src, dst);
      n += 1;
    }
  }
  return n;
}

fs.rmSync(coreDest, { recursive: true, force: true });
const files = copyDir(coreSrc, coreDest);

prune_local_ui5_runtime();

/**
 * Drop the local UI5 runtime from the DEPLOYED dependency tree.
 *
 * The core's single dependency is `openui5-dist`, the UI5 runtime the CAP
 * server serves at /resources for local development. On BTP nothing asks the
 * server for it: xs-app.json routes `^/resources/(.*)$` to the `ui5`
 * destination (https://ui5.sap.com), and the framework treats the package as
 * optional anyway — srv/cap/activate.js warns "openui5-dist not resolvable —
 * /resources not served; bootstrap from a CDN instead" and carries on.
 *
 * Shipping it cost 611 MB of staged droplet and 43 npm advisories (3 critical,
 * 27 high) in the production tree, none of them in code the app runs: the
 * package is deprecated ("no longer supported") and its own dependencies are
 * its release tooling — npm@6, request, jsdom, simple-git. Without it the
 * deployed tree is 19 MB with no advisories at all.
 *
 * This prunes the vendored copy only — the app root keeps openui5-dist, so
 * `cds watch` still serves /resources locally exactly as before.
 *
 * The guard matters: the whole core/node_modules/ subtree of the app lock is
 * reachable only from openui5-dist because it is the core's ONLY dependency.
 * The day the core takes a second one, that stops being true, and dropping
 * the subtree would strip a dependency the app actually needs — so this bails
 * out and ships the tree unpruned instead.
 */
function prune_local_ui5_runtime() {
  const RUNTIME = "openui5-dist";
  const pkgPath = path.join(coreDest, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  const deps = Object.keys(pkg.dependencies || {});

  if (deps.length === 0) return; // already pruned, or a core without deps
  if (deps.length !== 1 || deps[0] !== RUNTIME) {
    console.warn(
      `vendor-core: the core now depends on ${deps.join(", ")}, not just ${RUNTIME} — ` +
        `shipping the dependency tree unpruned. Teach this step which subtree belongs to ${RUNTIME}.`
    );
    return;
  }

  delete pkg.dependencies;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

  // …and the matching half of the lock the buildpack installs from, or
  // `npm ci` fails on a lock that disagrees with the manifest.
  const lockPath = path.join(genSrv, "package-lock.json");
  if (!fs.existsSync(lockPath)) return;
  const lock = JSON.parse(fs.readFileSync(lockPath, "utf8"));
  let pruned = 0;
  for (const key of Object.keys(lock.packages || {})) {
    if (key.startsWith("core/node_modules/")) {
      delete lock.packages[key];
      pruned += 1;
    }
  }
  if (lock.packages && lock.packages["core"]) delete lock.packages["core"].dependencies;
  fs.writeFileSync(lockPath, JSON.stringify(lock, null, 2) + "\n");
  console.log(`vendor-core: dropped ${RUNTIME} from the deployed tree (${pruned} lock entries); /resources comes from the ui5 destination`);
}

// A copied package.json is not proof the copy is usable. Check the subpath
// the deployed server actually requires (`abap2UI5/engine`, srv/server.js
// line 3) through the core's own exports map, so a core that stops exporting
// it — or exports a file the copy does not contain — fails here rather than
// on the Cloud Foundry instance.
const vendored = JSON.parse(fs.readFileSync(path.join(coreDest, "package.json"), "utf8"));
const target = vendored.exports && vendored.exports["./engine"];
if (typeof target !== "string") fail("the vendored core does not export './engine'");
if (!fs.existsSync(path.join(coreDest, target))) fail(`exports['./engine'] → ${target}, which the vendored copy does not contain`);

console.log(`vendor-core: core → gen/srv/core (${files} files); abap2UI5/engine → ${target}`);
