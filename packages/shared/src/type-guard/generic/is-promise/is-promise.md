# `isPromise`

Check if variable is a `Promise` instance and narrows its type to the `Promise<T>`.

> Checks are based on [Promises/A+ specification](https://promisesaplus.com/#the-promise-resolution-procedure).

## Example

```ts
import { isPromise, isNumber } from '@rnw-community/shared';


export const processInput = (input: unknown): Promise<boolean> | number => {
    if (isPromise(input)) {
        return input.then(() => true);
    } else if (isNumber(unput)) {
        return i;
    }

    return 'Unknown input';
};
```
