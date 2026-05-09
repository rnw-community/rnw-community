# `isRecord`

Check if variable is a non-array object and narrows its type to `Record<PropertyKey, unknown>`.

Useful when a value must be indexable after runtime validation. Arrays are objects in JavaScript, but `isRecord` returns `false` for arrays.

## Example

```ts
import { isRecord } from '@rnw-community/shared';

const value: unknown = { id: 'product-1' };
const array: unknown = ['product-1'];

if (isRecord(value)) {
    value['id']; // value is Record<PropertyKey, unknown>
}

isRecord(array); // returns false
```
