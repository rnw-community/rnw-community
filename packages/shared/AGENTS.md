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
  type/           — TypeScript utility types (Maybe, AnyFn, ClassType, EmptyFn, Enum, etc.)
  type-guard/     — Runtime type narrowing functions
    generic/      — isDefined, isError, isPromise (isObject exists but is internal-only)
    array/        — isArray, isEmptyArray, isNotEmptyArray
    number/       — isNumber, isPositiveNumber
    string/       — isString, isEmptyString, isNotEmptyString
  util/           — Runtime utilities (cs, emptyFn, getDefined, getDefinedAsync, getErrorMessage)
```

### Key Conventions

- **One entity per file**, file in own directory: `type/maybe-type/maybe.type.ts`
- Each entity directory contains: implementation `.ts`, test `.spec.ts`, documentation `.md`
- Types are always `export type` — never import types as values from this package
- `isDefined` is the foundation guard — most other guards compose with it
- `isObject` exists but is intentionally **not exported** (internal use only)
- Composition over re-implementation: guards chain (`isString` → `isDefined`, `isNotEmptyArray` → `isArray`)

### Coverage

Default monorepo threshold: **99.9%** for statements, branches, functions, and lines.

### Key Types

| Type | Definition | Purpose |
|------|-----------|---------|
| `Maybe<T>` | `T \| null` | Nullable values |
| `EmptyFn` | `(...args: any[]) => void` | Default event handlers |
| `AnyFn` | `(...args: any) => any` | Generic function constraint |
| `ClassType<T>` | `new (...args: any[]) => T` | Concrete constructor (DI, reflection) |
| `AbstractConstructor<T>` | `abstract new (...args: any[]) => T` | Abstract class mixins |
| `MethodDecoratorType<K>` | Typed method decorator | NestJS decorator factories |
| `IsNotEmptyArray<T>` | `[T, ...T[]]` | Non-empty array assertion |
| `Enum<D>` | `Record<string, D>` | Enum-like object |
