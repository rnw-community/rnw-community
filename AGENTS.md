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
- **react-native-collapsible-header** — Generic slot-based Reanimated header transition driven by a caller-owned scroll value
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

Still forbidden everywhere, including on public API: `@example` (examples live in the docs), narrative/multi-paragraph
blocks, `@param`/`@returns` prose that restates the types, TSDoc on non-exported or private members, and all other
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
  `yarn ts` validates against the same leniency real consumers get); `"nodenext"` in the ESM build tsconfig; `"node"`
  in the CJS build tsconfig
- `verbatimModuleSyntax: true` enforces explicit `import type` for type-only imports
- `lib: ["es2021"]` matches the build target
- Build scripts correctly reference their tsconfig files (`build:esm` → `tsconfig.build-esm.json`)
- **`node10` module resolution is not a supported target.** `yarn publint`'s `attw` step runs with `--profile node16`,
  which scopes checks to `node16`/`nodenext` (both `require` and `import`) and `bundler` — the resolution modes real
  consumers use (Metro included). Packages declare their actual supported Node floor via `engines.node` instead of
  chasing the legacy pre-`exports` resolution algorithm
- **Invariant: zero extensionless relative specifiers in any published output.** Every relative `import`/`export …
from`/dynamic `import()` specifier in every package's `src` tree carries an explicit `.js` (or `/index.js` for a
  barrel-style directory import) extension, exactly as Node's own ESM resolver requires — `tsc` is the gate, not a
  post-build rewrite: `tsconfig.build-esm.json` sets `"module"`/`"moduleResolution"` to `"nodenext"`, and every
  dual-format package's root `package.json` carries a real `"type": "module"` so `tsc` resolves `src/*.ts` as
  genuine ESM (nodenext's extension mandate only activates for files it resolves as ESM-format; a `"type"`-less
  package is treated as CommonJS-format and silently tolerates a missing extension, which is exactly how the
  original defect went unnoticed). A missing or wrong extension is therefore a compile error, not a runtime surprise
  discovered by a consumer. `tsconfig.build-cjs.json` keeps `"module": "commonjs"` / `"moduleResolution": "node"`
  regardless — an explicit `.js` extension resolves identically under classic Node resolution (it already maps a
  `.js` specifier back to the sibling `.ts` source), so the CJS build's `require(...)` output is unaffected and
  byte-for-byte equivalent to before. Setting `"type": "module"` on the package root also reclassifies every plain
  `.js` file living there as ESM, which broke the two Babel/Jest config loaders that use `module.exports`
  (`babel.config.js`, `jest.config.js`) the moment Node tried to `require()` them — both are renamed to
  `babel.config.cjs` / `jest.config.cjs` (Jest and Babel both auto-discover the `.cjs` variant with no script
  changes), and the handful of sibling packages whose `babel.config.cjs` delegates to `shared`'s config via
  `require('../shared/babel.config.cjs')` were updated to the new extensioned filename — a bare `require()` does
  not probe `.cjs` the way it probes `.js`, so the old extensionless cross-package reference would otherwise 404.
  `eslint-plugin` keeps root-level `"type": "commonjs"` (see below) so its own `babel.config.js`/`jest.config.js`
  stay untouched, but its one `require('../shared/babel.config.cjs')` reference still needed the same rename. Every
  relative specifier in every package's `src` (`eslint-plugin` included, for consistency — harmless there since a
  CJS-format file under `moduleResolution: "nodenext"` resolves an explicit extension just as well) now carries its
  `.js` (or `/index.js`) suffix. `no-restricted-syntax` selectors in `eslint.config.mjs` flag any `Import`/`Export`
  declaration or dynamic `import()` whose relative specifier lacks one, so new code cannot regress this — plain
  `import/extensions` from `eslint-plugin-import` was evaluated and rejected: it keys its "required extension" check
  off the _resolved_ file's real extension (`.ts`), so it would demand `./foo.ts` in source, the opposite of the
  `.js`-refers-to-`.ts` convention `tsc`'s `nodenext` relies on. `get-jest.config.js` adds a `moduleNameMapper`
  (`^(\.{1,2}/.*)\.js$` → `$1`) so Jest — which runs directly against `src/*.ts` via `babel-jest`, never against the
  compiled `dist/esm` output — strips that same extension back off before resolving, since Jest's resolver (unlike
  `tsc`'s `node16`/`nodenext` mode) has no built-in `.js`-refers-to-`.ts` convention. `scripts/publint.sh` no longer
  ignores `internal-resolution-error` for any package — the class of defect that rule used to paper over (unresolved
  relative imports in the shipped ESM tree, `#531`) is now a real compile failure long before `publint` ever runs.
  `yarn smoke:esm` (and the `package-manager-smoke` CI job) packs and imports every publishable package's tarball
  under real `node --input-type=module`/`require()` to keep this from regressing at the runtime layer too
- **`yarn ts` alone does not catch every `nodenext`-only defect, because it deliberately never runs `nodenext`
  against spec files.** `yarn ts` uses `moduleResolution: "bundler"` (matches Metro's leniency, see above);
  `tsconfig.build-esm.json` is the only `nodenext`-mode compile, and every package's copy of it excludes
  `**/*.spec.*` (specs are never part of the publishable build). A default import of a CJS-only dependency whose
  `.d.ts` uses `export default X` instead of the CJS-correct `export = X` (`ioredis`'s `Redis`, for one) type-checks
  fine under `bundler` but fails under real `nodenext` (`TS2709`/`TS2351`) — and until this gate existed, that failure
  mode could recur inside a `.spec.ts` file indefinitely with zero CI signal, since Jest never type-checks
  (`babel-jest` is transpile-only) and `yarn smoke:esm` only exercises published tarballs, which never contain specs.
  Each dual-format package (plus `eslint-plugin`) now carries a sibling `tsconfig.nodenext-check.json` that extends
  the package's own `tsconfig.build-esm.json`, flips `noEmit` back to `true`, and — critically — re-declares
  `include`/`exclude` without the `**/*.spec.*` exclusion, so every spec file gets checked under the exact same
  `nodenext` resolution the ESM build uses, without ever emitting to `dist/`. This is a parallel, check-only compile
  (`yarn ts:nodenext`, wired into the `code-quality` CI job right after the existing `yarn turbo run ts --affected`
  step, which itself runs after packages are built so workspace `@rnw-community/*` deps resolve their real `dist/`
  output) — it does not touch `tsconfig.build-esm.json` itself (which must keep excluding specs) or `yarn ts`'s
  `bundler` resolution (changing that would lose the "validates against the same leniency real consumers get"
  property documented above), and it does not affect Jest's own resolution in any way (Jest never reads any of these
  tsconfig files). Runs in low single-digit seconds across all 20 packages, cold, via `turbo`'s per-package caching.
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
