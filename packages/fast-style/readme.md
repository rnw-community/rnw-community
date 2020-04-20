# React Native Fast Styles

Utility library for fast React Native styling.

Styles usage example with spreading styles:
```ts
import { StyleSheet } from 'react-native';
import { Flex, Font } from '@rnw-community/fast-style';

export const componentStyles = StyleSheet.create({
    root: {
        ...Flex.row.flexEnd.stretch,
        padding: 16
    },
    text: {
        ...Font.ptSansBold.xs.blue,
        testDecoration: 'underline'
    }
});
```

JSX usage example with inlined fast styles:
```tsx
import { View, Text } from 'react-native';
import { Flex, Font } from '@rnw-community/fast-style';

import { componentStyles } from './component.styles.ts'

export const Component = () => (
    <View style={componentStyles.root}>
        <View style={Flex.column.center.flexStart}>
            <Text style={componentStyles.text}>
                Hi!
            </Text>
        </View>
        <View style={Flex.column.center.flexStart}>
            <Text style={Font.ptSansBold.xs.blue}>
                There!
            </Text>
        </View>
    </View>
);
```
