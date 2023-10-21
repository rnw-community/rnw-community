# `emptyFn`

Function that has not implementation and returns void.

## Example

Useful for React nad other event handlers default value to avoid condition checks.

```tsx
interface Props {
    onClick?: OnEventFn;
}

export const Component = ({ onClick = emptyFn }: Props) => <View onClick={onClick} />;
```
