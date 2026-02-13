# `isArray`

Check if a variable IS an array type. Accepts both mutable and `readonly` arrays.

## Example

```ts
import { isArray } from '@rnw-community/shared';

const array: string[] | undefined = [];

isArray(array); // returns true and narrows type to string[]

const readonlyArray: readonly string[] | undefined = ['a', 'b'];

isArray(readonlyArray); // returns true and narrows type to readonly string[]
```
