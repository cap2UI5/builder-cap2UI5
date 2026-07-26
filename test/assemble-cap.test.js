/**
 * Unit tests for scripts/assemble-cap.js — the critical transformations of
 * the build: the file:./core dependency rewrite, the core lock merge and
 * the validation guardrails. Each test builds a minimal fixture tree in a
 * temporary directory and runs the real script against it via
 * ASSEMBLE_ROOT (see the override at the top of the script).
 */
"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const SCRIPT = path.join(__dirname, "..", "scripts", "assemble-cap.js");

// --- fixture helpers -------------------------------------------------------

function writeJson(file, obj) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(obj, null, 2) + "\n");
}

function write(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
}

/** Minimal but complete fixture root (src/ + run/input/core) the script accepts. */
function makeFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "assemble-fixture-"));

  // src/ — the app skeleton with the mirrored-core file link
  writeJson(path.join(root, "src", "package.json"), {
    name: "fixture-app",
    version: "1.0.0",
    dependencies: { abap2UI5: "file:../run/input/core", express: "^5" },
  });
  writeJson(path.join(root, "src", "package-lock.json"), {
    name: "fixture-app",
    version: "1.0.0",
    lockfileVersion: 3,
    packages: {
      "": {
        name: "fixture-app",
        dependencies: { abap2UI5: "file:../run/input/core", express: "^5" },
      },
      // Mirrors the real lock: the frozen core entry carries the core's own
      // declared dependencies, which the assemble drift-guard checks against
      // run/input/core/package.json.
      "../run/input/core": { name: "abap2UI5", version: "1.0.0", dependencies: { "openui5-dist": "1.113.0" } },
      "node_modules/abap2UI5": { resolved: "../run/input/core", link: true },
      "node_modules/express": { version: "5.0.0", resolved: "https://registry.npmjs.org/express/-/express-5.0.0.tgz" },
    },
  });
  write(path.join(root, "src", "srv", "server.js"), "// server\n");
  write(path.join(root, "src", "app", "index.html"), "<html></html>\n");

  // run/input/core — the mirrored core package
  const core = path.join(root, "run", "input", "core");
  writeJson(path.join(core, "package.json"), {
    name: "abap2UI5",
    version: "1.0.0",
    dependencies: { "openui5-dist": "1.113.0" },
  });
  writeJson(path.join(core, "package-lock.json"), {
    name: "abap2UI5",
    version: "1.0.0",
    lockfileVersion: 3,
    packages: {
      "": { name: "abap2UI5", dependencies: { "openui5-dist": "1.113.0" } },
      "node_modules/openui5-dist": { version: "1.113.0", resolved: "https://registry.npmjs.org/openui5-dist/-/openui5-dist-1.113.0.tgz" },
      "node_modules/some-transitive-dep": { version: "2.0.0", resolved: "https://registry.npmjs.org/some-transitive-dep/-/some-transitive-dep-2.0.0.tgz" },
    },
  });
  write(path.join(core, "srv", "engine.js"), "// engine\n");
  write(path.join(core, "app", "z2ui5", "webapp", "index.html"), "<html>webapp</html>\n");
  write(path.join(core, "app", "z2ui5", "webapp", "Component.js"), "// component\n");

  return root;
}

function runAssemble(root) {
  return spawnSync(process.execPath, [SCRIPT], {
    env: { ...process.env, ASSEMBLE_ROOT: root },
    encoding: "utf8",
  });
}

const readJson = (f) => JSON.parse(fs.readFileSync(f, "utf8"));

let root;
afterEach(() => {
  if (root) fs.rmSync(root, { recursive: true, force: true });
  root = undefined;
});

// --- happy path: rewrite + merge + copy ------------------------------------

describe("assemble-cap happy path", () => {
  test("rewrites the core dependency to file:./core in package.json and the lock", () => {
    root = makeFixture();
    const res = runAssemble(root);
    expect(res.status).toBe(0);

    const dest = path.join(root, "run", "output", "cap2UI5");
    const pkg = readJson(path.join(dest, "package.json"));
    expect(pkg.dependencies.abap2UI5).toBe("file:./core");

    const lock = readJson(path.join(dest, "package-lock.json"));
    expect(lock.packages[""].dependencies.abap2UI5).toBe("file:./core");
    // the bare path key is rewritten too: ../run/input/core → core
    expect(lock.packages["core"]).toBeDefined();
    expect(lock.packages["../run/input/core"]).toBeUndefined();
    expect(lock.packages["node_modules/abap2UI5"].resolved).toBe("core");
    // no stale references anywhere in the rewritten files
    for (const f of ["package.json", "package-lock.json"]) {
      expect(fs.readFileSync(path.join(dest, f), "utf8")).not.toContain("run/input/core");
    }
  });

  test("merges the core lock entries under core/node_modules/", () => {
    root = makeFixture();
    expect(runAssemble(root).status).toBe(0);

    const lock = readJson(path.join(root, "run", "output", "cap2UI5", "package-lock.json"));
    expect(lock.packages["core/node_modules/openui5-dist"]).toEqual(
      expect.objectContaining({ version: "1.113.0" }),
    );
    expect(lock.packages["core/node_modules/some-transitive-dep"]).toEqual(
      expect.objectContaining({ version: "2.0.0" }),
    );
    // the core's root entry ("") must NOT be merged as a package key
    expect(lock.packages["core/"]).toBeUndefined();
  });

  test("vendors the core and overlays the webapp; app deps are untouched", () => {
    root = makeFixture();
    expect(runAssemble(root).status).toBe(0);

    const dest = path.join(root, "run", "output", "cap2UI5");
    expect(fs.existsSync(path.join(dest, "core", "srv", "engine.js"))).toBe(true);
    expect(fs.existsSync(path.join(dest, "app", "z2ui5", "webapp", "Component.js"))).toBe(true);
    expect(fs.existsSync(path.join(dest, "srv", "server.js"))).toBe(true);
    // untouched third-party dependency survives the rewrite verbatim
    const lock = readJson(path.join(dest, "package-lock.json"));
    expect(lock.packages["node_modules/express"].version).toBe("5.0.0");
  });

  test("html5 module scaffolding in src/app/z2ui5 survives the webapp overlay", () => {
    root = makeFixture();
    // the deployable html5 module (mta.yaml `abap2UI5`, path app/z2ui5)
    // ships its build scaffolding as a sibling of webapp/. The overlay must
    // replace only app/z2ui5/webapp, never the scaffolding next to it.
    writeJson(path.join(root, "src", "app", "z2ui5", "package.json"), {
      name: "z2ui5",
      scripts: { "build:cf": "ui5 build --clean-dest --dest dist" },
    });
    write(path.join(root, "src", "app", "z2ui5", "ui5.yaml"), "type: application\n");
    write(path.join(root, "src", "app", "z2ui5", "xs-app.json"), "{}\n");

    expect(runAssemble(root).status).toBe(0);

    const z2ui5 = path.join(root, "run", "output", "cap2UI5", "app", "z2ui5");
    // scaffolding preserved verbatim …
    expect(readJson(path.join(z2ui5, "package.json")).scripts["build:cf"]).toBeDefined();
    expect(fs.existsSync(path.join(z2ui5, "ui5.yaml"))).toBe(true);
    expect(fs.existsSync(path.join(z2ui5, "xs-app.json"))).toBe(true);
    // … and the webapp is still overlaid from the core right beside it
    expect(fs.existsSync(path.join(z2ui5, "webapp", "Component.js"))).toBe(true);
  });

  test("is idempotent — a second run succeeds and produces the same lock", () => {
    root = makeFixture();
    expect(runAssemble(root).status).toBe(0);
    const dest = path.join(root, "run", "output", "cap2UI5");
    const first = fs.readFileSync(path.join(dest, "package-lock.json"), "utf8");
    expect(runAssemble(root).status).toBe(0);
    const second = fs.readFileSync(path.join(dest, "package-lock.json"), "utf8");
    expect(second).toBe(first);
  });

  test("preserves node_modules and core/node_modules across the wipe", () => {
    root = makeFixture();
    expect(runAssemble(root).status).toBe(0);
    const dest = path.join(root, "run", "output", "cap2UI5");
    write(path.join(dest, "node_modules", "marker.txt"), "keep me\n");
    write(path.join(dest, "core", "node_modules", "marker.txt"), "keep me too\n");
    expect(runAssemble(root).status).toBe(0);
    expect(fs.readFileSync(path.join(dest, "node_modules", "marker.txt"), "utf8")).toBe("keep me\n");
    expect(fs.readFileSync(path.join(dest, "core", "node_modules", "marker.txt"), "utf8")).toBe("keep me too\n");
  });
});

// --- guardrails: the build must fail loudly, not produce a broken app ------

describe("assemble-cap guardrails", () => {
  test("fails when run/input/core is missing (mirror not run)", () => {
    root = makeFixture();
    fs.rmSync(path.join(root, "run", "input", "core"), { recursive: true });
    const res = runAssemble(root);
    expect(res.status).toBe(1);
    expect(res.stderr).toContain("run/input/core not found");
  });

  test("fails when the webapp is missing from the core mirror", () => {
    root = makeFixture();
    fs.rmSync(path.join(root, "run", "input", "core", "app"), { recursive: true });
    const res = runAssemble(root);
    expect(res.status).toBe(1);
    expect(res.stderr).toContain("incomplete core mirror");
  });

  test("fails validation when src does not use the file:../run/input/core link", () => {
    root = makeFixture();
    const pkgPath = path.join(root, "src", "package.json");
    const pkg = readJson(pkgPath);
    pkg.dependencies.abap2UI5 = "^1.0.0"; // registry dep instead of the file link
    writeJson(pkgPath, pkg);
    const res = runAssemble(root);
    expect(res.status).toBe(1);
    expect(res.stderr).toContain('expected "file:./core"');
  });

  test("fails validation when the lock has no abap2UI5 link entry", () => {
    root = makeFixture();
    const lockPath = path.join(root, "src", "package-lock.json");
    const lock = readJson(lockPath);
    delete lock.packages["node_modules/abap2UI5"];
    writeJson(lockPath, lock);
    const res = runAssemble(root);
    expect(res.status).toBe(1);
    expect(res.stderr).toContain("node_modules/abap2UI5");
  });

  test("fails when the core lock merge produces 0 entries (empty/renamed core lock)", () => {
    root = makeFixture();
    const coreLockPath = path.join(root, "run", "input", "core", "package-lock.json");
    const coreLock = readJson(coreLockPath);
    coreLock.packages = { "": coreLock.packages[""] }; // no node_modules/* entries
    writeJson(coreLockPath, coreLock);
    const res = runAssemble(root);
    expect(res.status).toBe(1);
    expect(res.stderr).toContain("0 entries");
  });

  test("fails when a stale run/input/core reference survives the rewrite", () => {
    root = makeFixture();
    const lockPath = path.join(root, "src", "package-lock.json");
    const lock = readJson(lockPath);
    // a reference the ordered rewrite pairs do not cover
    lock.packages["node_modules/express"].resolved = "file:/abs/run/input/core/whatever";
    writeJson(lockPath, lock);
    const res = runAssemble(root);
    expect(res.status).toBe(1);
    expect(res.stderr).toContain("still references run/input/core");
  });

  test("fails when the mirrored core's dependencies drift from the frozen lock entry", () => {
    root = makeFixture();
    // The mirrored core adds a dependency that the frozen src lock entry
    // (../run/input/core) does not know about — an npm-ci-breaking drift.
    const corePkgPath = path.join(root, "run", "input", "core", "package.json");
    const corePkg = readJson(corePkgPath);
    corePkg.dependencies["some-new-dep"] = "^2.0.0";
    writeJson(corePkgPath, corePkg);
    const res = runAssemble(root);
    expect(res.status).toBe(1);
    expect(res.stderr).toContain("core dependencies drifted");
  });
});
