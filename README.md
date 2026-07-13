# builder-cap2UI5 — the CAP app build project

[![test](https://github.com/cap2UI5/builder-cap2UI5/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/cap2UI5/builder-cap2UI5/actions/workflows/test.yml)
[![update cap](https://github.com/cap2UI5/builder-cap2UI5/actions/workflows/update_cap.yml/badge.svg?branch=main)](https://github.com/cap2UI5/builder-cap2UI5/actions/workflows/update_cap.yml)

This project **generates the deployable CAP app**
[cap2UI5](https://github.com/cap2UI5/cap2UI5) from the hand-maintained source
in [`src/`](src/) plus the published core package (the npm package
`abap2UI5`), mirrored from
[builder-abap2UI5-js](https://github.com/cap2UI5/builder-abap2UI5-js).

> [!IMPORTANT]
> Everything in this project is generated automatically — by AI (Claude) and
> by a sync pipeline that consumes the upstream
> [abap2UI5](https://github.com/abap2UI5/abap2UI5) sources. Review and test
> before relying on it.

> [!IMPORTANT]
> **The cap2UI5 app repo is a build artifact — do not hand-edit it.** Every
> publish wipes and rewrites it. The hand-written source lives in
> [`src/`](src/); edit there and re-run the build. (Your own apps go in
> `src/srv/app/` or an external `Z2UI5_APP_DIRS` folder — never in the app
> repo's `srv/app/`, which is regenerated.)

cap2UI5 is organized as three repositories, from framework to finished app:

| Repository | What it is |
|---|---|
| [`builder-abap2UI5-js`](https://github.com/cap2UI5/builder-abap2UI5-js) | abap2UI5 ported to JavaScript — generates the core package `abap2UI5` |
| [`builder-cap2UI5`](https://github.com/cap2UI5/builder-cap2UI5) (here) | generates the full CAP app from `src/` + the published core |
| [`cap2UI5`](https://github.com/cap2UI5/cap2UI5) | the finished, deployable CAP app (**generated**) |

## Build

```bash
npm run mirror_core   # snapshot builder-abap2UI5-js:core/ → run/input/core
                      # (MIRROR_SOURCE=/path/to/builder-abap2UI5-js uses a local checkout)

npm run build_cap     # assemble + publish → regenerate ../cap2UI5 (a sibling
                      # checkout of cap2UI5/cap2UI5; override with PUBLISH_TARGET=…)
```

No dependencies — the scripts are plain Node. What the build does:

| Step | What it does |
|---|---|
| `npm run mirror_core` | snapshot the published core package from builder-abap2UI5-js into `run/input/core` (the upstream commit is recorded in `run/input/UPSTREAM_COMMIT`) |
| `npm run assemble` | `src/` → `run/output/cap2UI5` (verbatim), vendor `run/input/core` → `core/`, then overlay the core's `app/z2ui5/webapp` → `app/z2ui5/webapp` (the copy served by CDS statics and zipped by the mta html5 module — taken from the published core, so the two cannot drift) |
| `npm run publish` | 1:1 copy `run/output/cap2UI5` → the app checkout (`../cap2UI5` or `PUBLISH_TARGET`) — the very last step |
| `npm run build_cap` | `assemble` then `publish` |
| `npm test` | runs the CAP app's own jest suite in `run/output/cap2UI5` (needs one `npm ci` there first — it covers the app **and** the vendored core) |

The framework is consumed as the npm dependency `abap2UI5`: `src/` links the
mirrored package (`file:../run/input/core`), the published app the **vendored
copy** (`file:./core`) — the app repo is fully self-contained. The build's
only transformations: that dependency-path rewrite in `package.json` /
`package-lock.json`, plus merging the core's own lock entries into the app
lock (under `core/node_modules/`), since the vendored core sits inside the
app's package root and npm manages its deps as part of the app tree.

## `src/` — the hand-written source

`src/` is the **source of truth** for the CAP app: the skeleton (`server.js`,
`z2ui5-service.*`, `db/`, `package.json`, `mta.yaml`, `srv/external/`), the
platform wiring (draft store → CDS entity `cap2ui5.z2ui5_t_01`, app discovery
→ `srv/app/`), the bundled custom app `srv/app/z2ui5_cl_app_read_odata.js`,
and the docs. Published as the app repo minus the vendored core and the
generated webapp overlay.

`src/` is itself a fully functional minimal CAP project — the starting point
of cap2UI5 with the same basic setup as abap2UI5: a mini frontend
(`app/index.html`), the http service (`POST /rest/root/z2ui5`) and the draft
persistence. Run and test it standalone (it links the core via
`file:../run/input/core`, so run `npm run mirror_core` first):

```bash
cd src
npm install
npx cds watch      # → http://localhost:4004/index.html
npm test           # jest: boots the server via cds.test(), asserts all three layers
```

See the [minimal base section](src/README.md#the-minimal-base) in the source
README for details.

## Pipeline

The **update cap** workflow (`.github/workflows/update_cap.yml`) runs on
every push to `main` — including the trigger commits builder-abap2UI5-js
pushes here via deploy key (its `trigger_cap` workflow updates
`UPSTREAM_HEAD` after a core rebuild) — plus a nightly cron as safety net.
It mirrors the core, assembles the app, gates it with the app's jest suite,
commits the refreshed `run/input/core` here and publishes the built app 1:1
to [cap2UI5](https://github.com/cap2UI5/cap2UI5) (deploy key, secret
`ACTION_KEY_APP`). The **test** workflow runs the same assemble + jest gate
on every pull request.

## License

MIT.
