/**
 * Unit tests for scripts/publish-cap.js — the most destructive script in the
 * pipeline. It wipes its target directory recursively and rewrites it from
 * the assembled tree, with the target coming from an environment variable.
 *
 * The things worth pinning are therefore: that it refuses a target it cannot
 * identify as the app repository, that PRESERVE really survives the wipe
 * (the app repo owns its own .github/ workflows — losing them on a publish
 * would be unrecoverable from here), and that build litter never ships.
 *
 * Each test builds a fixture in a temp dir and runs the real script through
 * PUBLISH_ROOT + PUBLISH_TARGET.
 */
"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const SCRIPT = path.join(__dirname, "..", "scripts", "publish-cap.js");

function write(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
}

/** A fixture root whose run/output/cap2UI5 holds a small assembled app. */
function makeSource() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "publish-src-"));
  const app = path.join(root, "run", "output", "cap2UI5");
  write(path.join(app, "package.json"), JSON.stringify({ name: "cap2ui5" }) + "\n");
  write(path.join(app, "srv", "server.js"), "// server\n");
  write(path.join(app, "core", "package.json"), JSON.stringify({ name: "abap2UI5" }) + "\n");
  return { root, app };
}

/** A target that identifies as the app repo, with some pre-existing content. */
function makeTarget({ identify = "package" } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "publish-dst-"));
  if (identify === "package") {
    write(path.join(dir, "package.json"), JSON.stringify({ name: "cap2ui5" }) + "\n");
  } else if (identify === "git") {
    write(path.join(dir, ".git", "config"), '[remote "origin"]\n\turl = git@github.com:cap2UI5/cap2UI5.git\n');
  }
  return dir;
}

function run(sourceRoot, target, args = []) {
  return spawnSync(process.execPath, [SCRIPT, ...args], {
    encoding: "utf8",
    env: { ...process.env, PUBLISH_ROOT: sourceRoot, PUBLISH_TARGET: target },
  });
}

describe("publish-cap", () => {
  test("publishes the assembled tree into an identified target", () => {
    const { root } = makeSource();
    const target = makeTarget();
    write(path.join(target, "stale.txt"), "from a previous publish\n");

    const r = run(root, target);
    expect(r.status).toBe(0);
    expect(fs.existsSync(path.join(target, "srv", "server.js"))).toBe(true);
    expect(fs.existsSync(path.join(target, "core", "package.json"))).toBe(true);
    // the wipe really happened
    expect(fs.existsSync(path.join(target, "stale.txt"))).toBe(false);
  });

  test("preserves .git, .github and node_modules across the wipe", () => {
    const { root } = makeSource();
    const target = makeTarget();
    write(path.join(target, ".github", "workflows", "test.yml"), "name: test\n");
    write(path.join(target, ".git", "HEAD"), "ref: refs/heads/main\n");
    write(path.join(target, "node_modules", ".package-lock.json"), "{}\n");

    expect(run(root, target).status).toBe(0);

    // The app repo owns its workflows — they are the one thing there that is
    // NOT regenerated, so a publish that dropped them would be unrecoverable.
    expect(fs.readFileSync(path.join(target, ".github", "workflows", "test.yml"), "utf8")).toBe("name: test\n");
    expect(fs.existsSync(path.join(target, ".git", "HEAD"))).toBe(true);
    expect(fs.existsSync(path.join(target, "node_modules", ".package-lock.json"))).toBe(true);
  });

  test("refuses a target it cannot identify as the app repository", () => {
    const { root } = makeSource();
    const stranger = fs.mkdtempSync(path.join(os.tmpdir(), "not-the-app-"));
    write(path.join(stranger, "important.txt"), "do not delete\n");
    write(path.join(stranger, "package.json"), JSON.stringify({ name: "some-other-project" }) + "\n");

    const r = run(root, stranger);
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("does not look like the cap2UI5 app repository");
    expect(fs.existsSync(path.join(stranger, "important.txt"))).toBe(true);
  });

  test("accepts a target identified by its git remote alone", () => {
    const { root } = makeSource();
    const target = makeTarget({ identify: "git" });
    write(path.join(target, "leftover.txt"), "x\n");
    expect(run(root, target).status).toBe(0);
    expect(fs.existsSync(path.join(target, "srv", "server.js"))).toBe(true);
  });

  test("accepts an empty checkout", () => {
    const { root } = makeSource();
    const target = fs.mkdtempSync(path.join(os.tmpdir(), "publish-empty-"));
    expect(run(root, target).status).toBe(0);
    expect(fs.existsSync(path.join(target, "package.json"))).toBe(true);
  });

  test("--dry-run writes nothing", () => {
    const { root } = makeSource();
    const target = makeTarget();
    write(path.join(target, "stale.txt"), "still here afterwards\n");

    const r = run(root, target, ["--dry-run"]);
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("DRY RUN");
    expect(fs.existsSync(path.join(target, "stale.txt"))).toBe(true);
    expect(fs.existsSync(path.join(target, "srv", "server.js"))).toBe(false);
  });

  test("never ships build litter or an installed dependency tree", () => {
    const { root, app } = makeSource();
    // What a local `npm ci` / `cds build` / `mbt build` leaves behind.
    write(path.join(app, "core", "node_modules", "left-pad", "index.js"), "//\n");
    write(path.join(app, "gen", "srv", "csn.json"), "{}\n");
    write(path.join(app, "db.sqlite"), "");
    write(path.join(app, "mta_archives", "archive.mtar"), "");

    const target = makeTarget();
    expect(run(root, target).status).toBe(0);

    expect(fs.existsSync(path.join(target, "core", "node_modules"))).toBe(false);
    expect(fs.existsSync(path.join(target, "gen"))).toBe(false);
    expect(fs.existsSync(path.join(target, "db.sqlite"))).toBe(false);
    expect(fs.existsSync(path.join(target, "mta_archives"))).toBe(false);
    // …while the real content still arrives
    expect(fs.existsSync(path.join(target, "core", "package.json"))).toBe(true);
  });

  test("fails clearly when the app was never assembled", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "publish-noassemble-"));
    const r = run(root, makeTarget());
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("run `npm run assemble` first");
  });
});
