# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## AI Model Requirements

**ALWAYS use the latest and most capable model available.** As of now, that is **Claude Opus 4.7** (`claude-opus-4-7`). Never use older or less capable models for this codebase — the strict type system, high coverage thresholds, and complex decorator patterns require top-tier reasoning.

## Project Overview

TypeScript monorepo with 22 packages providing NestJS, React, React Native, and React Native Web utilities. Uses pnpm workspaces (pnpm v11), Turbo for task orchestration, and Lerna for publishing.

## Common Commands

```bash
# Root-level (runs across all packages via Turbo)
pnpm build              # Build all packages (dual ESM + CJS output to dist/)
pnpm ts                 # Type check all packages
pnpm lint               # per-package type-aware oxlint and ESLint
pnpm lint:fast          # syntax-only oxlint (no type information)
pnpm lint:oxlint        # oxlint syntax and type-aware rules
pnpm lint:fix           # Auto-fix lint issues in every package (oxlint, then ESLint)
pnpm lint:oxlint:generate # Regenerate .oxlintrc.json after editing eslint.config.mjs
pnpm test               # Run all tests
pnpm test:coverage      # Run tests with coverage
pnpm format             # Prettier format all
pnpm cpd                # Copy-paste detection
pnpm deadcode           # Find unused code (knip)
pnpm assert:pack        # Pack-content gate: llms.txt shipped, no specs/build junk, entry targets present (needs build)
pnpm assert:docs        # Root llms.txt/README/AGENTS/CONTRIBUTING/RELEASE/SECURITY: relative links and #anchors resolve

# Single package (cd into package first)
cd packages/shared
pnpm test               # Run tests for this package only
pnpm test --watch       # Watch mode
pnpm test:coverage      # Tests with coverage
pnpm build              # Build this package only
pnpm ts                 # Type check this package only
pnpm lint:fix           # Fix lint issues in this package (type-aware oxlint, then ESLint)
```

## Architecture

### Package Categories

- **shared** — Core utility hub (type guards, helpers, types); many packages depend on it
- **decorators-core** — Framework-agnostic interceptor primitive for building method decorators (foundation for log/histogram/lock)
- **log-decorator, histogram-metric-decorator, lock-decorator** — Universal method decorators built on decorators-core
- **nestjs-\*** — NestJS 11/12 modules (enterprise decorators, rxjs-logger, rxjs-metrics, rxjs-lock, rxjs-redis, typed-config, webpack-swc)
- **rxjs-errors** — RxJS error utilities
- **react-native-payments** — Payment Request API for Apple Pay/Google Pay
- **react-native-payments-example** — private example package: shared `src/` screens plus `apps/bare` (React Native CLI) and `apps/expo` (Expo) app targets
- **react-native-payments-docs** — private VitePress site rendering `react-native-payments`' `readme.md` and `docs/` tree verbatim, deployed to GitHub Pages by `.github/workflows/docs.yml`
- **react-native-collapsible-header** — Generic slot-based Reanimated header transition with provider-based scroll wiring, snap, overlay mode, and React Compiler precompiled output
- **react-native-collapsible-header-example** — private example package: shared `src/` demo screen plus `apps/bare` and `apps/expo` app targets, carries the Maestro e2e suite and readme demo-GIF recording flow
- **react-native-screen-chrome** — Safe-area screen structure, progressive edge fades, and compound collapsible chrome
- **react-native-screen-chrome-example** — private example package: `apps/bare` and `apps/expo` app targets plus a Maestro e2e suite
- **platform, fast-style, redux-loadable** — React Native/Web utilities
- **object-field-tree** — Object field combination trees
- **wdio** — WebDriverIO page objects and commands
- **eslint-plugin** — Custom ESLint plugin

### Build Output

All packages publish dual format via `exports` field:

- `dist/esm/` — ES Modules (ES2021)
- `dist/cjs/` — CommonJS (ES2021)
- Type declarations at `dist/esm/index.d.ts`

## How an agent works in this repo

This list links to the sections that define each rule instead of repeating them.

1. **Orient.** The root [`llms.txt`](llms.txt) links to every package's `llms.txt`, `readme.md` and `AGENTS.md`. Read
   the target package's `AGENTS.md` before you edit it.
2. **Plan.** Write a plan in `.plans/` before any multi-step change (see [Planning Convention](#planning-convention)).
3. **Branch from an up-to-date master.** Run `git fetch origin && git switch -c <type>/<topic> origin/master`. Never
   commit directly to `master`.
4. **Reuse before writing.** Look in [`@rnw-community/shared`](#always-use-rnw-communityshared-primitives) for guards,
   types and helpers first. Follow the file organization, comment and test-only-code rules in
   [Code Style & Conventions](#code-style--conventions).
5. **Run the checks that apply to your change:**
    - for every change: `pnpm ts && pnpm lint && pnpm test` ([Pre-commit Checks](#pre-commit-checks))
    - if you changed `package.json`, `exports`, build config or dependencies, also run
      `pnpm build && pnpm publint && pnpm ts:nodenext && pnpm smoke:esm`
    - if you changed headings in a package's `readme.md` or its `llms.txt`: `pnpm build && pnpm assert:pack <package-dir>`
    - if you changed a root doc (`README.md`, `llms.txt`, `AGENTS.md`, …): `pnpm assert:docs`
6. **Commit and open the PR.** Use Conventional Commits. The scope is the package directory name, or `deps`/`deps-dev`
   for dependency bumps; changes that only touch the repository root can leave the scope out. The PR title becomes the
   squash commit, and that commit decides the release version bump ([RELEASE.md](RELEASE.md)). Fill in
   [the PR template](.github/PULL_REQUEST_TEMPLATE.md).
7. **Resolve every review thread** using the steps in [PR Review & Merge Policy](#pr-review--merge-policy). The PR cannot
   merge until each thread is resolved.

**Adding a package:** copy the layout of the most similar existing package. React Native libraries build with bob;
Node and NestJS packages use the tsrs dual build. Then register the new package everywhere CI and the docs list
packages:

- `codecov.yml` (a flag and a coverage target)
- a coverage upload step in `.github/workflows/pr.yml`
- `scripts/smoke-esm.mjs` (`scripts/publint.sh` discovers publishable packages on its own)
- the package dropdown in `.github/ISSUE_TEMPLATE/bug_report.yml`
- `knip.json`, if the package needs entry overrides
- the root `llms.txt`, the `README.md` package tables and [Package Categories](#package-categories)

Commitlint reads the allowed scopes from the workspace, so it needs no change.

**Adding a method decorator:** build it on `createInterceptor` from `@rnw-community/decorators-core`. The "Build your own
decorator" section of that package's readme shows how. Follow the rules for
[`experimentalDecorators`](#decorator-factories--experimentaldecorators-only),
[decorators without paren wrapping](#decorator-application--no-paren-wrapping) and
[automatic type narrowing](#automatic-type-narrowing--core-feature).

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
one-liner + `@see` gives them the entry point without duplicating the docs. Enforced by the type-aware
`@rnw-community/public-api-tsdoc` ESLint rule (`packages/eslint-plugin`), enabled for every `packages/*/src` file in
`eslint.config.mjs`: TSDoc is required on exports reachable from a package entry point and reported everywhere else,
including every file of a private package.

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
- `llms.txt` at the package root of every publishable package ([llmstxt.org](https://llmstxt.org) format) — H1 with the
  exact package name, a `>` blockquote summary, then link sections: one `## API reference` bullet per export of
  `src/index.ts` pointing at its `readme.md#<anchor>`, plus colocated `<entity>.md` / `AGENTS.md` links. It ships in the
  npm tarball (`"llms.txt"` in `files`; npm always adds `readme.md`), so relative links may only target files inside the
  tarball — anything else (`AGENTS.md`, per-entity `.md` under `src/`, `CHANGELOG.md`, other packages) uses an absolute
  `https://github.com/rnw-community/rnw-community/blob/master/...` URL. Update it whenever an export is added, removed,
  or renamed, or a readme heading changes
- **Pack-content gate** — `pnpm assert:pack` (`scripts/assert-pack-contents.mjs`, run in the `pr.yml` code-quality job
  after `pnpm publint`, which builds every package first) runs `npm pack --dry-run --json` for each non-private
  package and fails if the tarball is missing `package.json`/`readme.md`/`llms.txt`, ships a spec/test/mock file,
  `__tests__`/fixtures/e2e/coverage directory, `*.tsbuildinfo`, or native build output (`ios/build*`, `android/build*`,
  `.gradle`, `Pods`), lacks any `main`/`module`/`types`/`exports` target, has an object `browser` map naming a file
  the tarball lacks or leaving a shipped `*.web.js` unmapped, or if `llms.txt` has a wrong H1, no
  blockquote, a relative link to a file outside the tarball, or a `readme.md#anchor` with no matching heading. Pass
  package directory names (`pnpm assert:pack shared wdio`) to check a subset
- **TSDoc `@see` gate** — `pnpm assert:see-anchors` (`scripts/assert-tsdoc-see-anchors.mjs`, run in the `pr.yml`
  code-quality job right after the pack-content gate) scans the non-spec `src` files of every non-private package and
  fails when an `@see` link into this repository (`https://github.com/rnw-community/rnw-community/{blob,tree}/master/...`)
  targets a missing file, or carries a `#anchor` with no matching heading in the target markdown (a directory link
  resolves to its `readme.md`). External spec links are not fetched. Pass package directory names to check a subset

### TypeScript — Strict mode with all strict flags enabled, decorators enabled

**Production compiler and separate compatibility/API compilers, by design:**

- `tsrs` (pinned to `0.18.0-ts7.1.0-dev.20260929`) runs all `ts` and `ts:nodenext` checks and all Node/NestJS
  ESM/CJS JavaScript and declaration builds. React Native packages keep bob's Babel module/commonjs targets and use
  `../../node_modules/tsrs/bin/tsrs` through bob's `typescript` target's `tsc` option for declarations. It ports the
  TypeScript 7.1 development compiler to Rust and supports legacy decorator metadata. Keep it pinned; compare fresh
  JavaScript/declaration output and consumer types when upgrading. `scripts/profile-tooling.py` measures type checks,
  builds and lint with process elapsed time and peak RSS.
- `@typescript/native` (`npm:typescript@^7`) provides the reference `tsc` binary for diagnostics, emit comparison and
  performance tests. Production build/check scripts use `tsrs`. The consumer package-manager smoke matrix runs both
  `tsrs` and TypeScript 5.9 against shipped declarations to preserve older-consumer coverage.
- `typescript` (`npm:@typescript/typescript6@^6`) provides the TypeScript 6.0 **JavaScript API** (and a `tsc6`
  binary) for tools that `import 'typescript'`: typescript-eslint's type-aware lint, knip, bob's declaration rewriter.
  TypeScript 7.0 ships no JS API yet and typescript-eslint's peer range stops below 7. A root pnpm `overrides` entry
  pins every `typescript` peer in the graph to this shim; `@arethetypeswrong/core` keeps its own pinned compiler.
- Replace the JavaScript API shim only after typescript-eslint and the custom typed rule support the native API
  (typescript-eslint/typescript-eslint#10940). Keep a reference compiler for compatibility and profiling.
- TypeScript 6/7 removed `moduleResolution: "node"` and infer `rootDir` from the tsconfig's own directory: the root
  build tsconfigs set `"rootDir": "${configDir}/src"` so every package keeps emitting `dist/<format>/index.js`.

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

### Lint toolchain — ESLint 10 + oxlint

`eslint.config.mjs` is the single source of truth for every lint rule. `scripts/generate-oxlintrc.mjs` resolves the
ESLint rules per file kind (`.ts`, `.tsx`, `.spec.ts`, `.spec.tsx`) and converts them with `@oxlint/migrate`: each supported syntax or type-aware rule
moves to oxlint with identical options; `eslint-plugin-oxlint` then turns
exactly those rules off in ESLint, so nothing is reported twice and nothing is dropped. Rules whose options oxlint
rejects, or whose results diverge from ESLint on a third-party parity corpus, stay in ESLint (the
`rulesKeptInEslint` / `pluginsKeptInEslint` maps list each reason). The generator fails if the handoff would replace
an ESLint rule with different options.

- Keep `oxlint`, `@oxlint/migrate` and `eslint-plugin-oxlint` aligned (currently pinned to `1.89.0`).
  `sort-imports`, `no-lonely-if` and `no-div-regex` use the revalidated native implementations. The migrator skips
  import sorting for Oxfmt users; this repository uses Prettier, so the generator copies the exact resolved
  `sort-imports` rule into each override and validates its handoff. Typed JS-plugin rules still require ESLint because
  oxlint's JS bridge provides no TypeScript program or ESTree-to-TypeScript maps
- After changing `eslint.config.mjs`, run `pnpm lint:oxlint:generate` and commit `.oxlintrc.json`; CI runs
  `pnpm lint:oxlint:check` and fails on drift
- `pnpm lint` runs each package's `oxlint src && eslint src` through Turbo; package-level lint and fix commands
  include type-aware oxlint too. Build workspace dependencies first so both linters resolve their declarations.
  CI builds and lints the affected packages; its repository-wide syntax pass needs no build outputs.
  `pnpm lint:oxlint` explicitly checks every package with types and requires all dependencies built
- `.oxlintrc.json` enables type-aware rules by default for local commands, staged files and editor integrations.
  `pnpm lint:fast` selects `.oxlintrc.fast.json`, which extends it with type analysis disabled; it is only a quick
  syntax pass and does not replace the full lint gate
- Disable directives keep ESLint syntax (`// eslint-disable-next-line <rule>`) — oxlint honours them. ESLint's
  unused-directive report skips directives that name oxlint-owned rules (the `oxlint-handoff` processor), so those
  are not checked for staleness
- Supported type-aware rules run through the pinned `oxlint-tsgolint` backend. Unsupported rules stay in ESLint,
  including `no-unsafe-enum-assignment` and `naming-convention`; `no-unnecessary-condition` remains for diagnostic
  position parity. Keep `projectService`:
  the custom `@rnw-community/public-api-tsdoc` rule also needs the TypeScript program
- `pnpm test:tooling` exercises negative type/lint fixtures, rule handoff, and mixed disable directives. CI runs it
  alongside the config drift guard. See [Tooling performance](docs/tooling-performance.md) for measurements and reproduction
- `eslint.config.mjs` loads `@rnw-community/eslint-plugin` from its built `dist`, so the turbo `lint`/`lint:fix` tasks
  depend on `@rnw-community/eslint-plugin#build`, and `pnpm lint:oxlint:*` and the pre-commit hook run
  `pnpm lint:plugin:build` first. Run `pnpm lint:plugin:build` before invoking `eslint` directly (editor integration
  included) in a fresh checkout

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
- NestJS integration packages support NestJS 11 and 12 (`^11.1.28 || ^12.0.0` peers) and test against 12. `@nestjs/*`
  12 ships ESM-only, so their `jest.config.js` passes `['@nestjs']` as `get-jest.config.js`'s `transformablePackageNames`
  and Babel transforms those modules to CommonJS for Jest 29; `packages/shared/babel.config.js` carries
  `babel-plugin-transform-import-meta` (`module: 'ES6'`) for their `import.meta.url` usages. The `nestjs-compatibility`
  PR job re-runs their `ts` + `test:coverage` with `pnpm-workspace.yaml` overrides pinning the minimum supported stacks
  (`@nestjs/*` 11.1.28 + `@nestjs/config` 4.0.4, and 12.0.0 + 12.0.1)
- The Reanimated packages (`react-native-collapsible-header`, `react-native-screen-chrome`) run Jest through
  `react-native-reanimated/jest/resolver` (Reanimated 4.7+, falling back to `react-native-worklets/jest/resolver` for the
  older versions the `reanimated-compatibility` job pins). `patches/react-native-worklets.patch` makes the worklets
  resolver decide by the package that owns the requesting file instead of a substring match on its path: pnpm's
  virtual-store directory for Reanimated (`react-native-reanimated@x_react-native-worklets@y…`) contains the worklets
  name, which made every Reanimated module resolve its web build and broke `setUpTests` (`window.matchMedia`)
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

## React Native library builds — react-native-builder-bob

**Every publishable React Native library package MUST build with `react-native-builder-bob`** (targets
`["module", { esm: true }]` + `["commonjs", { esm: true }]` + `typescript`, output `dist`), not the hand-rolled tsrs
dual-build described below. Bob owns what the dual compiler pipeline reimplements by hand — ESM extension rewriting, per-tree
`package.json` markers, and split declaration trees — and, being Babel-based, it takes `babel-plugin-react-compiler`
(target `'18'`, `panicThreshold: 'all_errors'`) through a `babel.config.bob.js` so published dist ships precompiled
React Compiler output (`react-compiler-runtime` as a runtime dependency). `'worklet'` directives pass through for the
consumer app's worklets plugin. The enforcement gates stay identical: `assert-esm-extensions.mjs` on `dist/module`,
publint + attw, and `smoke:esm` — plus `assert-react-compiler-output.mjs` on both trees for packages that ship
compiler output.
`react-native-collapsible-header` is the reference implementation. **Exception — `react-native-screen-chrome` ships
without compiler output**: its compiler-transformed code corrupts the Hermes heap at runtime on the current
RN 0.86 / iOS 26 stack (bisect and evidence in #601); re-add the plugin there only after #601 resolves.
Node/NestJS packages (no JSX, no compiler) keep the tsrs pipeline below.

## ESM Modernization Status

The monorepo uses dual ESM + CJS output. Rules:

- `sideEffects: false` (boolean) in every package.json
- Every dual-format package nests `types` **first** under both `import` and `require` in each `exports` block
  (`dist/esm/index.d.ts` for `import`, `dist/cjs/index.d.ts` for `require`). A single shared top-level `types` key
  resolves the wrong module kind for one of the two conditions, which attw reports
- The `build` script of every dual-format package writes `dist/esm/package.json` (`{"type":"module"}`) and
  `dist/cjs/package.json` (`{"type":"commonjs"}`). Package roots carry no `"type"` field, so `babel.config.js` /
  `jest.config.js` stay CommonJS (`eslint-plugin` is the exception, see below)
- `moduleResolution: "bundler"` in the root type-check tsconfig (it matches Metro); the ESM build uses
  `"module": "esnext"`, the CJS build `"module": "commonjs"` (TypeScript 6+ removed `node`/`node10` resolution)
- `verbatimModuleSyntax: true` (explicit `import type`), `lib: ["es2021"]` to match the build target
- `node10` resolution is not supported: `pnpm publint` runs attw with `--profile node16` (node16/nodenext + bundler),
  and packages declare their Node floor in `engines.node`
- **Invariant: no extensionless relative specifier in published output.** Source stays extensionless
  (`import { x } from './x'`). ESLint rejects a `.js`/`.jsx`/`.mjs`/`.cjs` extension on relative source specifiers
  (`.json` is allowed), because Jest resolves `./x` straight to `x.ts` and has no `moduleNameMapper` to strip one.
  After `build:esm`/`build:cjs`, each `build` script runs `scripts/rewrite-esm-extensions.mjs ./dist/esm`. It appends
  `.js` or `/index.js` to every relative static/dynamic import and export specifier in the emitted `.js` **and**
  `.d.ts` files, resolved against the files on disk, and leaves `require(...)` and bare specifiers alone. Then
  `scripts/assert-esm-extensions.mjs ./dist/esm` re-scans the tree and fails the build on any remaining extensionless
  specifier; this assertion is the enforcement point. Both scripts share `scripts/esm-relative-specifier.mjs`. The CJS
  build needs no rewrite because `require()` tolerates extensionless specifiers. `pnpm smoke:esm` (and the
  `package-manager-smoke` CI job) re-checks the same invariant by importing every packed tarball under real Node ESM
  and CJS
- `pnpm ts:nodenext` type-checks `src/` (specs included) with `tsconfig.nodenext-check.json`
  (`module`/`moduleResolution: "nodenext"`, `verbatimModuleSyntax: false`, because without a root `"type"` every
  source file is CommonJS-format under nodenext). It catches nodenext resolution defects such as a wrong `exports`
  subpath. Known gap: it does not catch a spec default-importing a CJS dependency whose `.d.ts` mistypes its default
  export (`import Redis from 'ioredis'`, #536), because that only fires in ESM-format files. Specs never ship, so
  this has no consumer impact
- **`eslint-plugin` ships CommonJS only, by design, not oversight.** Its `src/index.ts` ends in `export = plugin` —
  the shape ESLint's own legacy plugin loader (`@eslint/eslintrc`, string-based `"plugins": ["@rnw-community"]`
  resolution) requires: it `require()`s the module and uses the returned value directly, with no `.default` unwrap.
  Switching to `export default plugin` would satisfy a "real" ESM build but silently break every consumer still on
  legacy `.eslintrc` config. Because `export =` cannot be re-emitted as genuine ESM syntax, the package's own
  `tsconfig.build-esm.json` targets `NodeNext` against a `type`-less source tree so `tsrs` compiles it as CommonJS
  even under `dist/esm/` — both dist trees are byte-equivalent CJS. The package.json reflects this honestly instead of
  papering over it: root-level `"type": "commonjs"` (not per-directory markers, since neither directory is ESM), no
  `"module"` field (there is no real ESM entry to advertise to bundlers), and `pnpm publint`'s `attw` invocation for
  this package alone adds `--ignore-rules named-exports` — `attw`'s "TypeScript allows ESM named imports that will
  crash at runtime" finding is exactly the CJS-via-`import`-statement default-interop pattern this package's own
  readme documents as its supported usage (`import rnwcPlugin from '@rnw-community/eslint-plugin'`), never named
  imports of individual properties

## Mobile CI (Maestro E2E)

Two workflows, `.github/workflows/ios-maestro.yml` and `.github/workflows/android-maestro.yml`, run Maestro end-to-end
suites. Each is a thin caller of the [`rnw-community/mobile-ci`](https://github.com/rnw-community/mobile-ci) reusable
workflow of the same name, pinned to a commit SHA, with one call per platform. Its `targets` list covers every example
package (payments, collapsible-header and screen-chrome) for both the `bare` and `expo` app targets, and each target
names its own suite with `flowsDir` (the example package's `e2e/flows`). To add an example package, add its targets to
both workflows. Planning, building, booting the device, installing the app, running the suite and uploading the
debug artifacts all happen inside the reusable workflows.

- **When they run:** on every pull request; on pushes to `master` that touch the payments or collapsible-header packages
  or the workflow itself; nightly (iOS at 03:17 UTC, Android at 03:47 UTC); and on manual dispatch.
- **Which suites run:** on a pull request, mobile-ci runs `turbo ls --affected` against every target's app package and
  runs every suite when any of them is affected. A documentation-only change (`*.md`, `llms*.txt`, `docs/`) runs no
  suite, and a change to either workflow runs every suite. Every other trigger runs every suite.
- **Builds:** the `bare` targets set `buildStrategy: native`, because only an Expo app can be repacked, so they always
  compile. The `expo` targets repack a published base binary with this commit's JavaScript when one exists for their
  native fingerprint, and compile otherwise. A cold native build gets `build-timeout-minutes: 120`.
- **iOS:** builds and tests run on the self-hosted macOS ARM64 runners (label `macos-maestro`) with the pinned Xcode.
  The simulators stay stock (`simulator-slim-profile: ''`), because the payments suite needs the PassKit services a
  slim profile switches off.
- **Android:** builds and tests run on the self-hosted x86_64 Linux KVM pool. The suite runs on a KVM-accelerated
  `android-34` Google APIs x86_64 emulator with the `Galaxy Nexus` profile (720x1280 at 320dpi, the geometry the flows
  are calibrated against), and `emulator-slots-dir` caps how many emulators share a host.
- **Pinning and results:** `maestro-version` pins the Maestro CLI, and the reusable workflows are pinned to a commit SHA.
  Every run uploads a Maestro artifact per shard with one JUnit report per flow, plus the debug output of any failing
  flow, and each workflow ends with a status job that reports a single pass or fail. The screen-chrome targets set
  `tolerateTestFailures` on iOS, so their Maestro failures are reported as warnings and do not fail the workflow, until
  the Hermes heap corruption tracked in #601 is fixed.
- **Why one call per platform:** mobile-ci v4.3.0 takes `flowsDir`, `tolerateTestFailures` and `buildStrategy` per
  target, so a single call expresses three example packages with their own suites, bare targets that cannot be
  repacked, and a quarantine of one package. Before that release these workflows composed the individual mobile-ci
  actions instead.
- **Running locally:** build the example app and install it on a simulator or emulator. Then run `pnpm e2e:ios:bare`
  (or another `e2e:<platform>:<target>` script) from the example package directory.

## PR Review & Merge Policy

**Before merging any PR, read every review comment on it — automated findings AND human/maintainer comments alike**
(every thread, whoever opened it, whatever the current review tooling is) and run this loop for each — it is mandatory
for agents, not optional:

1. **Validate** the finding or question against the actual code — never accept or dismiss it on wording alone.
2. **Valid** → fix it in the same PR (root cause, not suppression) and reply on the thread naming the fixing commit.
3. **Invalid** → reply on the thread with the concrete refutation (evidence: file/line, spec reference, or reproduction).
4. **Maintainer questions get an answer on their thread** with the same evidence standard — including when the answer
   is "already addressed in `<sha>`" or "removed in `<sha>`". A question with no reply blocks the merge exactly like an
   unanswered bot finding.
5. **No silent resolutions** — never mark a thread resolved without a reply naming the fixing commit or the refutation.
6. A thread that is neither fixed nor answered **blocks the merge** — no exceptions without explicit maintainer
   approval, and admin merges are not a bypass. Findings the bot itself marks resolved/outdated are cleared.

## Pre-commit Checks

**IMPORTANT: Always run all checks before committing and pushing:**

```bash
pnpm ts && pnpm lint && pnpm test
```

All three must pass before creating a commit. Do not skip any of these checks.

## Pre-commit Hooks (Husky + lint-staged)

- Auto-runs oxlint fix, ESLint fix and Prettier on staged `.ts/.tsx` files
- Sorts `package.json` files
- Validates commit message format
