# `isPositiveNumber`

Check if variable is a positive number type, excluding `0`.

## Example

```ts
const positiveNumber = 1;

isPositiveNumber(aNumber); // returns true and narrows type to number for aNumber

const negativeNumber = -1;

isPositiveNumber(negativeNumber); // returns false
```
