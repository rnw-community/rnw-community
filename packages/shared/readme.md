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
