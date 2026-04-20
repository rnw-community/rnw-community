# @rnw-community/shared

Core utility hub — type guards, helper functions, and TypeScript utility types. Zero dependencies. Many packages in the monorepo depend on this package.

## Package Commands

```bash
yarn test               # Run tests
yarn test --watch       # Watch mode
yarn test:coverage      # Tests with coverage
yarn build              # Build (dual ESM + CJS)
yarn ts                 # Type check
yarn lint:fix           # Fix lint issues
```

## Architecture

### Directory Layout

```
src/
  type/           — TypeScript utility types (Maybe, AnyFn, ClassType, EmptyFn, Enum, MethodDecoratorType, etc.)
  type-guard/     — Runtime type narrowing functions
    generic/      — isDefined, isError, isPromise (isObject exists but is internal-only and NOT exported)
    array/        — isArray, isEmptyArray, isNotEmptyArray, isNotEmptyArrayOf
    boolean/      — isBoolean
    number/       — isNumber, isPositiveNumber
    string/       — isString, isEmptyString, isNotEmptyString
  util/           — Runtime utilities (cs, emptyFn, getDefined, getErrorMessage, wait)
```

Source for `getDefinedAsync` exists on disk but is intentionally NOT re-exported from `src/index.ts` — treat it as internal.

### Key Conventions

- **One entity per file.** This package predates the monorepo-wide flat-layout-for-single-file-entities rule codified in the root `AGENTS.md`; the shared package's existing layout places every entity (including single-file interfaces) in its own folder. Root convention now prefers flat `src/<category>/<entity>.<suffix>.ts` for lone files — new packages should follow root convention; do not restructure existing shared folders without a separate refactor.
- Each entity directory contains: implementation `.ts`, test `.spec.ts`, documentation `.md`
- Types are always `export type` — never import types as values from this package
- `isDefined` is the foundation guard — most other guards compose with it
- `isObject` and `getDefinedAsync` exist but are intentionally **not exported** (internal use only)
- Composition over re-implementation: guards chain (`isString` → `isDefined`, `isNotEmptyArray` → `isArray`)

### Coverage

Default monorepo threshold: **99.9%** for statements, branches, functions, and lines.

### Key Types

| Type | Definition | Purpose |
|------|-----------|---------|
| `Maybe<T>` | `T \| null` | Nullable values |
| `EmptyFn` | `(...args: any[]) => void` | Default event handlers, no-op slots, abort-listener cleanup |
| `AnyFn` | `(...args: any) => any` | Generic function constraint for decorator factories |
| `ClassType<T>` | `new (...args: any[]) => T` | Concrete constructor (DI, reflection) |
| `AbstractConstructor<T>` | `abstract new (...args: any[]) => T` | Abstract class mixins |
| `MethodDecoratorType<K>` | Typed method-decorator factory result | Used across every decorator package in the monorepo (not just NestJS) — the canonical home for the decorator-return type |
| `IsNotEmptyArray<T>` | `[T, ...T[]]` | Non-empty array assertion |
| `Enum<D>` | `Record<string, D>` | Enum-like object |
