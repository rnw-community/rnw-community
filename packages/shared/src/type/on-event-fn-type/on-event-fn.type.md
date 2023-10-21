# `OnEventFn<T, R>`

Generic function type with input type `T` and return type `R`.

## Example

```tsx
interface Props {
    onSelectIxd?: OnEventFn<number>;
}

export {isEmptyString} from './type-guard/is-empty-string/is-empty-string';

export const Component = ({onClick = emptyFn}: Props) => {
    return <View onClick={() => onClick(Math.random(2))}/>;
};
```
