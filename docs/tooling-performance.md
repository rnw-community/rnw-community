# Type checking and lint performance

Type checks use pinned [tsrs](https://github.com/oxc-project/tsrs); published JavaScript and declarations still come
from TypeScript 7.0.2. This keeps compiler emit stable while allowing an independently measured checker upgrade.
The TypeScript 6 JavaScript API shim remains available to ESLint, knip and bob.

Supported type-aware rules run in [oxlint with tsgolint](https://oxc.rs/docs/guide/usage/linter/type-aware.html).
ESLint remains the rule source of truth. The generator preserves severities, options and file overrides and verifies
that the rules disabled in ESLint have the same options in oxlint. Rules with known behavior differences stay in
ESLint, including `consistent-return`. The custom public-API documentation rule and remaining typed rules still
require `projectService`, so the migration does not remove the TypeScript program from ESLint.

## Measurements

Measured on 2026-10-25 against baseline `774e92df`, Linux x86_64, AMD Ryzen AI 9 HX 470 (24 logical CPUs), Node 24,
pnpm 11.22.0, native TypeScript 7.0.2, tsrs 0.18.0-ts7.1.0-dev.20260929, oxlint 1.88.0 and tsgolint 7.0.2005.

Each package runs serially with three interleaved repetitions. Times below sum each package's median elapsed time;
they include compiler launch overhead and exclude installation, builds and Turbo. Memory is the largest OS-reported
peak resident set of an individual process across those runs, not the sum of concurrent processes. Filesystem caches
are warm; “cold” means compiler incremental state is disabled. Builds and tests do not run concurrently with measurements.

| Type checks (25 packages)        | TypeScript 7 |       tsrs | Speedup |
| -------------------------------- | -----------: | ---------: | ------: |
| Cold compiler state              |      4.596 s |    2.909 s |   1.58× |
| Warm unchanged incremental state |      2.237 s |    1.867 s |   1.20× |
| Largest cold peak RSS            |   337.21 MiB | 194.12 MiB |         |
| Largest warm peak RSS            |   155.22 MiB | 200.05 MiB |         |

Both compilers pass all 25 projects in every measured run. The incremental comparison primes each compiler's own
build-info file before measuring; their caches never share a path. Warm unchanged checks improve less and tsrs's
largest warm memory peak is higher. These measurements do not predict CI concurrency or a particular edited-file workload.

## Lint results

| Serial lint work                    |                    Before |                              After |
| ----------------------------------- | ------------------------: | ---------------------------------: |
| Sum of package ESLint medians       |                  50.625 s |                           48.212 s |
| Native lint stage                   | 0.087 s (one syntax pass) | 5.736 s (typed checks per package) |
| Combined serial work                |                  50.712 s |                           53.948 s |
| Largest individual process peak RSS |                970.00 MiB |                         920.21 MiB |

The package pipeline is about **6.4% slower in this serial comparison**. Type-aware oxlint is included while preserving
all checks; it is not a lint speedup on this repository. Required ESLint program construction and the retained typed
rules limit the savings, while a native process per package adds work. Per-package execution preserves affected-task
caching and keeps package-local lint commands complete. These sums do not measure Turbo's parallel wall time.
The standalone root typed oxlint pass measured 2.100 s, but it requires every package's dependencies built.

The final native stage was remeasured after removing a redundant `dot-notation` handoff. The active ESLint rule sets
were verified unchanged across all four file categories, so the interleaved ESLint measurements remain comparable.
The baseline syntax pass uses the same syntax-only rule ownership as before the migration.

The final combined diagnostics match the baseline's eight warnings by file, rule, severity and line: three naming
warnings, four type-parameter warnings and one nested-promise warning. There are no source changes to silence them.
Seven tooling regression tests also cover invalid inputs and rules with divergent behavior or ownership aliases.

A payments-package rule timing sample attributed 41% of remaining ESLint rule execution to
`no-unsafe-enum-assignment`, which the native handoff does not support. Rule timings exclude parser and program
startup; keeping `projectService` is still necessary for this rule and the public-API documentation rule.

## Run the checks

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm ts
pnpm ts:nodenext
pnpm lint
pnpm test:tooling
pnpm lint:oxlint:check
```

Package lint commands run `oxlint src && eslint src`; package lint fixes use both tools too. CI builds and lints
affected packages and their build dependencies. Its repository-wide `lint:fast` pass only checks syntax.
`pnpm lint:oxlint` explicitly runs type-aware oxlint over every package and requires every dependency built.
The root `.oxlintrc.json` enables typed rules for direct commands, staged files and editor integrations;
`.oxlintrc.fast.json` extends it with type analysis disabled for `pnpm lint:fast`.

`pnpm test:tooling` checks invalid assignments, floating promises, representative typed diagnostics, async-return
enforcement, full/fast ownership and mixed disable directives. It runs alongside the config drift check in CI.
No library source behavior or published entry point changes in this migration.

The pinned tsrs release provides binaries for Linux x64/ARM64 (GNU and musl) and Apple Silicon macOS.
On Windows or Intel macOS, use `pnpm exec tsc -p packages/<package>/tsconfig.json` (or the NodeNext check config)
until a compatible tsrs binary is available. Builds continue using the existing native compiler on every supported platform.

## Reproduce profiling

The profiler requires Python 3 and Linux or macOS for `wait4` peak-RSS accounting. Run these commands without
concurrent builds or tests:

```sh
python3 scripts/profile-tooling.py types --output .plans/types-profile
python3 scripts/profile-tooling.py types --incremental --output .plans/types-warm-profile
python3 scripts/profile-tooling.py lint --output .plans/lint-profile
```

Each output directory contains per-process logs and `results.json`, including exit codes, elapsed time and peak RSS.
A failing measured command makes the profiler fail. The lint summary adds the package ESLint and native oxlint
medians for the full lint stage and also measures the standalone root native and syntax-only passes.
Use `python3 scripts/profile-tooling.py native --output .plans/native-profile` to remeasure only the native stages.
Turbo cache hits are excluded deliberately; use `pnpm ts:force` or `pnpm lint:force` to exercise orchestration separately.

To compare an ESLint migration, capture both original configs **before** changing rule ownership:

```sh
python3 - <<'PY'
from pathlib import Path
Path('.plans').mkdir(exist_ok=True)
Path('.plans/oxlint-before.json').write_bytes(Path('.oxlintrc.json').read_bytes())
Path('.plans/eslint-before.config.mjs').write_text(
    Path('eslint.config.mjs').read_text().replace(
        "new URL('.oxlintrc.json', import.meta.url)",
        "new URL('oxlint-before.json', import.meta.url)"
    )
)
PY
```

After changing the configuration, run:

```sh
python3 scripts/profile-tooling.py lint \
  --reference-eslint-config .plans/eslint-before.config.mjs \
  --output .plans/lint-comparison
```

Both configs run from the repository root against the same absolute package source paths. An explicit ESLint
`--config` resolves file patterns relative to the working directory; keeping it at the root preserves the custom-rule
scope. Inspect diagnostic logs as well as timing, especially the rules moving between linters.

For per-rule and compiler phase profiling:

```sh
TIMING=1 pnpm exec eslint packages/react-native-payments/src
pnpm exec tsrs -p packages/react-native-payments/tsconfig.json --noEmit --incremental false --extendedDiagnostics
pnpm exec tsc -p packages/react-native-payments/tsconfig.json --noEmit --incremental false --extendedDiagnostics
```

## Upgrade checks

Keep tsrs pinned. Before upgrading it or the tsgolint backend, compare diagnostics against the existing compiler,
run negative fixtures and NodeNext checks, regenerate the lint config, and repeat the benchmarks. Keep declaration
emit on TypeScript 7 until a separate build-output comparison validates an emit migration.
