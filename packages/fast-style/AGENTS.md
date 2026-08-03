# @rnw-community/fast-style

Pre-computed lookup constants for React Native flex layout and font styling. Index into `Flex.row.center.center`
instead of building inline style objects.

## Package Commands

```bash
yarn test && yarn test:coverage && yarn build && yarn ts && yarn lint:fix
```

## Architecture

```text
src/
  enum/
    flex-direction.enum.ts         — FlexDirectionEnum (column, columnReverse, row, rowReverse)
    flex-justify-content.enum.ts   — FlexJustifyContentEnum (center, flexEnd, flexStart, spaceAround, spaceBetween, spaceEvenly)
    flex-align-items.enum.ts       — FlexAlignItemsEnum (baseline, center, flexEnd, flexStart, stretch)
  flex/
    flex.ts    — Flex constant: combine() over the 3 enums above, each leaf a { flexDirection, justifyContent, alignItems } style
  font/
    font.ts    — getFont(fontFamilyObj, fontSizeObj, fontColorObj, additionalStyle?) => nested TextStyle tree
  index.ts     — re-exports the 3 enums, getFont, Flex
```

### Key Patterns

- `Flex` is a module-level constant computed once via `@rnw-community/object-field-tree`'s `combine()`; the data
  function receives the three enum keys and looks each one up in its own enum to build the `TextStyle`-shaped leaf
- `getFont` is generic over `TFamily`/`TSize`/`TColor` (each constrained to `Enum<...>`) and also builds its 3-level
  tree via `combine()`; each leaf spreads a caller-supplied `additionalStyle: TextStyle = {}` after the computed
  `fontFamily`/`fontSize`/`color`, so caller overrides win when keys collide
- `getFont` throws `new Error('fontSizeObj must have string values')` before combining if any value in `fontSizeObj`
  is a `number` — required because font sizes are read back with `parseInt(fontSizeObj[fontSize] as string, 10)`, and
  a numeric TypeScript enum's reverse-mapping would otherwise silently double-map

### Dependencies

- `@rnw-community/object-field-tree` — `combine()` and `CombineReturn3` powering both `Flex` and `getFont`
- `@rnw-community/shared` — `Enum` constraint type for `getFont`'s generics
- Peers: `react` (>=18), `react-native` (>=0.64) — `getFont` types against `react-native`'s `TextStyle`/`ColorValue`

### Coverage

Default monorepo threshold: 99.9% on all metrics.
