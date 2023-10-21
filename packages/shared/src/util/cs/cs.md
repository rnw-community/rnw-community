# Conditional styling `cs`

```
cs(condition: boolean, trueStyle: StyleType, falseStyle?: StyleType): StyleType
```

Returns `trueStyle` object if `condition` is true,
otherwise returns `falseStyle` object which defaults to `{}`.

## Example

Useful for React Native styles:

```tsx
const rootStyles = [Styles.root, cs(isActive, Styles.rootActive), cs(isDisabled, Styles.rootDisabled)];

const buttonStyles = cs(isActive, Styles.buttonActive, Styles.buttonDisabled);
```
