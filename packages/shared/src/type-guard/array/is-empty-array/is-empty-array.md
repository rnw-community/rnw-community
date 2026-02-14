# `isEmptyArray`

Check if a variable IS an empty array type. Accepts both mutable and `readonly` arrays.

## Example

```ts
import { isEmptyArray } from '@rnw-community/shared';

const emptyArray: string[] | undefined = [];

isEmptyArray(emptyArray); // returns true and narrows type to readonly never[]

const readonlyArray: readonly string[] | undefined = [];

isEmptyArray(readonlyArray); // returns true and narrows type to readonly never[]
```
