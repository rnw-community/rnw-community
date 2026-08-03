# @rnw-community/shared

Core utility hub — type guards, helper functions, and TypeScript utility types. Zero runtime dependencies; the most-depended-on package in the monorepo.

## Package Commands

```bash
yarn test && yarn test:coverage && yarn build && yarn ts && yarn lint:fix
```

## Architecture

```
src/
  type/                             — TypeScript utility types, one folder per entity
    maybe-type/                     — Maybe<T> = T | null
    empty-fn-type/                  — EmptyFn = (...args: any[]) => void
    any-fn-type/                    — AnyFn = (...args: any) => any
    class-type/                     — ClassType<T> = new (...args: any[]) => T
    abstract-constructor-type/      — AbstractConstructor<T> = abstract new (...args: any[]) => T
    method-decorator-type/          — MethodDecoratorType<K> (typed method-decorator factory result)
    on-event-fn-type/               — OnEventFn<T, R> = (event: T) => R
    enum-type/                      — Enum<D> = Record<string, D>
    is-not-empty-array-type/        — IsNotEmptyArray<T> = [T, ...T[]]
    readonly-is-not-empty-array-type/ — ReadonlyIsNotEmptyArray<T> = readonly [T, ...T[]]
  type-guard/                       — Runtime type narrowing functions, one folder per entity
    generic/    — isDefined, isError, isObject, isPromise, isRecord
    array/      — isArray, isEmptyArray, isNotEmptyArray, isNotEmptyArrayOf (+ is-never.spec-type.ts, a
                  compile-time-only IsNever<T> helper used by the array specs, never exported)
    boolean/    — isBoolean
    number/     — isNumber, isPositiveNumber
    string/     — isString, isEmptyString, isNotEmptyString, isDecimalMonetaryValue
  util/                             — Runtime utilities, one folder per entity
    cs/              — conditional style-object picker for RN/RNW `style` props
    empty-fn/        — emptyFn, the canonical no-op
    get-defined/     — getDefined(value, defaultFn) — sync lazy default when nullish
    get-defined-async/ — getDefinedAsync(value, defaultFn) — async counterpart; on disk, NOT in index.ts
    get-error-message/ — getErrorMessage(err, fallback?)
    wait/            — Promise-based sleep
```

### Key Patterns

- **One exported entity per folder, including single-file types.** This package predates the root-level rule that a lone
  file (no spec, no `.md`) stays flat at the category level — every entity here, even a one-line `.type.ts`, still gets its
  own folder with `<entity>.ts` + `<entity>.md` (and a `.spec.ts` for guards/utils). New packages follow the root convention
  (flat single-file types); this package's existing layout is intentionally left alone rather than restructured piecemeal.
- `getDefinedAsync` is fully implemented and tested on disk (`src/util/get-defined-async/`) but is deliberately **not**
  re-exported from `src/index.ts` — verified directly against the barrel, which lists `getDefined` but not
  `getDefinedAsync`. Treat it as internal until a consumer need promotes it to the public surface.
- `isObject` is a public guard (`isDefined(value) && typeof value === 'object' && !isArray(value)`) and `isRecord` composes
  it directly (`isRecord = (value) => isObject(value)`) rather than re-implementing the same narrowing — the guard chain is
  the pattern to follow for any new object-shaped guard.
- Composition over re-implementation elsewhere too: `isNotEmptyArray` builds on `isArray`, `isNotEmptyString`/`isEmptyString`
  build on `isString`, `isDecimalMonetaryValue` builds on `isString` plus a regexp test — `isDefined` is the guard every
  other guard ultimately bottoms out on.
- Types are always `export type` — never import a type from this package as a value.

### Dependencies

None at runtime (`package.json` has no `dependencies` field). This is deliberate: `shared` is the dependency floor every
other package in the monorepo builds on, so it must not itself depend on anything workspace-local or third-party.

### Coverage

Default monorepo threshold: **99.9%** for statements, branches, functions, and lines (`get-jest.config.js`, no
per-package override in `packages/shared/jest.config.js`).
