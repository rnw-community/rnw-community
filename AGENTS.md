# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## AI Model Requirements

**ALWAYS use the latest and most capable model available.** As of now, that is **Claude Opus 4.7** (`claude-opus-4-7`). Never use older or less capable models for this codebase — the strict type system, high coverage thresholds, and complex decorator patterns require top-tier reasoning.

## Project Overview

TypeScript monorepo with 23 packages providing NestJS, React, React Native, and React Native Web utilities. Uses Yarn Workspaces (v4), Turbo for task orchestration, and Lerna for publishing.

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
- **react-native-payments** — Payment Request API for Apple Pay/Google Pay (with 3 example packages)
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
- `.ts` for values (functions, constants, classes)
- `.decorator.ts` / `.util.ts` for kind-specific clarity (legacy packages)

### Comments policy — prefer zero comments

**Do NOT write code comments.** Replace explanatory commentary with:
- **Descriptive names** — rename the variable / function / type until the name reveals intent
- **Composition** — extract a small helper with a good name instead of writing a block comment
- **`readme.md`** at the package root — documents what each public export does, with one minimal usage example per entity
- **Per-entity `<entity>.md`** (optional) — a 5–20 line file next to the source with a focused example

Allowed pragma comments only (no other exceptions):
- `// eslint-disable-next-line <rule>` — suppressing a specific lint rule with good reason
- `/* istanbul ignore <next|else|if> -- <why> */` — **last resort** for truly unreachable branches; PREFER restructuring code to eliminate the dead branch entirely

No JSDoc usage examples in source. No `@example`, no `@see`. Examples live in `readme.md` and per-entity `.md` files.

### Decorator factories — `experimentalDecorators` only

This codebase ships method decorators built on TypeScript's `experimentalDecorators` mode. TC39 stage-3 decorators are NOT supported. The decision is driven by test-runtime ergonomics: the project's Jest+Babel pipeline uses `@babel/plugin-proposal-decorators` with `{ legacy: true }`, which silently no-ops stage-3 decorators when applied via `@` syntax. Consumers must enable `experimentalDecorators: true` in their tsconfig. Decorator factories carry NO `createLegacy*` / `Legacy*` prefix — the `experimentalDecorators` runtime is a package-wide invariant, not a per-factory variant.

### Decorator application — no paren wrapping

Apply decorator factories with plain `@Name(...)`, never `@(Name(...))`. Wrapping in parens is not idiomatic and usually only needed to disambiguate factory-level generic type arguments (`@Log<[string]>(...)`). Since factories in this codebase are designed for inference from annotated callback params (see "Automatic type narrowing" below), explicit factory generics are not required and `@(...)` wrapping must not appear in source or tests.

### Automatic type narrowing — core feature

Every decorator factory in this codebase MUST let TypeScript infer callback parameter types from either the decorated method's signature or from the annotated callback params themselves. Consumers must NOT be forced to spell out factory generics like `@Log<[string, number], string>(...)` just to get typed `productId` / `qty`. Factory call shapes use spread form: callbacks like `preLog`, `postLog`, `errorLog`, `catchErrorFn`, lock key-fns, and histogram `labels` accept `(...args: TArgs) => ...` so TypeScript can infer `TArgs` from the callback's annotated params:

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
- Mock files (`*.mock.ts`) excluded from coverage
- Test the BEHAVIOR, not the comments — behavior is self-documenting when a comment would otherwise be needed

## Planning Convention

Always write plans to `.plans/` as `.md` files before executing multi-step changes. Plans are gitignored and serve as working documents for complex tasks.

## ESM Modernization Status

The monorepo uses dual ESM + CJS output. Key decisions:
- `sideEffects: false` (boolean) in all package.json files
- `"types"` condition is **first** in all `exports` entries (required for `moduleResolution: "nodenext"` consumers)
- `moduleResolution: "bundler"` in root tsconfig, `"node"` override in CJS build tsconfig
- `verbatimModuleSyntax: true` enforces explicit `import type` for type-only imports
- `lib: ["es2021"]` matches the build target
- Build scripts correctly reference their tsconfig files (`build:esm` → `tsconfig.build-esm.json`)

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
