/**
 * Unit tests for scripts/mirror-core.js.
 *
 * The interesting part is the arbitration between two candidate commits: the
 * sha in the UPSTREAM_HEAD trigger slot and the HEAD a fresh clone actually
 * sees. Both can legitimately be the newer one — the slot wins a
 * fast-double-push race, HEAD wins whenever the slot has gone stale (upstream
 * writes it from a manual workflow) — and picking wrong is silent: the build
 * succeeds, it just builds the wrong core. That logic never had a test.
 *
 * Real git repositories are used as fixtures (with fixed committer dates, so
 * the comparison is deterministic) and cloned over a file:// URL, so nothing
 * here needs network access.
 */
"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync, execFileSync } = require("child_process");

const SCRIPT = path.join(__dirname, "..", "scripts", "mirror-core.js");

const GIT_ENV = {
  GIT_AUTHOR_NAME: "t",
  GIT_AUTHOR_EMAIL: "t@example.com",
  GIT_COMMITTER_NAME: "t",
  GIT_COMMITTER_EMAIL: "t@example.com",
};

function git(cwd, args, extraEnv = {}) {
  return execFileSync("git", ["-C", cwd, ...args], {
    encoding: "utf8",
    env: { ...process.env, ...GIT_ENV, ...extraEnv },
  }).trim();
}

function write(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
}

/** An upstream repo whose core/ carries a marker file naming the commit. */
function makeUpstream() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "mirror-upstream-"));
  git(dir, ["init", "-q", "-b", "main"]);
  const commit = (marker, date) => {
    write(path.join(dir, "core", "package.json"), JSON.stringify({ name: "abap2UI5" }) + "\n");
    write(path.join(dir, "core", "marker.txt"), marker + "\n");
    write(path.join(dir, "core", "node_modules", "junk", "index.js"), "//\n");
    git(dir, ["add", "-A"]);
    git(dir, ["commit", "-q", "-m", marker], { GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date });
    return git(dir, ["rev-parse", "HEAD"]);
  };
  return { dir, commit };
}

/** A consumer root with the UPSTREAM_HEAD slot optionally set. */
function makeRoot(slot) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "mirror-root-"));
  if (slot) write(path.join(root, "UPSTREAM_HEAD"), slot + "\n");
  return root;
}

function run(root, upstream, env = {}) {
  return spawnSync(process.execPath, [SCRIPT], {
    encoding: "utf8",
    env: { ...process.env, ...GIT_ENV, MIRROR_ROOT: root, MIRROR_UPSTREAM: upstream, ...env },
  });
}

const marker = (root) => fs.readFileSync(path.join(root, "run", "input", "core", "marker.txt"), "utf8").trim();
const recorded = (root) => fs.readFileSync(path.join(root, "run", "input", "UPSTREAM_COMMIT"), "utf8").trim();

describe("mirror-core", () => {
  jest.setTimeout(60000);

  test("MIRROR_SOURCE copies a local checkout and records its HEAD", () => {
    const up = makeUpstream();
    const sha = up.commit("local", "2026-01-01T00:00:00Z");
    const root = makeRoot();

    const r = run(root, up.dir, { MIRROR_SOURCE: up.dir });
    expect(r.status).toBe(0);
    expect(marker(root)).toBe("local");
    expect(recorded(root)).toBe(sha);
  });

  test("node_modules never enters the mirror", () => {
    const up = makeUpstream();
    up.commit("local", "2026-01-01T00:00:00Z");
    const root = makeRoot();

    expect(run(root, up.dir, { MIRROR_SOURCE: up.dir }).status).toBe(0);
    expect(fs.existsSync(path.join(root, "run", "input", "core", "node_modules"))).toBe(false);
  });

  test("the mirror is wiped, so upstream deletions propagate", () => {
    const up = makeUpstream();
    up.commit("local", "2026-01-01T00:00:00Z");
    const root = makeRoot();
    write(path.join(root, "run", "input", "core", "removed-upstream.js"), "// gone\n");

    expect(run(root, up.dir, { MIRROR_SOURCE: up.dir }).status).toBe(0);
    expect(fs.existsSync(path.join(root, "run", "input", "core", "removed-upstream.js"))).toBe(false);
  });

  test("a NEWER UPSTREAM_HEAD slot wins over the cloned HEAD", () => {
    // The fast-double-push race: the slot announces a commit a fresh clone of
    // the default branch does not see yet.
    const up = makeUpstream();
    up.commit("older-head", "2026-01-01T00:00:00Z");
    const newer = up.commit("newer-slot", "2026-06-01T00:00:00Z");
    // Move the branch back so a clone lands on the older commit while the
    // newer one is still reachable by sha. `git branch -f` refuses to touch
    // the checked-out branch, so reset the worktree instead.
    git(up.dir, ["reset", "-q", "--hard", "HEAD~1"]);

    const root = makeRoot(newer);
    const r = run(root, up.dir);
    expect(r.status).toBe(0);
    expect(marker(root)).toBe("newer-slot");
    expect(recorded(root)).toBe(newer);
    expect(r.stdout).toContain("honoring UPSTREAM_HEAD");
  });

  test("a STALE UPSTREAM_HEAD slot does not pin the build to an old core", () => {
    const up = makeUpstream();
    const old = up.commit("stale-slot", "2026-01-01T00:00:00Z");
    up.commit("current-head", "2026-06-01T00:00:00Z");

    const root = makeRoot(old);
    const r = run(root, up.dir);
    expect(r.status).toBe(0);
    expect(marker(root)).toBe("current-head");
    expect(r.stdout).toContain("is stale");
  });

  test("an unfetchable slot falls back to HEAD with a warning", () => {
    const up = makeUpstream();
    up.commit("current-head", "2026-01-01T00:00:00Z");

    // A well-formed sha that exists in no repository.
    const root = makeRoot("0".repeat(39) + "1");
    const r = run(root, up.dir);
    expect(r.status).toBe(0);
    expect(marker(root)).toBe("current-head");
    expect(r.stderr + r.stdout).toContain("not fetchable");
  });

  test("a malformed slot is ignored outright", () => {
    const up = makeUpstream();
    up.commit("current-head", "2026-01-01T00:00:00Z");

    const root = makeRoot("not-a-sha");
    const r = run(root, up.dir);
    expect(r.status).toBe(0);
    expect(marker(root)).toBe("current-head");
    // Not even an attempt to fetch it.
    expect(r.stdout + r.stderr).not.toContain("not fetchable");
  });

  test("the temp clone directory is cleaned up", () => {
    const up = makeUpstream();
    up.commit("current-head", "2026-01-01T00:00:00Z");
    const root = makeRoot();

    expect(run(root, up.dir).status).toBe(0);
    expect(fs.existsSync(path.join(root, ".mirror_tmp"))).toBe(false);
  });

  test("refuses an upstream without a core package", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "mirror-nocore-"));
    git(dir, ["init", "-q", "-b", "main"]);
    write(path.join(dir, "readme.md"), "no core here\n");
    git(dir, ["add", "-A"]);
    git(dir, ["commit", "-q", "-m", "no core"]);

    const r = run(makeRoot(), dir, { MIRROR_SOURCE: dir });
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("core/package.json not found");
  });
});
