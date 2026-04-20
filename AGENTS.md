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

### Decorator factories — legacy decorators only

This codebase ships method decorators built on TypeScript's `experimentalDecorators` mode (legacy decorator semantics). TC39 stage-3 decorators are NOT supported. The decision is driven by test-runtime ergonomics: the project's Jest+Babel pipeline uses `@babel/plugin-proposal-decorators` with `{ legacy: true }`, which silently no-ops stage-3 decorators when applied via `@` syntax. Consumers must enable `experimentalDecorators: true` in their tsconfig. Every decorator factory exposes a single `createLegacy*` entry point.

### Decorator factories — automatic type inference

Every decorator factory in this codebase MUST let TypeScript infer callback parameter types from the decorated method's signature. Consumers must NOT have to spell out generics like `@Log<readonly unknown[], number>(...)` to get a typed `arg`. Factory call shapes use spread form: callbacks like `preLog`, `postLog`, `errorLog`, `catchErrorFn`, lock key-fns, and histogram `labels` accept `(...args: TArgs) => ...` so a real-world call like `@Log((id, qty) => …)` resolves `id` and `qty` to the actual method arg types. The factory's generic shape is `<TArgs extends readonly unknown[], TResult>` where `TArgs` and `TResult` derive from the decorated method's `Parameters` and `ReturnType`. Legacy `experimentalDecorators` decorators have a known TypeScript limitation here — when full inference is impossible without consumer-side generics, prefer the spread-form callback shape and document the limitation in the package's readme rather than papering over it with array-form callbacks.

### Guards from `@rnw-community/shared` (use them)

Use these guards instead of inline checks — they narrow types, compose cleanly, and read like intent:

- `isDefined(v)` instead of `v !== null && v !== undefined`
- `isPromise(v)` instead of `v instanceof Promise` (also catches thenables and cross-realm promises)
- `isNotEmptyArray(v)` / `isEmptyArray(v)` / `isArray(v)`
- `isNotEmptyString(v)` / `isEmptyString(v)` / `isString(v)`
- `isNumber(v)` / `isPositiveNumber(v)`
- `isBoolean(v)` / `isError(v)`

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
