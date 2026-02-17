# @rnw-community/fast-style

Pre-computed lookup constants for React Native flex layout and font styling. Index into `Flex.row.center.center` instead of inline style objects.

## Package Commands

```bash
yarn test && yarn test:coverage && yarn build && yarn ts && yarn lint:fix
```

## Architecture

```
src/
  enum/    — FlexDirectionEnum, FlexJustifyContentEnum, FlexAlignItemsEnum
  flex/    — Flex constant (3D combine: direction x justifyContent x alignItems)
  font/    — getFont<TFamily, TSize, TColor>(families, sizes, colors, additionalStyle?)
```

### Key Patterns

- `Flex` is a compile-time constant computed once via `combine()` from `object-field-tree`
- `getFont` returns a 3-level nested object of `TextStyle` values, keyed by user-provided enums
- Font size values must be strings (not numbers) due to TypeScript enum reverse-mapping issues

### Dependencies

`@rnw-community/object-field-tree`, `@rnw-community/shared`. Peers: `react`, `react-native`.

### Coverage

Default: **99.9%** all metrics.
```
