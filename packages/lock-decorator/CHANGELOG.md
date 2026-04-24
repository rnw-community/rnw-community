# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.0.2](https://github.com/rnw-community/rnw-community/compare/v2.0.0...v2.0.2) (2026-04-24)

**Note:** Version bump only for package @rnw-community/lock-decorator

# [2.0.0](https://github.com/rnw-community/rnw-community/compare/v1.14.1...v2.0.0) (2026-04-24)

### Bug Fixes

- address PR bot comments and lint compliance across touched packages ([1e44c79](https://github.com/rnw-community/rnw-community/commit/1e44c79e0c810b487e74ac6435b974f2f4f34f43))
- **decorators-core:** prevent onError double-fire under promise shell + resource ([74dd7c0](https://github.com/rnw-community/rnw-community/commit/74dd7c0f0a4333a60097bc3b559add3801de99be))
- **knip:** resolve dead-code failures surfaced on CI ([53c0ded](https://github.com/rnw-community/rnw-community/commit/53c0dedaf06ecd07df11626806a2584d51bb85bc))
- **lint:** resolve all ESLint errors surfaced on CI across the 5 touched packages ([10b47ac](https://github.com/rnw-community/rnw-community/commit/10b47acc0e54668529479a2469aa39863278e56f))
- **lint:** resolve lint errors in new review-fix tests (imports, param names, max-statements, newline-before-return) ([1dfe8b8](https://github.com/rnw-community/rnw-community/commit/1dfe8b806589f45c1632f27a70c94db62778f051))
- **lock-decorator:** add missing type imports to run-with-lock-rxjs spec for strict tsc ([591062a](https://github.com/rnw-community/rnw-community/commit/591062aa4fcdbe1c4c7675b2d3ced715ee5b30f9))
- **lock-decorator:** runWithLock$ honors AbortSignal end-to-end ([4e26689](https://github.com/rnw-community/rnw-community/commit/4e2668974ef213f606a0a9f8569f6e7417fc55b2))
- **lock-decorator:** runWithLock$ no longer leaks the handle when the subscriber unsubscribes before acquire resolves ([7352c3f](https://github.com/rnw-community/rnw-community/commit/7352c3ff48cdc31ded76253c35770e39a26e744c))
- P0/P1 bugs surfaced during deep code review ([30f55cf](https://github.com/rnw-community/rnw-community/commit/30f55cf79e039a7341626dbc8724dcf32b68b03a))

- refactor(decorators-core)!: collapse middlewares array to single middleware ([3a221ab](https://github.com/rnw-community/rnw-community/commit/3a221ab443ab8782b82b142068af971fe814c34f))
- refactor(decorators-core)!: InterceptorMiddleware is a function type, not a 1-method interface ([5a47a65](https://github.com/rnw-community/rnw-community/commit/5a47a65bf786e7aceea66eedf3812019b9c08082))

### Features

- **decorators:** automatic type narrowing from decorated method signatures ([67eb662](https://github.com/rnw-community/rnw-community/commit/67eb66270d5fc705d8c431ae3cd3b15f8898e712))
- **decorators:** extract universal decorator suite from nestjs-enterprise ([#350](https://github.com/rnw-community/rnw-community/issues/350)) ([af5ab31](https://github.com/rnw-community/rnw-community/commit/af5ab31f30cf021db3640168a88054c2aecb45e5))
- **lock-decorator:** adapters + factory rewrites on unified engine ([ce8fbd9](https://github.com/rnw-community/rnw-community/commit/ce8fbd9b313ca070e7eba75e8f52dbfc8f105c17))
- **lock-decorator:** Error.cause support, timeoutMs validation, deterministic tests ([0c77b0d](https://github.com/rnw-community/rnw-community/commit/0c77b0d40dd40a0548e7920adbe5102d92da64a0))

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
