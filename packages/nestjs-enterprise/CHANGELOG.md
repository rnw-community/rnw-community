# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.0.2](https://github.com/rnw-community/rnw-community/compare/v2.0.0...v2.0.2) (2026-04-24)

**Note:** Version bump only for package @rnw-community/nestjs-enterprise

# [2.0.0](https://github.com/rnw-community/rnw-community/compare/v1.14.1...v2.0.0) (2026-04-24)

### Bug Fixes

- address PR bot comments and lint compliance across touched packages ([1e44c79](https://github.com/rnw-community/rnw-community/commit/1e44c79e0c810b487e74ac6435b974f2f4f34f43))
- **knip:** resolve dead-code failures surfaced on CI ([53c0ded](https://github.com/rnw-community/rnw-community/commit/53c0dedaf06ecd07df11626806a2584d51bb85bc))
- **lint:** resolve all ESLint errors surfaced on CI across the 5 touched packages ([10b47ac](https://github.com/rnw-community/rnw-community/commit/10b47acc0e54668529479a2469aa39863278e56f))
- **lint:** resolve lint errors in new review-fix tests (imports, param names, max-statements, newline-before-return) ([1dfe8b8](https://github.com/rnw-community/rnw-community/commit/1dfe8b806589f45c1632f27a70c94db62778f051))
- **nestjs-enterprise:** lock decorators do not swallow method-thrown LockBusyError ([0f631d9](https://github.com/rnw-community/rnw-community/commit/0f631d90a44872ddf662c713daffc48522bc0b5b))
- P0/P1 bugs surfaced during deep code review ([30f55cf](https://github.com/rnw-community/rnw-community/commit/30f55cf79e039a7341626dbc8724dcf32b68b03a))

- refactor(decorators-core)!: InterceptorMiddleware is a function type, not a 1-method interface ([5a47a65](https://github.com/rnw-community/rnw-community/commit/5a47a65bf786e7aceea66eedf3812019b9c08082))
- feat(log-decorator)!: thread durationMs through postLog/errorLog callbacks ([8ad6b56](https://github.com/rnw-community/rnw-community/commit/8ad6b56604ca4ac319520ca761619decda140498))
- feat(decorators-core)!: rxjs strategies moved to /rxjs subpath ([19bc9e0](https://github.com/rnw-community/rnw-community/commit/19bc9e0e7e626e332c4a232d3d46a696d2bfcb86))
- feat(decorators-core)!: honest rxjs peer via /rxjs subpath split ([aa5bde1](https://github.com/rnw-community/rnw-community/commit/aa5bde1b1998da64895493f99bc726280728a781))

### Features

- **decorators:** automatic type narrowing from decorated method signatures ([67eb662](https://github.com/rnw-community/rnw-community/commit/67eb66270d5fc705d8c431ae3cd3b15f8898e712))
- **decorators:** unified HistogramMetric + Log proof-of-unification ([f6a38a6](https://github.com/rnw-community/rnw-community/commit/f6a38a667bd664ce737f4019195b3b0f67fd86ae))
- **nestjs-enterprise:** @HistogramMetric forwards labels; instanceof Histogram guard ([7efe0bb](https://github.com/rnw-community/rnw-community/commit/7efe0bb0441fc9f6acef0b92094b0ddaf191d8ab))
- **nestjs-enterprise:** histogram config mismatch detection via per-registry WeakMap ([f09bab3](https://github.com/rnw-community/rnw-community/commit/f09bab323506970b04af0d6376ebb2c07b0b7e31)), closes [#1](https://github.com/rnw-community/rnw-community/issues/1)

### Reverts

- Revert "feat(decorators-core)!: honest rxjs peer via /rxjs subpath split" ([d199d34](https://github.com/rnw-community/rnw-community/commit/d199d34cf9ce3eb6a4ef5a5e51aaf925ebf07cbb))

### BREAKING CHANGES

- InterceptorMiddleware was exported from
  @rnw-community/decorators-core as an interface with a single
  'invoke' member. It is now exported as a function type. External
  consumers constructing middlewares as { invoke: (context, next) => ... }
  object literals must rewrite them as plain functions:
  (context, next) => ... . Consumers calling middleware.invoke(...)
  must call middleware(...) directly (the nestjs-enterprise observable
  lock decorator is updated in this commit as an example).

The interface wrapped a single member, forcing every consumer to
hand-roll object literals and forcing the engine to reach through
.invoke at the call site. A function type is the idiomatic shape
for this contract and drops a level of indirection from every
middleware in the suite.

Also exports GetResultType from log-decorator's public index
(reversing the "internal only" decision from the prior commit):
nestjs-enterprise's Log factory binding triggers TS2742 on the
CJS build because its inferred type references GetResultType,
and legacy node module resolution cannot portably name a private
file under node_modules. Re-exporting the type fixes the
portability error without reintroducing rxjs into decorators-core.

- (pre-1.0): the function forms of postLog and errorLog
  now receive durationMs: number as the second positional argument,
  between the leading result/error and the trailing method ...args.
  Static-string forms are unchanged. preLog is unchanged (no duration
  exists before the method runs).

Before:
@Log(pre,
(result, orderId) => `placed ${orderId}: ${result.id}`,
(error, orderId) => `failed ${orderId}: ${String(error)}`)

After:
@Log(pre,
(result, duration, orderId) => `placed ${orderId} in ${duration}ms: ${result.id}`,
(error, duration, orderId) => `failed ${orderId} after ${duration}ms: ${String(error)}`)

Rationale: "how long did method X take" is the first ask from every
log-decorator consumer. Threading durationMs positionally keeps
variadic-tuple inference clean under experimentalDecorators —
verified by the new post-log-input.type-test.ts compile-only sentinel
that assigns inferred parameters to typed locals without casts.

Migration: insert a positional \_durationMs parameter in every
function form of postLog/errorLog. TypeScript inference for
result/error/trailing ...args is unchanged.

Cascades:

- nestjs-enterprise Log adapter re-exports the factory; callback
  signatures in its spec updated.
- Updated log-decorator/readme.md, nestjs-enterprise/log-decorator.md.
- log-decorator bumped 0.1.0 -> 0.2.0 with CHANGELOG entry.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>

- consumers importing observableStrategy or
  completionObservableStrategy from '@rnw-community/decorators-core' must
  switch to '@rnw-community/decorators-core/rxjs'.
- observableStrategy and completionObservableStrategy
  are no longer exported from @rnw-community/decorators-core root.
  Import them from @rnw-community/decorators-core/rxjs.

Previous peer-dep declaration (rxjs as optional peer) was a lie: the
root barrel re-exported rxjs-backed strategies, so every consumer
— even those that only needed createInterceptor + promiseStrategy +
syncStrategy — transitively pulled rxjs at install time. The peer
declaration said "optional" but the barrel made it effectively
required.

Fix: split the rxjs-backed strategies into a dedicated /rxjs subpath
(packages/decorators-core/src/rxjs/index.ts). Root is now rxjs-free:
consumers of sync/Promise methods never touch rxjs. Consumers of
Observable strategies add /rxjs to the import path and install rxjs
honestly.

Migration (one import change):

- import { observableStrategy } from '@rnw-community/decorators-core';

* import { observableStrategy } from '@rnw-community/decorators-core/rxjs';

Subpath resolution requires node16+ moduleResolution; the monorepo's
root tsconfig.build-cjs.json moves from moduleResolution: 'node' to
'node16' (and module: 'node16') so published CJS builds resolve
subpath exports correctly.

Downstream updates:

- packages/log-decorator/.../create-log-decorator.spec.ts — import
  observableStrategy from /rxjs
- packages/histogram-metric-decorator/.../create-histogram-metric-decorator.ts
  — import completionObservableStrategy from /rxjs
- packages/nestjs-enterprise/.../log.decorator.ts — import
  observableStrategy from /rxjs

knip.json registers src/rxjs/index.ts as a second entry for
decorators-core so the dead-code gate recognizes the subpath.

All 314 tests pass on affected packages (decorators-core: 66,
log-decorator: 37, histogram-metric-decorator: 15, lock-decorator: 80,
nestjs-enterprise: 116). Coverage 100% statements/branches/functions/lines.

Release impact:

- @rnw-community/decorators-core: 0.1.0 -> 0.2.0 (minor bump under
  0.x semver conventions; functionally a major).
- Downstream packages: no user-facing code changes beyond the import
  path migration above; they keep their current versions since their
  public APIs didn't change.

CHANGELOG:

### Added

- `@rnw-community/decorators-core/rxjs` subpath exporting
  `observableStrategy` and `completionObservableStrategy`.

### Changed (BREAKING)

- `observableStrategy` and `completionObservableStrategy` are no
  longer exported from the root — import from `/rxjs` instead.
- `rxjs` optional-peer declaration is now honest: root imports
  (createInterceptor, promiseStrategy, syncStrategy, GetResultType)
  do not pull rxjs at install time or runtime.

## [1.14.1](https://github.com/rnw-community/rnw-community/compare/v1.14.0...v1.14.1) (2026-02-27)

### Bug Fixes

- **nestjs-enterprise:** preserve error callback message alongside Error object ([edec917](https://github.com/rnw-community/rnw-community/commit/edec917cef15b760834d23410570114b5b655e98))

# [1.14.0](https://github.com/rnw-community/rnw-community/compare/v1.13.0...v1.14.0) (2026-02-27)

### Features

- **nestjs-enterprise:** pass Error object directly to Logger.error() ([a8497ce](https://github.com/rnw-community/rnw-community/commit/a8497ceb4d6262d860d869645ae12adca8e3fc68))

# [1.13.0](https://github.com/rnw-community/rnw-community/compare/v1.12.4...v1.13.0) (2026-02-23)

### Bug Fixes

- simplify ([cbc06d3](https://github.com/rnw-community/rnw-community/commit/cbc06d32a0b859f23a47c2946348538cc981f9c3))

### Features

- **nestjs-enterprise:** log decorator passing stack for errors ([6b29436](https://github.com/rnw-community/rnw-community/commit/6b29436d03386d27cf93051c97540ea705d99d36))

## [1.12.4](https://github.com/rnw-community/rnw-community/compare/v1.12.3...v1.12.4) (2026-02-18)

**Note:** Version bump only for package @rnw-community/nestjs-enterprise

## [1.12.3](https://github.com/rnw-community/rnw-community/compare/v1.12.2...v1.12.3) (2026-02-18)

### Bug Fixes

- **nestjs-enterprise:** invoke catchErrorFn on exclusive lock contention ([fe0d98a](https://github.com/rnw-community/rnw-community/commit/fe0d98a0cbaf40a0ec46109927e54fe608704a9f))

## [1.12.1](https://github.com/rnw-community/rnw-community/compare/v1.12.0...v1.12.1) (2026-02-17)

**Note:** Version bump only for package @rnw-community/nestjs-enterprise

# [1.12.0](https://github.com/rnw-community/rnw-community/compare/v1.11.0...v1.12.0) (2026-02-17)

**Note:** Version bump only for package @rnw-community/nestjs-enterprise

# [1.11.0](https://github.com/rnw-community/rnw-community/compare/v1.10.6...v1.11.0) (2026-02-17)

**Note:** Version bump only for package @rnw-community/nestjs-enterprise

## [1.10.6](https://github.com/rnw-community/rnw-community/compare/v1.10.5...v1.10.6) (2026-02-16)

**Note:** Version bump only for package @rnw-community/nestjs-enterprise

## [1.10.5](https://github.com/rnw-community/rnw-community/compare/v1.10.4...v1.10.5) (2026-02-16)

**Note:** Version bump only for package @rnw-community/nestjs-enterprise

## [1.10.4](https://github.com/rnw-community/rnw-community/compare/v1.10.3...v1.10.4) (2026-02-16)

**Note:** Version bump only for package @rnw-community/nestjs-enterprise

## [1.10.3](https://github.com/rnw-community/rnw-community/compare/v1.10.2...v1.10.3) (2026-02-16)

**Note:** Version bump only for package @rnw-community/nestjs-enterprise

## [1.10.2](https://github.com/rnw-community/rnw-community/compare/v1.10.1...v1.10.2) (2026-02-16)

**Note:** Version bump only for package @rnw-community/nestjs-enterprise

## [1.10.1](https://github.com/rnw-community/rnw-community/compare/v1.10.0...v1.10.1) (2026-02-14)

**Note:** Version bump only for package @rnw-community/nestjs-enterprise

# [1.10.0](https://github.com/rnw-community/rnw-community/compare/v1.9.0...v1.10.0) (2026-02-14)

### Features

- **nestjs-enterprise:** add di-based lock decorator factories ([#307](https://github.com/rnw-community/rnw-community/issues/307)) ([d2ddc11](https://github.com/rnw-community/rnw-community/commit/d2ddc112c5cccb8f89b60077d6a547e83dd0941b))

# [1.9.0](https://github.com/rnw-community/rnw-community/compare/v1.8.2...v1.9.0) (2026-02-14)

**Note:** Version bump only for package @rnw-community/nestjs-enterprise

## [1.8.2](https://github.com/rnw-community/rnw-community/compare/v1.8.1...v1.8.2) (2025-10-26)

**Note:** Version bump only for package @rnw-community/nestjs-enterprise

## [1.7.1](https://github.com/rnw-community/rnw-community/compare/v1.7.0...v1.7.1) (2025-10-24)

**Note:** Version bump only for package @rnw-community/nestjs-enterprise

# [1.7.0](https://github.com/rnw-community/rnw-community/compare/v1.6.2...v1.7.0) (2025-10-24)

### Features

- eslint 9 migration, latest yarn + turbo ([#296](https://github.com/rnw-community/rnw-community/issues/296)) ([9f7258f](https://github.com/rnw-community/rnw-community/commit/9f7258f9feba067016e966d92037a9e3c5252367))

## [1.6.1](https://github.com/rnw-community/rnw-community/compare/v1.6.0...v1.6.1) (2025-07-18)

**Note:** Version bump only for package @rnw-community/nestjs-enterprise

# [1.6.0](https://github.com/rnw-community/rnw-community/compare/v1.5.0...v1.6.0) (2025-07-18)

### Features

- **nestjs-enterprise:** added log decorator generic support ([#197](https://github.com/rnw-community/rnw-community/issues/197)) ([89c9e0a](https://github.com/rnw-community/rnw-community/commit/89c9e0a22bce7c5f1fd345a2f1201e51e34f8690))

# [1.5.0](https://github.com/rnw-community/rnw-community/compare/v1.4.0...v1.5.0) (2025-07-18)

### Features

- bump dev deps, added PR name lint job ([#285](https://github.com/rnw-community/rnw-community/issues/285)) ([2dc8e44](https://github.com/rnw-community/rnw-community/commit/2dc8e442d21aff87d50c6cea18bf9cdb5e6c9d64))

# [1.3.0](https://github.com/rnw-community/rnw-community/compare/v1.2.0...v1.3.0) (2025-06-23)

**Note:** Version bump only for package @rnw-community/nestjs-enterprise

# [1.1.0](https://github.com/rnw-community/rnw-community/compare/v0.83.1...v1.1.0) (2025-02-15)

### Features

- **react-native-payments:** expo plugin support, expo usage example, bump rn example 0.77 ([#270](https://github.com/rnw-community/rnw-community/issues/270)) ([0d8846e](https://github.com/rnw-community/rnw-community/commit/0d8846e119afe1c657b845013d8aef08e891a300))

# [0.83.0](https://github.com/rnw-community/rnw-community/compare/v0.82.1...v0.83.0) (2025-01-12)

**Note:** Version bump only for package @rnw-community/nestjs-enterprise

# [0.82.0](https://github.com/rnw-community/rnw-community/compare/v0.81.0...v0.82.0) (2024-12-15)

**Note:** Version bump only for package @rnw-community/nestjs-enterprise

# [0.81.0](https://github.com/rnw-community/rnw-community/compare/v0.80.1...v0.81.0) (2024-12-01)

### Features

- fixed latest eslint 8, updated yarn, typescript other dev deps ([#258](https://github.com/rnw-community/rnw-community/issues/258)) ([96f74ab](https://github.com/rnw-community/rnw-community/commit/96f74abc876cd16a810145b35da8f22a61360ab0))

## [0.80.1](https://github.com/rnw-community/rnw-community/compare/v0.80.0...v0.80.1) (2024-11-21)

### Bug Fixes

- **nestjs-enterprise:** fixed Lock decorators releasing lock ([#255](https://github.com/rnw-community/rnw-community/issues/255)) ([d5423f8](https://github.com/rnw-community/rnw-community/commit/d5423f8b143f063c7e4b53e631aa0b66b4d2ea28))

# [0.80.0](https://github.com/rnw-community/rnw-community/compare/v0.79.0...v0.80.0) (2024-11-20)

### Bug Fixes

- **nestjs-enterprise:** fixed LockObservable catchErrorFn$ types ([#254](https://github.com/rnw-community/rnw-community/issues/254)) ([e13ce71](https://github.com/rnw-community/rnw-community/commit/e13ce717dbfe49b5e4ede59fec438bae8d4db935))

# [0.79.0](https://github.com/rnw-community/rnw-community/compare/v0.78.1...v0.79.0) (2024-11-18)

**Note:** Version bump only for package @rnw-community/nestjs-enterprise

# [0.78.0](https://github.com/rnw-community/rnw-community/compare/v0.77.0...v0.78.0) (2024-11-13)

### Features

- **nestjs-enterprise:** added catchErrorFn to lock decorators ([#247](https://github.com/rnw-community/rnw-community/issues/247)) ([6e361d1](https://github.com/rnw-community/rnw-community/commit/6e361d1dd97722ad79a670bafddce4297623a942))

# [0.77.0](https://github.com/rnw-community/rnw-community/compare/v0.76.0...v0.77.0) (2024-11-01)

### Features

- **nestjs-enterprice:** added lock decorators ([#243](https://github.com/rnw-community/rnw-community/issues/243)) ([f5e8ef3](https://github.com/rnw-community/rnw-community/commit/f5e8ef3d2dff58efb6fac64769e776bcb4de5d39))
- **shared:** added isPromise type guard ([#245](https://github.com/rnw-community/rnw-community/issues/245)) ([a99ebf8](https://github.com/rnw-community/rnw-community/commit/a99ebf872fab3f075358d091041527240783130d))

## [0.75.4](https://github.com/rnw-community/rnw-community/compare/v0.75.3...v0.75.4) (2024-10-14)

**Note:** Version bump only for package @rnw-community/nestjs-enterprise

# [0.75.0](https://github.com/rnw-community/rnw-community/compare/v0.74.4...v0.75.0) (2024-10-10)

**Note:** Version bump only for package @rnw-community/nestjs-enterprise

# [0.74.0](https://github.com/rnw-community/rnw-community/compare/v0.73.0...v0.74.0) (2024-07-20)

### Features

- **wdio:** upgraded wdio to latest v8, fixed types, bump turbo 2.0.9, TS 5.5, eslint and its deps ([#209](https://github.com/rnw-community/rnw-community/issues/209)) ([1da06a0](https://github.com/rnw-community/rnw-community/commit/1da06a0bb53e94ad318e76b19bc2c9c153871656))

# [0.73.0](https://github.com/rnw-community/rnw-community/compare/v0.72.2...v0.73.0) (2024-07-11)

**Note:** Version bump only for package @rnw-community/nestjs-enterprise

## [0.72.2](https://github.com/rnw-community/rnw-community/compare/v0.72.1...v0.72.2) (2024-06-28)

**Note:** Version bump only for package @rnw-community/nestjs-enterprise

# [0.72.0](https://github.com/rnw-community/rnw-community/compare/v0.71.0...v0.72.0) (2024-06-12)

**Note:** Version bump only for package @rnw-community/nestjs-enterprise

# [0.71.0](https://github.com/rnw-community/rnw-community/compare/v0.70.3...v0.71.0) (2024-06-11)

### Features

- updated react-native-payments-example to the latest RN 0.74 ([#198](https://github.com/rnw-community/rnw-community/issues/198)) ([49dff8e](https://github.com/rnw-community/rnw-community/commit/49dff8e59877bd316e5401816063ee4f049fb472))

## [0.70.3](https://github.com/rnw-community/rnw-community/compare/v0.70.2...v0.70.3) (2024-06-05)

**Note:** Version bump only for package @rnw-community/nestjs-enterprise

## [0.70.2](https://github.com/rnw-community/rnw-community/compare/v0.70.1...v0.70.2) (2024-06-05)

### Bug Fixes

- **nestjs-enterprise:** fixed handling observables and promises ([#195](https://github.com/rnw-community/rnw-community/issues/195)) ([3809d08](https://github.com/rnw-community/rnw-community/commit/3809d0823039ae3ee1a378bac8c73bcdba7e0f07))

## [0.70.1](https://github.com/rnw-community/rnw-community/compare/v0.70.0...v0.70.1) (2024-06-05)

**Note:** Version bump only for package @rnw-community/nestjs-enterprise

# [0.70.0](https://github.com/rnw-community/rnw-community/compare/v0.69.1...v0.70.0) (2024-06-04)

### Features

- **nestjs-enterprise:** added HistogramMetric decorator ([#193](https://github.com/rnw-community/rnw-community/issues/193)) ([7d63971](https://github.com/rnw-community/rnw-community/commit/7d63971283cfed9ac845882dbafc2ebabfcd9205))

# [0.69.0](https://github.com/rnw-community/rnw-community/compare/v0.68.0...v0.69.0) (2024-06-03)

### Features

- **nestjs-enterprise:** added Log decorator ([#190](https://github.com/rnw-community/rnw-community/issues/190)) ([969ba0a](https://github.com/rnw-community/rnw-community/commit/969ba0a485aa9a7bb2a892ce21da8b16e51be005))
