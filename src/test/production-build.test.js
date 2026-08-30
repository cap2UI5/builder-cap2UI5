// The production build must produce a module that can actually start.
//
// WHY THIS EXISTS
// ---------------
// `cds build --production` stages the deployed server module into gen/srv and
// copies the app's package.json along with it — including its dependency on
// the vendored framework, `"abap2UI5": "file:./core"`. It does not copy the
// target of that specifier: gen/srv had a package.json pointing at a ./core
// that was never there.
//
// Nothing failed. `npm ci` in gen/srv created node_modules/abap2UI5 as a
// symlink to the missing directory (the lock records the dependency as
// `{"resolved":"core","link":true}` and npm does not check link targets), the
// mbt archive built, `cf deploy` succeeded — and the instance crash-looped on
// srv/server.js line 3 with `Cannot find module 'abap2UI5/engine'`. Every
// deployment built from this repo was unstartable, and deploy-check did not
// catch it because it only asserted that gen/srv/srv/server.js and
// gen/srv/package.json exist, which they did.
//
// scripts/vendor-core.js closes the gap; these tests are the gate. They run
// the real production build, so a regression in mta.yaml's before-all, in the
// script, or in what `cds build` chooses to stage fails here — in the suite
// that gates every publish — instead of on Cloud Foundry.
"use strict";

const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const GEN_SRV = path.join(ROOT, "gen", "srv");

// One production build for the whole file: `cds build` plus the vendor step,
// exactly as mta.yaml's before-all runs them.
beforeAll(() => {
  execFileSync("npm", ["run", "--silent", "build:production"], { cwd: ROOT, stdio: "pipe" });
}, 300_000);

describe("cds build --production stages a startable server module", () => {
  test("the modules mta.yaml deploys were built", () => {
    expect(fs.existsSync(path.join(GEN_SRV, "srv", "server.js"))).toBe(true);
    expect(fs.existsSync(path.join(GEN_SRV, "package.json"))).toBe(true);
    // the HDI deployer module — the runtime writes a draft row on every
    // roundtrip, so a deployment without it fails on first interaction
    expect(fs.existsSync(path.join(ROOT, "gen", "db", "src"))).toBe(true);
  });

  test("the framework dependency the staged package.json declares is present", () => {
    const staged = JSON.parse(fs.readFileSync(path.join(GEN_SRV, "package.json"), "utf8"));
    const spec = staged.dependencies.abap2UI5;
    expect(spec).toBe("file:./core");
    // the exact thing that was missing: the directory the specifier names
    expect(fs.existsSync(path.join(GEN_SRV, "core", "package.json"))).toBe(true);
  });

  test("abap2UI5/engine — what srv/server.js requires — resolves in the build output", () => {
    const core = path.join(GEN_SRV, "core");
    const pkg = JSON.parse(fs.readFileSync(path.join(core, "package.json"), "utf8"));
    const engine = pkg.exports["./engine"];
    expect(typeof engine).toBe("string");
    expect(fs.existsSync(path.join(core, engine))).toBe(true);
  });

  test("the staged copy carries the core's source, not an install of it", () => {
    // node_modules is reinstalled by the buildpack from the lock gen/srv
    // inherits (it places the core's own deps under core/node_modules/);
    // shipping the build machine's install would carry the wrong binaries.
    expect(fs.existsSync(path.join(GEN_SRV, "core", "node_modules"))).toBe(false);
    expect(fs.existsSync(path.join(GEN_SRV, "core", "srv", "z2ui5"))).toBe(true);
  });

  test("the local UI5 runtime is not shipped to production", () => {
    // openui5-dist is 611 MB of deprecated release tooling (npm@6, request,
    // jsdom, simple-git) carrying 3 critical and 27 high advisories, and the
    // deployed server never serves /resources — xs-app.json routes it to the
    // ui5 destination. It stays in the app root for `cds watch`; the staged
    // copy drops it.
    const staged = JSON.parse(fs.readFileSync(path.join(GEN_SRV, "core", "package.json"), "utf8"));
    expect(staged.dependencies).toBeUndefined();

    const lock = JSON.parse(fs.readFileSync(path.join(GEN_SRV, "package-lock.json"), "utf8"));
    const orphans = Object.keys(lock.packages).filter((k) => k.startsWith("core/node_modules/"));
    expect(orphans).toEqual([]);
    // manifest and lock have to agree or `npm ci` refuses the tree
    expect(lock.packages["core"].dependencies).toBeUndefined();

    // …while local development still gets it, so `cds watch` keeps serving
    // /resources. Which side declares it depends on the core in the mirror:
    // the app names it in devDependencies, and older cores also carried it as
    // a runtime dependency of their own. Either satisfies local development;
    // asserting the property rather than one of its two shapes keeps this
    // test honest across the mirror update that drops the core's copy.
    const app = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
    const core = JSON.parse(fs.readFileSync(path.join(ROOT, "core", "package.json"), "utf8"));
    const declaredForDev =
      (app.devDependencies && app.devDependencies["openui5-dist"]) ||
      (core.dependencies && core.dependencies["openui5-dist"]);
    expect(declaredForDev).toBeDefined();
    // it must never be a production dependency of the app, whoever declares it
    expect(app.dependencies["openui5-dist"]).toBeUndefined();
  });

  test("mta.yaml runs the build that includes the vendor step", () => {
    const mta = fs.readFileSync(path.join(ROOT, "mta.yaml"), "utf8");
    expect(mta).toMatch(/npm run build:production/);
    // a bare `cds build --production` in before-all would silently reopen the
    // hole, since it stages gen/srv without the core
    expect(mta).not.toMatch(/^\s*-\s*npx cds build --production\s*$/m);
  });
});
