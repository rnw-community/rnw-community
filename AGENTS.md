# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## AI Model Requirements

**ALWAYS use the latest and most capable model available.** As of now, that is **Claude Opus 4.7** (`claude-opus-4-7`). Never use older or less capable models for this codebase — the strict type system, high coverage thresholds, and complex decorator patterns require top-tier reasoning.

## Project Overview

TypeScript monorepo with 22 packages providing NestJS, React, React Native, and React Native Web utilities. Uses Yarn Workspaces (v4), Turbo for task orchestration, and Lerna for publishing.

## Common Commands

```bash
# Root-level (runs across all packages via Turbo)
yarn build              # Build all packages (dual ESM + CJS output to dist/)
yarn ts                 # Type check all packages
yarn lint               # ESLint all packages
yarn lint:fix           # Auto-fix lint issues
yarn test               # Run all tests
yarn test:coverage      # Run tests with coverage
yarn format             # Prettier format all
yarn cpd                # Copy-paste detection
yarn deadcode           # Find unused code (knip)

# Single package (cd into package first)
cd packages/shared
yarn test               # Run tests for this package only
yarn test --watch       # Watch mode
yarn test:coverage      # Tests with coverage
yarn build              # Build this package only
yarn ts                 # Type check this package only
yarn lint:fix           # Fix lint issues in this package
```

## Architecture

### Package Categories

- **shared** — Core utility hub (type guards, helpers, types); many packages depend on it
- **decorators-core** — Framework-agnostic interceptor primitive for building method decorators (foundation for log/histogram/lock)
- **log-decorator, histogram-metric-decorator, lock-decorator** — Universal method decorators built on decorators-core
- **nestjs-\*** — NestJS modules (enterprise decorators, rxjs-logger, rxjs-metrics, rxjs-lock, rxjs-redis, typed-config, webpack-swc)
- **rxjs-errors** — RxJS error utilities
- **react-native-payments** — Payment Request API for Apple Pay/Google Pay
- **react-native-payments-example** — private example package: shared `src/` screens plus `apps/bare` (React Native CLI) and `apps/expo` (Expo) app targets
- **react-native-collapsible-header** — Generic slot-based Reanimated header transition with provider-based scroll wiring, snap, overlay mode, and React Compiler precompiled output
- **react-native-collapsible-header-example** — private example package: shared `src/` demo screen plus `apps/bare` and `apps/expo` app targets, carries the Maestro e2e suite and readme demo-GIF recording flow
- **platform, fast-style, redux-loadable** — React Native/Web utilities
- **object-field-tree** — Object field combination trees
- **wdio** — WebDriverIO page objects and commands
- **eslint-plugin** — Custom ESLint plugin

### Build Output

All packages publish dual format via `exports` field:

- `dist/esm/` — ES Modules (ES2021)
- `dist/cjs/` — CommonJS (ES2021)
- Type declarations at `dist/esm/index.d.ts`

## Code Style & Conventions

### File Organization (strict: one exported entity per file; folder only to group related siblings)

**One exported entity per file.** Every file exports exactly one public entity. A file that exports two types, an interface + a constant, or multiple helpers MUST be split. Barrel files (`index.ts`) are allowed and re-export only; they are not "multi-export files" in the semantic sense.

**Folder only when there is more than one sibling file for the same entity.** Put source + spec (+ optional `.md`) together in a named folder when grouping makes sense; a single lone file does NOT need its own folder.

When an entity has a `.spec.ts` and/or a focused `.md`, use the folder layout:

```
src/<category>/<entity-name>/<entity-name>.<suffix>.ts
src/<category>/<entity-name>/<entity-name>.spec.ts
src/<category>/<entity-name>/<entity-name>.md         (optional — short, one example)
```

When an entity has **only** a source file (no spec, no `.md`) — e.g., many `.interface.ts` / `.type.ts` / constant files — place it flat at the category level, **without** a surrounding one-file folder:

```
src/interface/execution-context.interface.ts          (good — single file, no folder needed)
src/type/pre-decorator-function.type.ts               (good)
src/interface/execution-context-interface/            (BAD — folder with a single `.interface.ts` inside)
    execution-context.interface.ts
```

Create folders only to group siblings that share an entity (source + spec + md). Never create a folder that wraps a single file with nothing to group it with.

Suffix patterns:

- `.type.ts` for `export type` entities
- `.interface.ts` for `export interface` entities
- `.assert.ts` for runtime validation functions under `src/assert/`
- `.config.ts` for configuration values and resolvers under `src/config/`
- `.hook.ts` for React hooks under `src/hooks/`
- `.context.ts` for React contexts under `src/context/`
- `.ts` for values (functions, constants, classes)
- `.decorator.ts` / `.util.ts` for kind-specific clarity (legacy packages)

### Comments policy — prefer zero comments

**Do NOT write code comments.** Replace explanatory commentary with:

- **Descriptive names** — rename the variable / function / type until the name reveals intent
- **Composition** — extract a small helper with a good name instead of writing a block comment
- **`readme.md`** at the package root — documents what each public export does, with one minimal usage example per entity
- **Per-entity `<entity>.md`** (optional) — a 5–20 line file next to the source with a focused example

Allowed pragma comments only (the scoped public-API TSDoc below is the single other exception):

- `// eslint-disable-next-line <rule>` — suppressing a specific lint rule with good reason
- `/* istanbul ignore <next|else|if> -- <why> */` — **last resort** for truly unreachable branches; PREFER restructuring code to eliminate the dead branch entirely

**Scoped TSDoc on the public API — the one sanctioned documentation comment.** Every EXPORTED public API declaration
(class, method, interface, type, function reachable from a package's `index.ts`) carries a TSDoc block of exactly this
shape, and nothing else may:

- one sentence: what it is and when to reach for it (mirrors the entity doc's "why" line)
- `@see` links only: the entity's canonical doc target and the governing spec (W3C / Apple / Google) where one exists.
  The canonical doc target is resolved in this order: the package's `docs/api/<entity>.md` (once a docs tree exists) →
  the colocated `<entity>.md` → the package `readme.md` section anchor for that export. Every public export always has
  at least the readme anchor, so the rule is always satisfiable.

**Members of exported interfaces** may additionally carry a one-sentence TSDoc line, plus `@defaultValue` when the
consuming code applies a default for an omitted member. Readme tables never reach IDE hovers or published `.d.ts`
readers — the member one-liner is the only documentation surface that does. Same limits as entity-level TSDoc: one
sentence, no `@example`, no prose paragraphs.

Still forbidden everywhere, including on public API: `@example` (examples live in the docs), narrative/multi-paragraph
blocks, `@param`/`@returns` prose that restates the types, TSDoc on non-exported or private declarations, and all other
inline comments per the rules above. Rationale: consumers' IDEs and AI agents read the published `.d.ts` — the
one-liner + `@see` gives them the entry point without duplicating the docs. Enforced by lint (required on exports,
banned elsewhere) once the public surface is annotated.

No JSDoc usage examples in source. Examples live in the docs tree and per-entity `.md` files.

### Decorator factories — `experimentalDecorators` only

This codebase ships method decorators built on TypeScript's `experimentalDecorators` mode. TC39 stage-3 decorators are NOT supported. The decision is driven by test-runtime ergonomics: the project's Jest+Babel pipeline uses `@babel/plugin-proposal-decorators` with `{ legacy: true }`, which silently no-ops stage-3 decorators when applied via `@` syntax. Consumers must enable `experimentalDecorators: true` in their tsconfig. Decorator factories carry NO `createLegacy*` / `Legacy*` prefix — the `experimentalDecorators` runtime is a package-wide invariant, not a per-factory variant.

### Decorator application — no paren wrapping

Apply decorator factories with plain `@Name(...)`, never `@(Name(...))`. Wrapping in parens is not idiomatic and usually only needed to disambiguate factory-level generic type arguments (`@Log<[string]>(...)`). Since factories in this codebase are designed for inference from annotated callback params (see "Automatic type narrowing" below), explicit factory generics are not required and `@(...)` wrapping must not appear in source or tests.

### Automatic type narrowing — core feature

Every decorator factory in this codebase MUST let TypeScript infer callback parameter types from either the decorated method's signature or from the annotated callback params themselves. Consumers must NOT be forced to spell out factory generics like `@Log<[string, number], string>(...)` just to get typed `productId` / `qty`. Factory call shapes vary by package — documented in each package's readme:

- **Log / HistogramMetric / `nestjs-enterprise`'s `PreDecoratorFunction`**: spread form — `(...args: TArgs) => ...`. Preferred when TS needs to infer TArgs from the callback's own annotated params.
- **Lock factories (`createSequentialLockDecorator`, `createExclusiveLockDecorator`)**: array form — `(args: TArgs) => ...`. Callers access params via `args[0]` or destructure (`([id]) => ...`).
- **Histogram `labels`**: array form — `(args: TArgs) => ...`. Both destructure and indexed access work.

The spread-form example below uses `Log` as the representative:

```ts
@Log(
    (productId: string, qty: number) => `placing order ${productId} qty=${qty}`,
    (receiptId: string, productId: string, qty: number) => `placed ${productId} -> ${receiptId}`
)
async placeOrder(productId: string, qty: number): Promise<string> { ... }
```

Factory generic shape is `<TArgs extends readonly unknown[] = readonly unknown[], TResult = unknown>` with DEFAULT values so string-only hook forms (`@Log('enter')`) do not require generics. `experimentalDecorators` has a known limitation: the method's own signature cannot flow backward into the factory's generic slots. The SOTA workaround is therefore annotated callback params, NOT explicit factory generics. Tests and readmes demonstrate this pattern as the canonical shape.

### Always use `@rnw-community/shared` primitives

The `shared` package exists so the rest of the monorepo does NOT re-invent guards, no-ops, or TS utility types. Before introducing any inline check, no-op function, or ad-hoc helper, scan `shared` first — if a primitive exists there, use it. This is a hard rule, not a suggestion. New packages gain `@rnw-community/shared` as a direct dependency rather than shadowing its surface.

**Type guards — use instead of inline checks:**

- `isDefined(v)` instead of `v !== null && v !== undefined`
- `isPromise(v)` instead of `v instanceof Promise` (also catches thenables and cross-realm promises)
- `isError(v)` instead of `v instanceof Error`
- `isArray(v)` instead of `Array.isArray(v)` when the input type is unknown; keep `Array.isArray` only for function-vs-array unions where the shared guard's intersection-narrow cannot collapse the function side to `never`
- `isNotEmptyArray(v)` / `isEmptyArray(v)`
- `isString(v)` / `isNotEmptyString(v)` / `isEmptyString(v)` instead of `typeof v === 'string'` (+ optional length check)
- `isNumber(v)` / `isPositiveNumber(v)` instead of `typeof v === 'number'`
- `isBoolean(v)`

**Types — import from `shared`, never redefine:**

- `EmptyFn` — `(...args: any[]) => void`; use as the type for no-arg/no-return callbacks, abort-listener cleanup handlers, and placeholder slots
- `AnyFn` — generic function constraint for decorator method type parameters
- `Maybe<T>` — `T | null`
- `ClassType<T>` / `AbstractConstructor<T>` — DI/reflection constructor shapes
- `MethodDecoratorType<K>` — typed method-decorator factory result
- `IsNotEmptyArray<T>` / `ReadonlyIsNotEmptyArray<T>` — tuples asserting at least one element
- `Enum<D>` — enum-like record
- `OnEventFn<T, R>` — single-event callback

**Utilities — prefer over ad-hoc:**

- `emptyFn` — the canonical no-op. Use `.catch(emptyFn)` instead of `.catch(() => void 0)`; initialize `let cleanup: EmptyFn = emptyFn;` instead of `() => void 0`; pass `emptyFn` to any callback slot that deliberately does nothing
- `wait(ms)` — Promise-based sleep; never re-implement with `new Promise(r => setTimeout(r, ms))`
- `getErrorMessage(err, fallback?)` — type-safe `.message` extraction in catch blocks
- `getDefined(value, defaultFn)` — lazy default when `value` is nullish

If a needed primitive does NOT exist in `shared`, extend `shared` rather than creating it locally — that is where all cross-package utility surface lives.

### Never re-export types from other packages

A package MUST NOT re-export (`export type { X } from '@rnw-community/other'`) a type owned by another workspace package. Consumers import the type directly from its origin: `import type { MethodDecoratorType } from '@rnw-community/shared'`, not `from '@rnw-community/decorators-core'`. Re-exports create phantom ownership, bloat bundles with duplicate type graphs, and make refactors ambiguous ("which package owns this?"). The rule is hard: one type, one home, direct imports everywhere.

### Docs location

- `readme.md` at the package root — short summary + badges + per-export section with one usage example
- `<entity>.md` (optional) colocated next to source — 5–20 line file with focused example
- `AGENTS.md` at the package root — agent-facing architecture notes (commands, layout, patterns, dependencies, coverage)

### TypeScript — Strict mode with all strict flags enabled, decorators enabled

### Formatting (Prettier)

- Single quotes, 125 char width, 4-space indent, semicolons required, trailing commas ES5, no parens on single arrow params

### Import Order (enforced by ESLint)

Groups: builtin → external → `@rnw-community/*` → parent → sibling → index → type, alphabetized, newlines between groups

### ESLint Key Rules

- Max function lines: 85 (blank lines/comments excluded)
- Max statements per function: 12
- Max params: 4 (`@typescript-eslint/max-params`)
- Complexity limit: 25
- Enum members: UPPER_CASE or PascalCase
- Class member ordering: fields → constructor → getters → setters → methods (public → protected → private)
- JSX only in `.tsx` files, max depth 4
- Unused vars with `_` prefix are allowed (`argsIgnorePattern: ^_`)
- `expect.hasAssertions()` in every test case

### Commit Messages (Conventional Commits, enforced by commitlint + husky)

Format: `type(scope): description` — scope must be a package name (e.g., `shared`, `react-native-payments`). Header ≤100 chars.

### No AI-tool or bot attribution anywhere

**Never** mention AI tools, review bots, or any assistant by name in:

- source code (no `CODEX-fix`, `// fix per Claude`, describe blocks named after tools, etc.)
- test names / describe blocks (describe sections by behaviour, not by who requested them)
- commit messages (no `Co-Authored-By: Claude …`, no `per review bot X …`)
- PR titles / descriptions (no `addresses CODEX review`, `macroscope flagged`, etc.)
- readme / AGENTS / .md docs

Describe **what changed and why** in code-intrinsic terms. A regression fix is documented by the invariant it restores, not by the reviewer that noticed the bug.

### Testing

- Jest 29, test files colocated next to the source they cover: `src/**/<entity>/<entity>.spec.ts`
- Imports from `@jest/globals` (not global Jest)
- **Coverage threshold: 99.9%** for statements, branches, functions, and lines
- Mock files matching `*.mock.ts` are excluded from coverage (`coveragePathIgnorePatterns`) — legacy `wdio` scaffolding only; see the next subsection
- Test the BEHAVIOR, not the comments — behavior is self-documenting when a comment would otherwise be needed

### Test-only code lives inside the spec that needs it — never as a separate file in `src/`

**Do NOT create helpers, fixtures, factories, or any code whose sole consumers are test files** (e.g. `foo.mock.ts` used only by `foo.spec.ts` and `bar.spec.ts`). Inline the fixture directly inside the spec file(s) that use it, even at the cost of duplication across specs.

Rationale:

- A file in `src/` that only specs import still reads as part of the package to reviewers, IDE code-navigation, and anyone browsing the tree. It inflates the perceived public surface even when the build tsconfig excludes it.
- Readers of a spec then have to jump across files to understand what the test's fixture actually does, breaking the "a test should be readable top-to-bottom in one file" property.
- Any documentation written around the fixture (readme, per-entity `.md`, AGENTS layout tree) becomes a source of stale or misleading claims about the package API.
- Deletion or refactoring of the fixture requires coordinated edits across multiple folders rather than a single spec.

**Also:** test-only code must NEVER be exported from the package's `index.ts`, linked from `readme.md`, or described in per-entity `.md` files. If you find yourself documenting it, that is the signal to inline it.

**Exception:** the pre-existing `packages/wdio/src/**/*.mock.ts` scaffolding predates this rule and forms a large, tightly cross-referenced web of fixtures; leave it alone unless a dedicated refactor is in scope. New packages and packages already restructured to this rule must follow it.

## Planning Convention

Always write plans to `.plans/` as `.md` files before executing multi-step changes. Plans are gitignored and serve as working documents for complex tasks.

## ESM Modernization Status

The monorepo uses dual ESM + CJS output. Key decisions:

- `sideEffects: false` (boolean) in all package.json files
- `"types"` condition is **first** within each conditional `exports` block (required for `moduleResolution: "nodenext"`
  consumers). Every dual-format package nests `types` under `import`/`require` rather than sharing one top-level
  `types` key — a single shared `types` key resolves the wrong module kind for one of the two conditions (confirmed by
  `@arethetypeswrong/cli`); splitting it keeps `types` first inside each condition while giving each format its own
  accurate declaration file (`dist/esm/index.d.ts` for `import`, `dist/cjs/index.d.ts` for `require`)
- `dist/esm/package.json` (`{"type":"module"}`) and `dist/cjs/package.json` (`{"type":"commonjs"}`) are written by the
  `build` script of every dual-format package so Node's own module-kind detection matches each directory's real output
  instead of falling through to the CJS default for the ESM build. `eslint-plugin` is the one exception — see below
- `moduleResolution: "bundler"` in the root type-check tsconfig (matches Metro's actual runtime resolution, so
  `yarn ts` validates against the same leniency real consumers get); `"esnext"`/inherited `"bundler"` in the ESM build
  tsconfig (source stays extensionless — see the invariant below); `"node"` in the CJS build tsconfig
- `verbatimModuleSyntax: true` enforces explicit `import type` for type-only imports
- `lib: ["es2021"]` matches the build target
- Build scripts correctly reference their tsconfig files (`build:esm` → `tsconfig.build-esm.json`)
- **`node10` module resolution is not a supported target.** `yarn publint`'s `attw` step runs with `--profile node16`,
  which scopes checks to `node16`/`nodenext` (both `require` and `import`) and `bundler` — the resolution modes real
  consumers use (Metro included). Packages declare their actual supported Node floor via `engines.node` instead of
  chasing the legacy pre-`exports` resolution algorithm
- **Invariant: zero extensionless relative specifiers in any published output — enforced on the emitted artifact, not
  in source.** Source stays exactly as it reads: `import { x } from './x'`, no `.js`, no `/index.js`. `tsc` compiles
  `tsconfig.build-esm.json` with plain `"module": "esnext"` (inheriting the root's `moduleResolution: "bundler"`), the
  same lenient resolution `yarn ts` already validates against, so nothing in the compiler forces an extension. Instead,
  every dual-format package's `build` script chains two scripts against the freshly compiled `dist/esm` directory,
  right after `build:esm`/`build:cjs` and before the `dist/*/package.json` markers are written:
    - `scripts/rewrite-esm-extensions.mjs ./dist/esm` walks every emitted `.js` and `.d.ts` file and appends `.js` (or
      `/index.js` for a directory/barrel specifier) to each relative `import`/`export … from`/dynamic `import()`
      specifier, resolved against the real sibling files on disk (`<spec>.js`/`<spec>.d.ts` for a file, `<spec>/index.js`/
      `<spec>/index.d.ts` for a directory) — it rewrites declaration files too, because a consumer's own `node16`/`nodenext`
      type-check walks the published `.d.ts` graph exactly like Node's runtime resolver walks the `.js` graph, and an
      extensionless specifier there is just as fatal (`TS2835`) as one in the `.js` output is at runtime (`ERR_MODULE_NOT_FOUND`,
      `#531`'s original defect). `require(...)` calls (e.g. `react-native-payments`'s TurboModule registration require in
      `native-payments.ts`) are never touched — only `ImportDeclaration`/`ExportNamedDeclaration`/`ExportAllDeclaration`/
      `ImportExpression` forms, matching the ESLint selector below — nor are bare/scoped package specifiers, since the
      regex only matches specifiers starting with `./` or `../`.
    - `scripts/assert-esm-extensions.mjs ./dist/esm` independently re-scans the same tree afterward and fails the build
      (non-zero exit) if any relative specifier is still extensionless. This is the actual enforcement point — not the
      compiler, not "the rewrite script ran without crashing." Disabling the rewrite step or hand-breaking one emitted
      specifier reproduces the exact class of defect `#531` reported, and `yarn build` fails loudly instead of shipping
      it (verified: see the PR body for a real "broke one specifier, assertion caught it" run).
      Both scripts share the specifier-matching/extension-classification logic in `scripts/esm-relative-specifier.mjs` so
      the two definitions of "what counts as a relative specifier" and "what counts as already-extensioned" can't drift
      apart. `tsconfig.build-cjs.json` keeps `"module": "commonjs"` / `"moduleResolution": "node"` untouched — classic
      Node resolution has always tolerated an extensionless specifier (it already maps `./x` back to the sibling source),
      so the CJS build was never affected by `#531` and needs no rewrite step.
      `"type": "module"` is **not** set on any dual-format package's root `package.json` — it was only ever load-bearing
      for the compiler-enforcement approach (making `tsc`'s `nodenext` mode see `src/*.ts` as genuine ESM-format so its
      extension mandate activated). With the compiler out of the loop, nothing reads the package root's `"type"` field to
      decide the ESM build's format: `dist/esm/package.json` (`{"type":"module"}`) and `dist/cjs/package.json`
      (`{"type":"commonjs"}`), written by the same `build` script as always, are what Node's real module-kind detection
      actually consults for the published artifact, and those are unconditional regardless of the package root's own
      `"type"` field. Evidence: `packages/shared/package.json` never carried a `"type"` field even before `#531` was
      found, and the CJS side of that same package worked correctly the whole time — the defect was always specifically
      about missing extensions, never about missing format declarations. Removing `"type": "module"` also means the two
      Babel/Jest config loaders at each package root never needed the `babel.config.cjs`/`jest.config.cjs` rename in the
      first place — they're `babel.config.js`/`jest.config.js` again, `module.exports`-based, exactly as before, and the
      handful of packages whose config delegates to `shared`'s via `require('../shared/babel.config')` (no extension —
      classic `require()` probes it) are back to that form too.
      `no-restricted-syntax` selectors in `eslint.config.mjs` now flag the _opposite_ shape: any relative
      `Import`/`Export`/dynamic-`import()` specifier that **does** carry a `.js`/`.jsx`/`.mjs`/`.cjs` extension is a lint
      error (`.json` stays allowed — `resolveJsonModule` imports like `eslint-plugin`'s `../package.json` need it). This
      isn't just style: without a `moduleNameMapper` (see next), a stray `.js` in source would make Jest fail to resolve
      the specifier outright, since Jest resolves relative imports straight against the real `.ts` files on disk. Plain
      `import/extensions` from `eslint-plugin-import` remains unsuitable for the same reason it was rejected under the old
      approach — it keys off the _resolved_ file's real extension, not the declared one.
      `get-jest.config.js`'s `moduleNameMapper` (`^(\.{1,2}/.*)\.js$` → `$1`, added to strip the `.js` the old approach put
      in source before Jest tried to resolve it) is **removed** — there's nothing left to strip. Jest runs directly
      against `src/*.ts` via `babel-jest` and resolves the bare `./x` specifier straight to `x.ts` the same way it always
      could before `#532`; the mapper existed purely to paper over the compiler-enforcement approach's own source-level
      side effect, which no longer exists.
      `scripts/publint.sh` still does not pass `--ignore-rules internal-resolution-error` to `attw` for any package — the
      rewrite+assert pair is what keeps that rule green now, in place of the compiler.
      `yarn smoke:esm` (and the `package-manager-smoke` CI job) is unchanged and still packs and imports every publishable
      package's tarball under real `node --input-type=module`/`require()`, independently re-validating the same invariant
      at the installed-package layer, on top of `assert-esm-extensions.mjs`'s per-package check right after `build`.
- **`yarn ts:nodenext`'s scope changed along with the rest of this invariant, and its original defect class
  (`#536`/`#540`, a `.spec.ts` default-importing a CJS dependency whose `.d.ts` mistypes its default export — `ioredis`'s
  `Redis`, for one) is only partially covered now.** `tsconfig.nodenext-check.json` still sets `"module"`/`"moduleResolution"`
  to `"nodenext"` directly (it can no longer inherit the mode from `tsconfig.build-esm.json`, which reverted to
  `"esnext"`), still targets `./src` including spec files, and still runs as a parallel, `noEmit: true`, non-blocking-build
  check. It additionally sets `"verbatimModuleSyntax": false`: with no `"type": "module"` on the package root, `tsc`
  resolves every `src/*.ts` file as CommonJS-format under `nodenext`, and `verbatimModuleSyntax: true` (inherited from
  the root tsconfig) makes plain `import`/`export` syntax in a CommonJS-format file a hard error (`TS1295`/`TS1287`) —
  unrelated to extensions, unrelated to `#536`, and it would fail on every single spec file. Turning it off for this
  check-only config restores the ability to type-check ordinary `import`/`export` syntax under `nodenext` resolution.
  The trade-off: `#536`'s specific failure mode (`TS2709`/`TS2351` from `nodenext`'s CJS-interop rules) only fires when
  the _importing_ file is itself resolved as genuine ESM-format, which required the now-removed `"type": "module"` —
  confirmed by deliberately reintroducing the broken `import Redis from 'ioredis'` form into a spec file and rerunning
  `yarn ts:nodenext` with the current (`"type"`-less) configuration: it passes, silently. Making the check itself
  ESM-format again (either via `"type": "module"` on the package root, which reopens the extension mandate this whole
  section exists to avoid, or via a nested `src/package.json` override, which reopens it identically since format
  detection and the extension mandate are the same `nodenext` mechanism) was evaluated and rejected for exactly that
  reason. Pointing the check at the _compiled_ `dist/esm/**/*.d.ts` instead (which does sit under a real
  `{"type":"module"}` via `dist/esm/package.json`, and empirically does reproduce `TS2709` for a broken import that
  reaches the public declaration surface) was also evaluated and rejected: it requires `skipLibCheck: false` to type-check
  `.d.ts` files at all, which surfaces dozens of unrelated pre-existing conflicts in third-party `.d.ts` files
  (`react-native`'s bundled DOM globals vs. `lib.dom.d.ts`, `@expo/config-plugins`, `@types/node`) on every heavier
  package — a materially larger, noisier undertaking than this adaptation warrants, and it still would not cover specs
  at all (they're excluded from every build). `yarn ts:nodenext` therefore still catches ordinary `nodenext`-resolution
  defects (wrong `exports`-map subpath, a resolution failure `bundler` mode would silently paper over) but not this one
  specific CJS-default-import shape inside a spec file. The residual risk is bounded: specs never ship, so a regression
  of this exact shape has zero runtime blast radius on any consumer, and production code's already-correct import form
  is what the packed-tarball consumer `tsc` check (`node16` and `bundler`, run per release — see the PR verification
  output) actually exercises end to end.
- **`eslint-plugin` ships CommonJS only, by design, not oversight.** Its `src/index.ts` ends in `export = plugin` —
  the shape ESLint's own legacy plugin loader (`@eslint/eslintrc`, string-based `"plugins": ["@rnw-community"]`
  resolution) requires: it `require()`s the module and uses the returned value directly, with no `.default` unwrap.
  Switching to `export default plugin` would satisfy a "real" ESM build but silently break every consumer still on
  legacy `.eslintrc` config. Because `export =` cannot be re-emitted as genuine ESM syntax, the package's own
  `tsconfig.build-esm.json` targets `NodeNext` against a `type`-less source tree so `tsc` compiles it as CommonJS
  even under `dist/esm/` — both dist trees are byte-equivalent CJS. The package.json reflects this honestly instead of
  papering over it: root-level `"type": "commonjs"` (not per-directory markers, since neither directory is ESM), no
  `"module"` field (there is no real ESM entry to advertise to bundlers), and `yarn publint`'s `attw` invocation for
  this package alone adds `--ignore-rules named-exports` — `attw`'s "TypeScript allows ESM named imports that will
  crash at runtime" finding is exactly the CJS-via-`import`-statement default-interop pattern this package's own
  readme documents as its supported usage (`import rnwcPlugin from '@rnw-community/eslint-plugin'`), never named
  imports of individual properties
- **`tsc`'s `resolveJsonModule` copies imported `.json` files into `dist/`, including nested `package.json` copies
  with a self-referential (and Node-ignored) `"exports"` field.** `eslint-plugin`'s `src/index.ts` imports
  `../package.json` for `meta.name`/`meta.version`; because that import falls outside `./src`, `tsc` widens its
  inferred `rootDir` to the package root and mirrors `package.json` into both `dist/esm/` and `dist/cjs/` verbatim.
  `publint` flags the duplicated, non-functional `"exports"` field. The package's `build` script now deletes both
  copies (`rm -f dist/esm/package.json dist/cjs/package.json`) after compilation — the import itself stays, since
  rewriting it to avoid the `rootDir` widening is a larger refactor than a publish-hygiene pass warrants

## PR Review & Merge Policy

**Before merging any PR, read every automated review comment on it** (every finding posted by any bot account,
whatever the current review tooling is) and run this loop for each — it is mandatory for agents, not optional:

1. **Validate** the finding against the actual code — never accept or dismiss it on wording alone.
2. **Valid** → fix it in the same PR (root cause, not suppression) and reply on the thread naming the fixing commit.
3. **Invalid** → reply on the thread with the concrete refutation (evidence: file/line, spec reference, or reproduction).
4. A finding that is neither fixed nor answered on its thread **blocks the merge** — no exceptions without explicit
   maintainer approval, and admin merges are not a bypass. Findings the bot itself marks resolved/outdated are cleared.

## Pre-commit Checks

**IMPORTANT: Always run all checks before committing and pushing:**

```bash
yarn ts && yarn lint && yarn test
```

All three must pass before creating a commit. Do not skip any of these checks.

## Pre-commit Hooks (Husky + lint-staged)

- Auto-runs ESLint fix and Prettier on staged `.ts/.tsx` files
- Sorts `package.json` files
- Validates commit message format
