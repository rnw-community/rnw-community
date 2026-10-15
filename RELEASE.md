# Release process

Releases are fully automated: every push to `master` runs the
[Release and publish to NPM](.github/workflows/release.yml) workflow, which versions and publishes the changed
packages with [Lerna](https://lerna.js.org). Nobody publishes from a local machine.

## Versioning model

- **Fixed mode.** [lerna.json](lerna.json) holds one shared version (`"version": "2.19.3"`) for the whole monorepo.
  A release bumps that version and sets it on every package that changed, so different packages can sit on different
  2.x versions (the version of their last change), but a given version number always means the same release.
- **Conventional Commits decide the bump.** `lerna publish --conventional-commits` reads the commits since the last
  `v*` tag: `feat` → minor, a `BREAKING CHANGE` footer or `!` → major, anything else → patch.
- **Changed packages and their dependents.** A package is released when files under it changed since the last tag, or
  when it depends on a released workspace package. Commits that touch only root files (CI, root tooling) release
  nothing.
- **Private packages** (`*-example`) are versioned but never published.
- **Branch guard.** `lerna.json` restricts `publish` to `master` (`allowBranch`).

## What a release does

`pnpm release` runs:

```bash
lerna publish --yes --conventional-commits --create-release=github -m "chore: release %s [skip ci]"
```

1. Computes the next version from the commits, then updates `lerna.json`, each changed `package.json`, the per-package
   `CHANGELOG.md` files, and the root `CHANGELOG.md`.
2. Commits the result as `chore: release vX.Y.Z [skip ci]` (the `[skip ci]` marker stops the release commit from
   re-triggering the workflow), tags it `vX.Y.Z`, and pushes both to `master`.
3. Creates a GitHub Release for the tag with the generated changelog.
4. Publishes each changed public package to npm. Workspace dependency ranges are rewritten to the concrete released
   version in the published manifest (`workspace:^` → `^X.Y.Z`, `workspace:*` → `X.Y.Z`).

## Workflow steps

1. Checkout with full history (needed for conventional-commit analysis and tags).
2. `pnpm install --frozen-lockfile`, `pnpm build`, `pnpm test:coverage`, upload coverage to Codecov. A failure here
   stops the release before anything is versioned.
3. `pnpm release` (described above).
4. `node scripts/assert-published-versions.mjs` compares every public package's `package.json` version with its
   `latest` dist-tag on npm (with retries for registry propagation) and fails the run on any drift.

## Provenance and authentication

The job has `id-token: write` and sets `NPM_CONFIG_PROVENANCE=true`, so every tarball is published with an npm
provenance (SLSA) attestation linking it to the exact workflow run and commit. Pushing the release commit, tag, and
GitHub Release uses the `GH_PAT_TOKEN` repository secret.

## Recovering a partial release

If a run versioned and tagged packages but failed to publish some of them, the drift assertion fails and prints the
missing packages. Recover without bumping again:

**Actions → Release and publish to NPM → Run workflow → mode = `from-package`**

This runs `pnpm release:from-package` (`lerna publish from-package --yes`), which publishes every package whose
`package.json` version is not yet on the registry. Release runs are serialized (`concurrency: release-<repo>`, never
cancelled), so a recovery run cannot race a push-triggered release.

## Verifying a release

```bash
npm view @rnw-community/<package> dist-tags          # latest matches the released version
npm view @rnw-community/<package>@X.Y.Z dist.attestations
npm install @rnw-community/<package>@X.Y.Z && npm audit signatures
```

Before merging packaging changes, the PR workflow already exercises the installed-package layer: `pnpm publint`
(publint + `@arethetypeswrong/cli`) and `pnpm smoke:esm`, which packs each publishable package and imports the tarball
under real ESM and CommonJS with npm, yarn, pnpm, and bun.

## Contributor checklist

- Use a Conventional Commit PR title with a package scope (`fix(shared): …`); squash-merge so the title becomes the
  commit Lerna reads.
- Mark breaking changes with `!` or a `BREAKING CHANGE:` footer — that is what produces a major release.
- Never edit `version` fields, `lerna.json`, or `CHANGELOG.md` by hand.
