// AGENTS.md and README.md each open with the ecosystem table - the same six
// repositories, worded for different readers (roles and generated-ness for
// an agent, what-it-is and how-to-run for a human). Two tables of one set is
// fine; two tables of two DIFFERENT sets is how a renamed or added
// repository ends up documented in one file and missing from the other, and
// nothing noticed. This holds the two sets equal; the wording stays free.
//
// The same test file exists in builder-cap2UI5 - it reads only the repo's
// own two files, so the copies carry nothing repository-specific.
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

/** The OTHER cap2UI5-org repositories a file's ecosystem table links. The
 *  row for the repository itself is dropped (README links it, AGENTS bolds
 *  it without a link - a wording convention, not a disagreement), so each
 *  file yields the same thing: everyone else. */
const SELF = require(path.join(ROOT, "package.json")).name.toLowerCase();

function tableRepoSet(file) {
  const lines = fs.readFileSync(path.join(ROOT, file), "utf8").split("\n");
  const start = lines.findIndex((l) => /^\| Repo/i.test(l));
  if (start === -1) throw new Error(`${file}: no ecosystem table (header row "| Repo...")`);
  const set = new Set();
  for (let i = start; i < lines.length && lines[i].startsWith("|"); i++) {
    for (const m of lines[i].matchAll(/github\.com\/cap2UI5\/([\w-]+)/g)) {
      if (m[1].toLowerCase() !== SELF) set.add(m[1]);
    }
  }
  return set;
}

describe("the ecosystem table", () => {
  const agents = tableRepoSet("AGENTS.md");
  const readme = tableRepoSet("README.md");

  test("names a real set in both files", () => {
    expect(agents.size).toBeGreaterThanOrEqual(4);
    expect(readme.size).toBeGreaterThanOrEqual(4);
  });

  test("AGENTS.md and README.md agree on which repositories exist", () => {
    expect([...agents].sort()).toEqual([...readme].sort());
  });
});
