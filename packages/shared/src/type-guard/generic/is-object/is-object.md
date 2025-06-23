# `isObject`

Check if a variable IS an object type.

## Example

```ts
import {isObject} from "@rnw-community/shared";

const object: {} | undefined = {};

isObject(object); // returns true and narrows type to never[]
```
