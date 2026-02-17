# `isNotEmptyArrayOf`

Check if a variable is a non-empty array where every element matches a type guard. Combines `isNotEmptyArray` and `.every()` into a single call with proper type narrowing.

## Example

```ts
import { isNotEmptyArrayOf, isNotEmptyString, isPositiveNumber } from '@rnw-community/shared';

const values: string[] | undefined = ['a', 'b'];

if (isNotEmptyArrayOf(values, isNotEmptyString)) {
    // values is narrowed to readonly [string, ...string[]]
    console.log(values[0].toUpperCase()); // safe
}

const ids: (string | number)[] = [1, 2, 3];

if (isNotEmptyArrayOf(ids, isPositiveNumber)) {
    // ids is narrowed to readonly [number, ...number[]]
    console.log(ids[0].toFixed(2)); // safe
}
```
