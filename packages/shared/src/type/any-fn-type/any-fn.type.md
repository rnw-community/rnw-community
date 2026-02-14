# `AnyFn`

Generic function type that matches any function signature.

> Useful as a constraint for generic type parameters that must be callable, avoiding the `@typescript-eslint/no-explicit-any` issues with inline `(...args: any) => any`.

## Example

```ts
import type { AnyFn } from '@rnw-community/shared';

const wrapWithLogging = <K extends AnyFn>(fn: K): K => {
    return ((...args: Parameters<K>): ReturnType<K> => {
        console.log('Called with', args);
        return fn(...args);
    }) as K;
};
```
