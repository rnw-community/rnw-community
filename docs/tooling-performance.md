# Type checking and lint performance

Type checks, Node/NestJS JavaScript builds and all declaration emit use pinned
[tsrs](https://github.com/oxc-project/tsrs). React Native libraries retain bob's Babel JavaScript targets and select
tsrs through bob's declaration compiler option. Native TypeScript 7 remains the reference for compatibility and
profiling. The TypeScript 6 JavaScript API shim remains available to ESLint, knip and bob.

Supported type-aware rules run in [oxlint with tsgolint](https://oxc.rs/docs/guide/usage/linter/type-aware.html).
ESLint remains the rule source of truth. The generator preserves severities, options and file overrides and verifies
that the rules disabled in ESLint have the same options in oxlint. Rules with known behavior differences stay in
ESLint, including `consistent-return` and heterogeneous-enum boolean checks. The custom public-API documentation rule and remaining typed rules still
require `projectService`, so the migration does not remove the TypeScript program from ESLint.

## Full build migration and automation coverage

The complete migration updates oxlint, its migrator and the ESLint handoff plugin together to **1.89.0**.
`sort-imports`, `no-lonely-if` and `no-div-regex` now run natively after diagnostic-position parity tests.

| Compiler emit (42 build configurations) | TypeScript 7 |       tsrs |
| --------------------------------------- | -----------: | ---------: |
| Sum of configuration median times       |      4.057 s |    2.844 s |
| Largest individual peak RSS             |   299.12 MiB | 134.83 MiB |

Three interleaved runs per configuration show **1.43× faster compiler work** and **55% lower peak RSS**. These measure
Node/NestJS ESM/CJS emit and the two bob declaration configurations; Babel JavaScript compilation is excluded.
Both compilers succeed in all configurations. Fresh output comparisons cover 3,400 generated files: JavaScript is
byte-identical, with declaration differences limited to two payments web constructors preserving existing type
aliases rather than inlining them, plus a few declaration maps. Bidirectional assignments between both declaration
forms pass with TypeScript 5.9 and tsrs. Default-emit fixtures also verify legacy decorator metadata and source maps.

| Automation                                                                                                       | Compiler and lint coverage                                                                             |
| ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| [PR quality and compatibility](../.github/workflows/pr.yml)                                                      | Native builds, type checks, NodeNext and typed lint; NestJS/Reanimated matrix inherits package scripts |
| Packaged consumers (npm, yarn, pnpm, bun)                                                                        | TypeScript 5.9, native TypeScript 7 and tsrs check shipped declarations                                |
| [Release](../.github/workflows/release.yml)                                                                      | Native builds plus type, lint, config drift and tooling regressions before coverage/publishing         |
| [Android Maestro](../.github/workflows/android-maestro.yml), [iOS Maestro](../.github/workflows/ios-maestro.yml) | Package builds inherit tsrs; bob retains Babel for React Native JavaScript                             |
| [Documentation media](../.github/workflows/docs-media.yml) and PR web/edge-fade builds                           | Existing package build commands inherit tsrs                                                           |
| [VitePress documentation](../.github/workflows/docs.yml)                                                         | VitePress handles its own site build; there is no standalone TypeScript compiler command to replace    |
| Local hooks                                                                                                      | Staged files use typed oxlint, remaining ESLint checks and Prettier                                    |

The older TypeScript consumer leg and attw's own compiler remain deliberate compatibility references.

## Remaining ESLint compatibility

Full oxlint JS-plugin migration was exercised against the custom public-API documentation rule. It fails because
its TypeScript program and ESTree-to-TypeScript maps are unavailable. The [official JS-plugin API support](https://oxc.rs/docs/guide/usage/linter/js-plugins.html#api-support)
excludes type-aware plugins. Removing ESLint would drop required checks.

The installed frontend also rejects `no-unsafe-enum-assignment` as an unknown rule, although the tsgolint backend
contains its implementation. `no-unnecessary-condition` and `prefer-const` have observed multi-line diagnostic
position differences affecting disable directives; `id-length` additionally reports TypeScript type parameters.
Those rules retain their validated ESLint ownership. The rule generator also retains other documented parity and
plugin exceptions; unsupported checks are never silently disabled.

## Type-aware rule audit

Verified on 2026-10-25 against the [oxlint releases](https://github.com/oxc-project/oxc/releases) and
[tsgolint 7.0.2005 release](https://github.com/oxc-project/tsgolint/releases/tag/v7.0.2005).
Oxlint 1.89.0 and tsgolint 7.0.2005 are the current published releases. Upstream documentation headline counts
vary between the [type-aware guide](https://oxc.rs/docs/guide/usage/linter/type-aware.html) and the
[backend implementation inventory](https://github.com/oxc-project/tsgolint#implemented-rules); they are not counts
of enabled repository rules.

The installed public handoff catalog exposes 60 typed counterparts, including nursery entries for audit purposes.
Production TS and TSX now enable **51 built-in typed policies: 47 native and four ESLint**, plus the custom typed
public-API documentation rule. Existing `.spec.ts` exceptions reduce those files to 48 built-in policies (44 native);
`.spec.tsx` retains the production configuration. This audit preserves those existing differences.

Eleven additional policies are enabled beyond `strictTypeChecked`:

| Rule                             | Purpose                                                                                | Owner  |
| -------------------------------- | -------------------------------------------------------------------------------------- | ------ |
| `switch-exhaustiveness-check`    | Require every union member even with a default branch                                  | Native |
| `require-array-sort-compare`     | Require comparators for numeric/object arrays; ordinary string sorting remains allowed | Native |
| `strict-boolean-expressions`     | Reject ambiguous nullable, unknown and heterogeneous-enum conditions                   | ESLint |
| `consistent-type-exports`        | Mark type-only exports explicitly                                                      | Native |
| `no-unnecessary-qualifier`       | Remove redundant namespace qualification                                               | Native |
| `prefer-find`                    | Avoid allocating a filtered array just to select its first item                        | Native |
| `prefer-includes`                | Use membership operations instead of index sentinels                                   | Native |
| `prefer-nullish-coalescing`      | Make nullish defaults explicit                                                         | Native |
| `prefer-readonly`                | Mark private members that are not reassigned as readonly                               | Native |
| `prefer-regexp-exec`             | Use direct non-global regular-expression execution                                     | Native |
| `prefer-string-starts-ends-with` | Use explicit prefix/suffix operations                                                  | Native |

[Exhaustiveness](https://oxc.rs/docs/guide/usage/linter/rules/typescript/switch-exhaustiveness-check) keeps defensive
`default` branches allowed but sets `considerDefaultExhaustiveForUnions: false`.
[Sort comparison](https://oxc.rs/docs/guide/usage/linter/rules/typescript/require-array-sort-compare) explicitly keeps
`ignoreStringArrays: true`. All eleven policies produce no new repository diagnostics. Negative fixtures test each
policy and ownership, and positive fixtures retain exhaustive switches and intentional string sorting.

`strict-boolean-expressions` stays in ESLint after reproducing a native gap for non-nullable heterogeneous enums
and their boolean unions. The other ESLint typed owners remain `no-unnecessary-condition` (diagnostic positions),
`no-unsafe-enum-assignment` (backend implemented, frontend registration missing) and `naming-convention`.
The backend enum-assignment addition is already covered by the existing ESLint policy.

Recent `no-generated-empty-object-type` and `no-useless-default-assignment` rules were already enabled and native.
`await-thenable` defaults reject mixed and entirely synchronous arrays passed to promise aggregators in both engines.
The newly documented [allowMixedPromiseArrays option](https://typescript-eslint.io/rules/await-thenable/#allowmixedpromisearrays)
is rejected by both installed configuration schemas, so it is intentionally not configured. A negative fixture
locks in the mixed-promise check that works today.

Nine available policies remain deliberate opt-outs. Shadow runs cover sources and specs; finding counts are not
claims that every occurrence is a bug:

| Policy                              | Shadow findings | Reason                                                                                 |
| ----------------------------------- | --------------: | -------------------------------------------------------------------------------------- |
| `no-unsafe-type-assertion`          |             249 | Generic/decorator boundaries and test narrowing need a separate guard/decoder adoption |
| `prefer-readonly-parameter-types`   |             691 | Would change mutable contracts and test fixtures across the libraries                  |
| `no-meaningless-void-operator`      |              71 | Explicit void operations are an established cleanup/fire-and-forget convention         |
| `promise-function-async`            |              58 | Direct promise forwarding is intentional                                               |
| `require-await`                     |              42 | Uniform async contracts and promise-shaped test callbacks remain valid                 |
| `no-deprecated`                     |              25 | Compatibility and current React test tooling need a separate migration                 |
| `strict-void-return`                |              18 | Legitimate value-discarding callbacks; async misuse is already checked                 |
| `non-nullable-type-assertion-style` |               6 | Prefers non-null assertions that the existing strict policy forbids                    |
| `prefer-optional-chain`             |               1 | Nursery implementation; retained as a separate parity/style adoption                   |

The two remaining catalog counterparts use the existing core `consistent-return` and `dot-notation` policies.
No rule is silently dropped to increase native counts.

Config generation now checks every typed counterpart exposed by the installed public handoff catalog whose matching
installed typescript-eslint metadata marks it as type-aware. Each needs a resolved policy or an explicit core-rule
alternative. Upgrades adding an unclassified counterpart fail `lint:oxlint:check`. This guard does not discover
native-only rules absent from that metadata; upstream release review remains necessary. Nursery discovery here
does not enable nursery checks at runtime.

Twenty tooling regression tests cover the new policies, enum fallback, mixed promise arrays and catalog guard.
The original eight warnings remain unchanged. Three interleaved runs on `eslint-plugin`, `react-native-payments`
and `react-native-screen-chrome` measured combined ESLint/native work of 9.288 s before and 8.696 s after these
policies, with largest individual RSS 830.39 MiB and 818.88 MiB respectively. This small sample shows no measured
regression; it is not a whole-workspace speedup claim. The full-workspace lint measurement below predates this audit.

## Initial check-only measurements

Measured on 2026-10-25 against baseline `774e92df`, Linux x86_64, AMD Ryzen AI 9 HX 470 (24 logical CPUs), Node 24,
pnpm 11.22.0, native TypeScript 7.0.2, tsrs 0.18.0-ts7.1.0-dev.20260929, oxlint 1.88.0 and tsgolint 7.0.2005.

Each package runs serially with three interleaved repetitions. Times below sum each package's median elapsed time;
they include compiler launch overhead and exclude installation, builds and Turbo. Memory is the largest OS-reported
peak resident set of an individual process across those runs, not the sum of concurrent processes. In particular,
concurrent oxlint and tsgolint RSS is not aggregated; these figures do not measure total native-stage memory. Filesystem caches
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

## Updated lint comparison (oxlint 1.89)

| Serial lint work                    |          Before migration |                  Updated migration |
| ----------------------------------- | ------------------------: | ---------------------------------: |
| Sum of package ESLint medians       |                  50.892 s |                           47.092 s |
| Native lint stage                   | 0.081 s (one syntax pass) | 5.975 s (typed checks per package) |
| Combined serial work                |                  50.973 s |                           53.068 s |
| Largest individual process peak RSS |              1,034.42 MiB |                         885.99 MiB |

Three interleaved runs per package still show about **4.1% more serial lint work**. Full native lint migration was
attempted and compatible rules were transferred; required ESLint program construction and the retained typed rules
limit the savings. A native process per package adds work. Per-package execution preserves affected-task caching
and keeps package-local commands complete. These sums do not measure Turbo's parallel wall time.
The standalone root typed oxlint pass measured 1.927 s, but requires every package's dependencies built.

The baseline and migrated pipelines both report the same eight existing warnings by file, rule, severity and line:
three naming warnings, four type-parameter warnings and one nested-promise warning. No library source changes
silence diagnostics. Twenty tooling regression tests cover invalid inputs, default emit, decorator metadata,
newly migrated syntax-rule positions and rules with divergent behavior or ownership aliases.

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

`pnpm test:tooling` builds the local ESLint plugin automatically, then checks invalid assignments, floating promises, representative typed diagnostics, async-return
enforcement, full/fast ownership and mixed disable directives. It runs alongside the config drift check in CI.
No library source behavior or published entry point changes in this migration. The full-migration extension also
checks default emit, decorator metadata and newly migrated syntax-rule positions.

The pinned tsrs release provides binaries for Linux x64/ARM64 (GNU and musl) and Apple Silicon macOS.
Package commands and bob use `scripts/typecheck.mjs`, which resolves the installed tsrs binary before invoking it.
When that optional binary is unavailable (including Windows and Intel macOS), it reports the reason and invokes the
native reference compiler instead. Invalid `TSRS_BINARY` overrides fail explicitly. Compiler diagnostics and exit
codes never trigger a fallback. The launcher is part of Turbo's global inputs, and typed lint/check tasks depend
on dependency builds so they cannot cache results against stale declarations. Published packages remain platform-neutral.
The consumer smoke matrix checks TypeScript 5.9, native TypeScript 7 and tsrs independently. The tooling test runner
invokes JavaScript launchers through Node for portability; direct compiler comparison tests explicitly skip when
the optional tsrs binary is unavailable, while launcher fallback and lint tests still run.
Turbo declares `TSRS_BINARY` in `globalEnv`, preserving the override and incorporating it in task hashes.
`affectedUsingTaskInputs` makes root lint config changes select package lint tasks through their declared inputs;
regressions exercise actual Turbo selection and oxlint discovery from a package directory. The smoke fixture reads
compiler specifications from the root manifest to prevent version drift.

## Reproduce profiling

Build profiling clears each compiler output directory before every sample, and workspace lint samples are emitted
to stdout as well as `results.json`.

The profiler requires Python 3.9+ and Linux or macOS for `wait4` peak-RSS accounting. Run these commands without
concurrent builds or tests:

```sh
python3 scripts/profile-tooling.py build --output .plans/build-profile
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
run negative fixtures and NodeNext checks, regenerate the lint config, and repeat the benchmarks. Compare JavaScript,
declarations and source maps, then exercise both older and native consumers before accepting compiler emit changes.
