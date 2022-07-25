# Object field tree

Utility for generating complex nested objects with data generation callback and full TypeScript support
with IDE autocompletion.

```combine((...keys) => data, ...objects)```

Real world usage examples:
[@rnw-community/fast-style](https://github.com/rnw-community/rnw-community/tree/master/packages/fast-style)

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
    'Chemistry' = 'Chemistry Science'
}

const complexityObject = {
    Easy: 'Easy',
    Medium: 'Medium',
    Hard: 'Hard',
}

const tree = combine((science, complexity) => ({
        science: ScienceEnum[science],
        complexity: complexityObject[complexity],
        complexData: `${science}_${complexity}`
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
    'Third': WidgetStyles.thrirdWidth,
    'TwoThirds': WidgetStyles.twoThrirdsWidth,
    'Full': WidgetStyles.fullWidth
}

const widgetHeightStyleMap = {
    [WidgetHeightEnum.Small]: WidgetStyles.smallHeight,
    [WidgetHeightEnum.Medium]: WidgetStyles.MediumHeight,
}

export const Widget = combine(
    (height, width) => (props) => <View {...props} style={[widgetHeightStyleMap[height], widgetWidthMap[width]]} />,
    WidgetHeightEnum,
    widgetWidthMap
);

// Widget usage
const Component = () => <Widget.Small.Full>
    <View>
        <Text>Hello!</Text>
    </View>
</Widget.Small.Full>;
```
