# `IsNotEmptyArray<T>`

Generic type for declaring input type `T` to be an array with at least one element.

## Example

```ts
const testNotEmptyArray: IsNotEmptyArray<string> = ['test']; // No TS error
const testEmptyArray: IsNotEmptyArray<string> = []; // Shows TS error
```
