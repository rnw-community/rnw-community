# Contributing

**Working on your first pull request?** Learn how from the free series
[How to Contribute to an Open Source Project on GitHub](https://egghead.io/series/how-to-contribute-to-an-open-source-project-on-github).

## Setup

Requirements: Node.js 22+ (see [.nvmrc](.nvmrc)) and pnpm 11 (pinned through `packageManager` in
[package.json](package.json); run `corepack enable` to use the pinned version).

```bash
git clone https://github.com/rnw-community/rnw-community.git
cd rnw-community
pnpm install
pnpm build
```

## Commands

Root commands run across every package through Turbo:

```bash
pnpm build          # dual ESM + CJS build into each package's dist/
pnpm ts             # type check
pnpm lint           # ESLint (pnpm lint:fix to auto-fix)
pnpm test           # Jest (pnpm test:coverage for the 99.9% coverage gate)
pnpm ts:nodenext    # type check under nodenext resolution
pnpm publint        # publint + @arethetypeswrong/cli on built packages
pnpm smoke:esm      # pack and import every publishable package under ESM and CommonJS
pnpm assert:docs    # check relative links and anchors in the root docs and llms.txt
pnpm deadcode       # knip
pnpm cpd            # copy-paste detection
```

The same scripts exist per package: `cd packages/<name> && pnpm test --watch`.

## Where things live

- [packages/](packages) — one directory per package; each has a `readme.md` (public API, one example per export) and an
  `AGENTS.md` (layout, patterns, dependencies, coverage).
- [AGENTS.md](AGENTS.md) — the repository conventions: one exported entity per file, zero-comments policy,
  `@rnw-community/shared` primitives, decorator patterns, ESM build invariants.
- [llms.txt](llms.txt) — index of every package for tools and agents.
- [RELEASE.md](RELEASE.md) — how versions and npm releases are produced.
- [SECURITY.md](SECURITY.md) — supported versions and private vulnerability reporting.

## Before opening a pull request

1. `pnpm ts && pnpm lint && pnpm test` pass, and coverage stays at the 99.9% threshold.
2. Packaging changes also pass `pnpm build`, `pnpm publint`, `pnpm ts:nodenext`, and `pnpm smoke:esm`.
3. New or changed public exports are documented in the package `readme.md`.
4. Commits and the PR title follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):
   `type(scope): description`, where the scope is a package directory name (or `deps` / `deps-dev`) and the header is
   at most 100 characters. Commitlint enforces this through a Husky hook; the PR title becomes the squash commit that
   drives the release version bump.
5. No AI-tool or review-bot names in code, tests, docs, commit messages, or PR descriptions.

Every review thread must be answered — with a fixing commit or a concrete refutation — before merge; see
[PR Review & Merge Policy](AGENTS.md#pr-review--merge-policy). Report vulnerabilities privately as described in
[SECURITY.md](SECURITY.md), never in a public issue.
