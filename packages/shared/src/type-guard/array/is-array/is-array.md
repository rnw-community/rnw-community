# `isArray`

Check if a variable IS an array type.

## Example

```ts
import {isArray} from "@rnw-community/shared";

const array: string[] | undefined = [];

isArray(array); // returns true and narrows type to never[]
```
