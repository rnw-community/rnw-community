# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.0.2](https://github.com/rnw-community/rnw-community/compare/v2.0.0...v2.0.2) (2026-04-24)

### Bug Fixes

- **decorators-core:** use absolute URLs for readme cross-links ([69c17ae](https://github.com/rnw-community/rnw-community/commit/69c17ae495a69fe38c9149e5bff620ccf9a67cf3))

# [2.0.0](https://github.com/rnw-community/rnw-community/compare/v1.14.1...v2.0.0) (2026-04-24)

### Bug Fixes

- address PR bot comments and lint compliance across touched packages ([1e44c79](https://github.com/rnw-community/rnw-community/commit/1e44c79e0c810b487e74ac6435b974f2f4f34f43))
- **decorators-core:** drop redundant ResourceInterface type argument in specs ([01b692b](https://github.com/rnw-community/rnw-community/commit/01b692bfdce563a2971a9752e7577d9383eedc9b))
- **decorators-core:** prevent onError double-fire under promise shell + resource ([74dd7c0](https://github.com/rnw-community/rnw-community/commit/74dd7c0f0a4333a60097bc3b559add3801de99be))
- **lint:** resolve all ESLint errors surfaced on CI across the 5 touched packages ([10b47ac](https://github.com/rnw-community/rnw-community/commit/10b47acc0e54668529479a2469aa39863278e56f))
- P0/P1 bugs surfaced during deep code review ([30f55cf](https://github.com/rnw-community/rnw-community/commit/30f55cf79e039a7341626dbc8724dcf32b68b03a))

- refactor(decorators-core)!: collapse middlewares array to single middleware ([3a221ab](https://github.com/rnw-community/rnw-community/commit/3a221ab443ab8782b82b142068af971fe814c34f))
- refactor(decorators-core)!: InterceptorMiddleware is a function type, not a 1-method interface ([5a47a65](https://github.com/rnw-community/rnw-community/commit/5a47a65bf786e7aceea66eedf3812019b9c08082))
- refactor(decorators-core)!: move GetResultType into log-decorator ([8e8a70d](https://github.com/rnw-community/rnw-community/commit/8e8a70d1609c26ba36e2f74451f1e8e972876c6e))
- feat(decorators-core)!: rxjs strategies moved to /rxjs subpath ([19bc9e0](https://github.com/rnw-community/rnw-community/commit/19bc9e0e7e626e332c4a232d3d46a696d2bfcb86))
- feat(decorators-core)!: honest rxjs peer via /rxjs subpath split ([aa5bde1](https://github.com/rnw-community/rnw-community/commit/aa5bde1b1998da64895493f99bc726280728a781))

### Features

- **decorators-core:** enforce strategy sync-throw contract ([2548a5b](https://github.com/rnw-community/rnw-community/commit/2548a5bb8431adf6707b5b8f0c7e58d8f3d77e63))
- **decorators-core:** resource interfaces + promise/observable engine factories ([b42f64a](https://github.com/rnw-community/rnw-community/commit/b42f64af82555811bd6bb37d08b56eb4563fcfa5))
- **decorators:** automatic type narrowing from decorated method signatures ([67eb662](https://github.com/rnw-community/rnw-community/commit/67eb66270d5fc705d8c431ae3cd3b15f8898e712))
- **decorators:** extract universal decorator suite from nestjs-enterprise ([#350](https://github.com/rnw-community/rnw-community/issues/350)) ([af5ab31](https://github.com/rnw-community/rnw-community/commit/af5ab31f30cf021db3640168a88054c2aecb45e5))
- **decorators:** unified HistogramMetric + Log proof-of-unification ([f6a38a6](https://github.com/rnw-community/rnw-community/commit/f6a38a667bd664ce737f4019195b3b0f67fd86ae))

### Reverts

- Revert "feat(decorators-core)!: honest rxjs peer via /rxjs subpath split" ([d199d34](https://github.com/rnw-community/rnw-community/commit/d199d34cf9ce3eb6a4ef5a5e51aaf925ebf07cbb))

### BREAKING CHANGES

- CreateInterceptorOptionsInterface now takes a
  single 'middleware' field instead of a 'middlewares' array.
  Consumers upgrading pass middleware: mw instead of middlewares: [mw].

Every in-tree consumer passed exactly one middleware. The
array+reduceRight-compose primitive was multi-middleware ceremony
for a case that never occurs — decorators compose by stacking at
the @decorator call site, not by packing the internal array. The
array-based multi-middleware spec case documented a feature no
consumer used; it is removed along with the compose primitive.

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

- GetResultType is no longer exported from
  @rnw-community/decorators-core. Consumers that need it can either
  define a one-line type alias locally or, if using log-decorator,
  it remains an internal implementation detail — not part of the
  log-decorator public surface either.

The type existed in decorators-core only to re-unwrap Promise<T>
and Observable<T>, which pulled rxjs into the root barrel and
undermined the 'honest rxjs peer via /rxjs subpath' split. With
exactly one consumer (log-decorator's factory), the type now lives
next to its use.

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
