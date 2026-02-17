# @rnw-community/object-field-tree

Generates fully-typed nested lookup objects from combinations of enum-like objects using a data generator function. Type-safe Cartesian product of enum keys.

## Package Commands

```bash
yarn test && yarn test:coverage && yarn build && yarn ts && yarn lint:fix
```

## Architecture

```
src/
  type/
    data-fn.type.ts    — DataFn1..DataFn5 (typed generator function signatures)
    return.type.type.ts     — CombineReturn1..CombineReturn5 (nested Record return types)
  index.ts             — exports combine() + types
  index.spec.ts        — tests (co-located with index, unusual for this repo — package is small)
```

### Key Patterns

- `combine(dataFn, ...enums)` — overloaded for 1-5 enum args, builds nested object where each leaf is `dataFn(key1, key2, ...)`
- Runtime implementation is recursive: shifts first object, recurses with partial-application of `dataFn`
- Used by `fast-style` to build the `Flex` constant (3D: direction x justifyContent x alignItems)
- Re-exports `Enum` type from `@rnw-community/shared`

### Dependencies

`@rnw-community/shared` (for `Enum` type).

### Coverage

Default: **99.9%** all metrics.
```
