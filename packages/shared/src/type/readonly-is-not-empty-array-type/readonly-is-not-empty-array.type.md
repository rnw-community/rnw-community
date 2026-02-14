# `ReadonlyIsNotEmptyArray<T>`

Generic type for declaring input type `T` to be a readonly array with at least one element.

## Example

```ts
import type { ReadonlyIsNotEmptyArray } from '@rnw-community/shared';

const testNotEmptyArray: ReadonlyIsNotEmptyArray<string> = ['test']; // No TS error
const testEmptyArray: ReadonlyIsNotEmptyArray<string> = []; // Shows TS error
```
