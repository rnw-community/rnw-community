# `Enum`

Generic typescript enum type.

## Example

```ts
enum TestEnum {
    A = 'A',
    B = 'B',
}

const testFunction = <T extends Enum>(value: T) => {
    return value;
};
```
