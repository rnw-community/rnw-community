# `isNotEmptyArray`

Check if a variable is NOT an empty array type. Accepts both mutable and `readonly` arrays.

## Example

```ts
import { isNotEmptyArray } from '@rnw-community/shared';

const notEmptyArray: string[] | undefined = ['test'];

isNotEmptyArray(notEmptyArray); // returns true and narrows type to ReadonlyIsNotEmptyArray<string>

const readonlyArray: readonly string[] | undefined = ['a', 'b'];

isNotEmptyArray(readonlyArray); // returns true and narrows type to ReadonlyIsNotEmptyArray<string>
```
