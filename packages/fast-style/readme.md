# React Native Fast Styles

> Utility library for fast React Native styling.

```tsx
import { View, Text } from 'react-native';
import { Flex } from 'rnw-community/react-native-fast-style';

<View style={Flex.row.flexStart.strectch}>
    <View style={Flex.column.center.flexStart}>
        <Text style={Font.ptSansBold.xs.blue}>
            Hi!
        </Text>
    </View>
    <View style={Flex.column.center.flexStart}>
        <Text style={Font.ptSansBold.xs.blue}>
            There!
        </Text>
    </View>
</View>
```
