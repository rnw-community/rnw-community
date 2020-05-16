# React Native Fast Styles

Utility library for rapid React Native styling.

Library using [@rnw-community/object-field-tree](https://www.npmjs.com/package/@rnw-community/object-field-tree) package for
generating complex object field structure.

## Flex
Special object `Flex` for rapid React native FlexBox styles generation with IDE autocomplete(IntelliSense).

### Usage in Style object
Styles usage example with spreading styles:
```ts
import { StyleSheet } from 'react-native';
import { Flex, Font } from '@rnw-community/fast-style';

export const componentStyles = StyleSheet.create({
    root: {
        ...Flex.row.flexEnd.stretch,
        padding: 16
    }
});
```

### JSX inline usage
```tsx
import { View, Text } from 'react-native';
import { Flex } from '@rnw-community/fast-style';

export const Component = () => (
    <View style={Flex.column.center.flexStart}/>
);
```

## Font
Special method `getFont()` for generating `Font` object for rapid React native _Font_ styles generation with IDE autocomplete(IntelliSense).

Every project is using their own _fonts_, _colors_ and _sizes_ according to the style-guide, for generating `Font` object:
```ts
const Font = getFont(FontFamilies, Sizes, Colors);
```

Example usage:
```ts
import { getFont } from '@rnw-community/fast-style';

export enum FontColorEnum {
    red = '#D8D8D8',
    green = '#1462FC',
    black = '#353535',
    blue = '#1252D7',
}
export enum FontFamilyEnum {
    ptSansBold = 'PTSans-Bold',
    ptSansRegular = 'PTSans-Regular'
}
export enum FontSizeEnum {
    xxl = '28',
    xl = '24',
    l = '22',
    m = '20',
    s = '18',
    xs = '16',
}

export const Font = getFont(FontFamilyEnum, FontSizeEnum, FontColorEnum);
```

### Usage in Style object
```ts
import { StyleSheet } from 'react-native';

import { Font } from './font';

export const componentStyles = StyleSheet.create({
    text: {
        ...Font.ptSansBold.xs.blue,
        testDecoration: 'underline'
    }
});
```

### JSX inline usage
```tsx
import { Text } from 'react-native';

import { Font } from './font';

export const Component = () => (
    <Text style={Font.ptSansBold.xs.blue}>
        There!
    </Text>
);
```
