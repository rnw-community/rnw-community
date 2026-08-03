# @rnw-community/object-field-tree

Generates a fully-typed nested lookup object from 1-5 enum-like collections, calling a data generator function once per leaf combination. Type-safe Cartesian product of enum keys.

## Package Commands

```bash
yarn test && yarn test:coverage && yarn build && yarn ts && yarn lint:fix
```

## Architecture

```
src/
  type/
    data-fn.type.ts    — DataFn1..DataFn5: (t1: keyof T1, ..., tN: keyof TN) => D
    return.type.ts     — CombineReturn1..CombineReturn5: nested Record<keyof T1, Record<keyof T2, ...>>
  index.ts             — combine() overloads (arity 1-5) + runtime implementation, re-exports Enum
  index.spec.ts        — tests (co-located with index — the only file in the package with a spec)
```

### Key Patterns

- `combine(dataFn, collection1, ..., collectionN)` is overloaded for exactly **1 through 5** collections
  (`DataFn1`/`CombineReturn1` … `DataFn5`/`CombineReturn5`); there is no 6-collection overload, though the untyped
  implementation signature (`dataFn, ...objects: any[]`) would run with any count at runtime
- The runtime implementation in `index.ts` is genuinely recursive: it `shift()`s the first collection off `objects`,
  and for each of its keys recurses with `combine((...args) => dataFn(key, ...args), ...objects)` (partial
  application), terminating with `dataFn(key)` once `objects` is empty
- `Object.keys()` enumerates collection keys, so both string and numeric TypeScript enums work — a numeric enum's
  reverse-mapping entries (`'0': 'Key'`) are walked like any other key, which is why the spec covers a 2-numeric-enum
  case explicitly
- Consumed by `fast-style` to build the `Flex` 3D lookup constant (direction x justifyContent x alignItems)
- Re-exports `Enum` type from `@rnw-community/shared` — the constraint every `T1..T5` collection type must satisfy

### Dependencies

- `@rnw-community/shared` — supplies the `Enum` constraint type used by every `combine()` overload

### Coverage

Default monorepo threshold: 99.9% on all metrics.
