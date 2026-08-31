// The same 61 webapp files exist twice in the published app, on purpose —
// and this is the gate that keeps "twice" from becoming "two versions".
//
// WHY THE COPY EXISTS
// -------------------
// The UI5 frontend ships inside the vendored core package
// (core/app/z2ui5/webapp — mirrored 1:1 from upstream abap2UI5), and
// assemble-cap.js overlays it into app/z2ui5/webapp so the tree is a real
// CAP app folder: `cds watch` serves it, the approuter routes to it, and
// `ui5 build` in an MTA pipeline finds it where every UI5 toolchain looks.
// A symlink would not survive a Windows checkout or an mbt archive, and
// serving core/ directly would put deployment paths (xs-app.json, ui5.yaml)
// inside a vendored package nobody may edit. So: a copy, made by the
// assemble step, never by hand.
//
// WHY THE GATE EXISTS
// -------------------
// Nothing checked the copy. The overlay is only correct as long as every
// publish reruns the assemble; an overlay edited in place (the obvious place
// to "fix the frontend") or a stale overlay after a partial run is byte-drift
// between what the browser gets (app/) and what the framework serves its
// embedded assets from (core/) — the split-brain that is invisible until a
// user reports it. This test makes the drift a failing suite instead: it
// runs in the assembled app (the publish gate) and again in the published
// repository's own CI, so both sides prove the two trees are byte-identical.
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

// The vendored core is wherever package.json says it is - "file:./core" in
// the assembled/published app, the builder's input mirror here in src (the
// path is deliberately not spelled out: assemble validates that no output
// file references the builder-side location).
const spec = require(path.join(ROOT, "package.json")).dependencies.abap2UI5;
const CORE = path.resolve(ROOT, spec.replace(/^file:/, ""));

const OVERLAY = path.join(ROOT, "app", "z2ui5", "webapp");
const SOURCE = path.join(CORE, "app", "z2ui5", "webapp");

const walk = (dir, base = dir) => {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p, base));
    else out.push(path.relative(base, p));
  }
  return out;
};

// In the builder checkout the overlay does not exist yet — assemble creates
// it. There the test proves only that the SOURCE side is present; the
// byte comparison runs where the overlay does exist: in the assembled app
// (npm test is the publish gate) and in the published repository.
const assembled = fs.existsSync(OVERLAY);

describe("the webapp overlay", () => {
  test("the vendored core carries the webapp the overlay is copied from", () => {
    expect(fs.existsSync(SOURCE)).toBe(true);
    expect(walk(SOURCE).length).toBeGreaterThan(0);
  });

  (assembled ? describe : describe.skip)("in the assembled app", () => {
    test("carries exactly the files the core webapp has", () => {
      expect(walk(OVERLAY)).toEqual(walk(SOURCE));
    });

    test("is byte-identical to the core webapp", () => {
      for (const rel of walk(SOURCE)) {
        const a = fs.readFileSync(path.join(OVERLAY, rel));
        const b = fs.readFileSync(path.join(SOURCE, rel));
        // name the file, not just "buffers differ"
        expect(a.equals(b) ? rel : `${rel} differs`).toBe(rel);
      }
    });
  });
});
