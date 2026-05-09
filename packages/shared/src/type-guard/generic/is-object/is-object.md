# `isObject`

Check if variable is a non-array object and narrows its type to `object`.

## Example

```ts
import { isObject } from '@rnw-community/shared';

const value: unknown = { id: 'product-1' };

if (isObject(value)) {
    Object.keys(value); // value is object
}
```
