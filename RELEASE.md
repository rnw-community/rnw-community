# Release process

Releases are fully automated: every push to `master` runs the
[Release and publish to NPM](.github/workflows/release.yml) workflow, which versions and publishes the changed
packages with [Lerna](https://lerna.js.org). Nobody publishes from a local machine.

## Versioning model

- **Fixed mode.** [lerna.json](lerna.json) holds one shared version for the whole monorepo. A release bumps it and
  sets it on every package that changed, so packages can sit on different 2.x versions (the version of their last
  change), but a given version number always means the same release.
- **Conventional Commits decide the bump.** `feat` → minor, a `BREAKING CHANGE` footer or `!` → major, anything else →
  patch. The squash-merged PR title is the commit Lerna reads.
- **Changed packages and their dependents.** A package is released when files under it changed since the last `v*`
  tag, or when it depends on a released workspace package. Commits that touch only root files release nothing.
- **Private packages** (`*-example`) are versioned but never published.

Never edit `version` fields, `lerna.json`, or `CHANGELOG.md` by hand.

## What a release does

After `pnpm install --frozen-lockfile`, `pnpm build`, and `pnpm test:coverage` pass, `pnpm release`
(`lerna publish --conventional-commits --create-release=github`):

1. Computes the next version and updates `lerna.json`, each changed `package.json`, and the `CHANGELOG.md` files.
2. Commits `chore: release vX.Y.Z [skip ci]`, tags `vX.Y.Z`, pushes both to `master`, and creates a GitHub Release.
3. Publishes each changed public package to npm with a provenance attestation (`NPM_CONFIG_PROVENANCE=true`),
   rewriting `workspace:` ranges to the released version.

`scripts/assert-published-versions.mjs` then compares every public package's version with its `latest` dist-tag on
npm and fails the run on any drift.

## Recovering a partial release

If a run tagged packages but failed to publish some of them, recover without bumping again:
**Actions → Release and publish to NPM → Run workflow → mode = `from-package`**. This runs
`lerna publish from-package`, which publishes every package whose version is not yet on the registry. Release runs
are serialized, so a recovery run cannot race a push-triggered release.

## Verifying a release

```bash
npm view @rnw-community/<package> dist-tags
npm install @rnw-community/<package>@X.Y.Z && npm audit signatures
```
