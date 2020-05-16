# Shared - React native web community
Generic types and utilities commonly used across packages.

## Types

### `Maybe<T>`
Generic type for declaring input type `T` to be nullable.

### `OnEventFn<T, R>`
Generic function type with input type `T` and return type `R`.

## Utils

### `cs` - Conditional styles shorthand
Conditional styling, returns `trueStyle` object if `condition` is true,
otherwise returns `falseStyle` object which defaults to `{}`.

Useful for React Native styles:
```tsx
import { cs } from '@rnw-community/shared';

import { Styles } from './styles';

const rootStyles = [
    Styles.root,
    cs(isActive, Styles.rootActive),
    cs(isDisabled, Styles.rootDisabled)
];

const buttonStyles = cs(isActive, Styles.buttonActive, Styles.buttonDisabled);
```

### `isDefined` - Check if variable is not undefined and is not null

### Platform constants
For simple identifying of the platform library provides global constants:
 - `isWeb`
 - 'isIOS'
 - 'isAndroid'
 - 'isMobile' - IOS or Android

### Platform styling
For simple platform-specific styling library provider helpers:
 - `webStyles(style)`
 - `androidStyles(style)`
 - `iosStyles(style)`
 - `mobileStyles(style)`

Example usage:
```ts
import { StyleSheet } from 'react-native';
import { webStyles, androidStyles } from '@rnw-community/shared';

export const Styles = StyleSheet.create({
    root: {
        width: 200,
        ...webStyles({
            width: 400,
        }),
        ...androidStyles({
            paddingBottom: 5
        })
    }
});

```
