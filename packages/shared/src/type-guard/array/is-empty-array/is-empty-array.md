# `isEmptyArray`

Check if variable IS an empty array type.

## Example

```ts
import {isEmptyArray} from "@rnw-community/shared/src";

const emptyArray: string[] | undefined = [];

isEmptyArray(emptyArray); // returns true and narrows type to never[]
!isEmptyArray(emptyArray); // returns false and narrows type to string[] | undefined
```
