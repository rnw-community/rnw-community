# Object field tree

Utility for generating complex nested objects with data generation callback and full TypeScript support
with IDE autocompletion.

[![npm version](https://badge.fury.io/js/%40rnw-community%2Fobject-field-tree.svg)](https://badge.fury.io/js/%40rnw-community%2Fobject-field-tree)
[![coverage](https://img.shields.io/codecov/c/github/rnw-community/rnw-community?flag=object-field-tree&label=coverage)](https://app.codecov.io/gh/rnw-community/rnw-community)
[![npm downloads](https://img.shields.io/npm/dm/%40rnw-community%2Fobject-field-tree.svg)](https://www.npmjs.com/package/%40rnw-community%2Fobject-field-tree)

`combine((...keys) => data, ...objects)`

Real world usage examples:
[@rnw-community/fast-style](https://github.com/rnw-community/rnw-community/tree/master/packages/fast-style)

## Exports

### `combine`

Overloaded for 1–5 enum-like collection arguments; builds a nested lookup object where each leaf is `dataFn(key1, key2, ...)`. See the two full examples below.

### `Enum`

Re-exported from [`@rnw-community/shared`](https://github.com/rnw-community/rnw-community/tree/master/packages/shared) — the constraint every `combine` collection argument must satisfy (a plain string/number enum-like object).

```ts
import type { Enum } from '@rnw-community/object-field-tree';

const isValidCollection = <T extends Enum>(collection: T): T => collection;
```

### `CombineReturn1<T, D>`

Return type of `combine` called with 1 collection: `Record<keyof T, D>`.

```ts
import type { CombineReturn1 } from '@rnw-community/object-field-tree';

type Sizes = CombineReturn1<{ Small: 'Small'; Large: 'Large' }, string>; // Record<'Small' | 'Large', string>
```

### `CombineReturn2<D, T1, T2>`

Return type of `combine` called with 2 collections — nests one more level of `Record`: `Record<keyof T1, CombineReturn1<T2, D>>`.

```ts
import type { CombineReturn2 } from '@rnw-community/object-field-tree';

type Sizes = { Small: 'Small'; Large: 'Large' };
type Colors = { Red: 'Red'; Blue: 'Blue' };

type SizeColor = CombineReturn2<string, Sizes, Colors>; // Record<'Small' | 'Large', Record<'Red' | 'Blue', string>>
```

### `CombineReturn3<D, T1, T2, T3>`

Return type of `combine` called with 3 collections: `Record<keyof T1, CombineReturn2<D, T2, T3>>` — one more nesting level than `CombineReturn2`.

### `CombineReturn4<D, T1, T2, T3, T4>`

Return type of `combine` called with 4 collections: `Record<keyof T1, CombineReturn3<D, T2, T3, T4>>`.

### `CombineReturn5<D, T1, T2, T3, T4, T5>`

Return type of `combine` called with 5 collections: `Record<keyof T1, CombineReturn4<D, T2, T3, T4, T5>>` — the deepest arity `combine` supports.

## Example

### Typescript enum and object usage example

You need to understand how [TS converts enums](https://www.typescriptlang.org/docs/handbook/enums.html) into JS.

```ts
import { combine } from '@rnw-community/object-field-tree';
import { View } from 'react-native';

import { WidgetStyles } from './widget.styles';

enum ScienceEnum {
    'Mathematics' = 'Mathematics Science',
    'Physics' = 'Physics Science',
    'Chemistry' = 'Chemistry Science',
}

const complexityObject = {
    Easy: 'Easy',
    Medium: 'Medium',
    Hard: 'Hard',
};

const tree = combine(
    (science, complexity) => ({
        science: ScienceEnum[science],
        complexity: complexityObject[complexity],
        complexData: `${science}_${complexity}`,
    }),
    ScienceEnum,
    complexityObject
);

console.log(tree.Physics.Hard);
console.log(tree.Chemistry.Easy);
```

### Generating components example

With this approach you can create a strictly configurable building framework of Components for your project with very
easy usage and IDE autocompletion.

```tsx
import { combine } from '@rnw-community/object-field-tree';
import { View } from 'react-native';

import { WidgetStyles } from './widget.styles';

enum WidgetHeightEnum {
    'Small' = 'Small',
    'Medium' = 'Medium',
}

const widgetWidthMap = {
    Third: WidgetStyles.thrirdWidth,
    TwoThirds: WidgetStyles.twoThrirdsWidth,
    Full: WidgetStyles.fullWidth,
};

const widgetHeightStyleMap = {
    [WidgetHeightEnum.Small]: WidgetStyles.smallHeight,
    [WidgetHeightEnum.Medium]: WidgetStyles.MediumHeight,
};

export const Widget = combine(
    (height, width) => props => <View {...props} style={[widgetHeightStyleMap[height], widgetWidthMap[width]]} />,
    WidgetHeightEnum,
    widgetWidthMap
);

// Widget usage
const Component = () => (
    <Widget.Small.Full>
        <View>
            <Text>Hello!</Text>
        </View>
    </Widget.Small.Full>
);
```

## License

This library is licensed under The [MIT License](./LICENSE.md).
