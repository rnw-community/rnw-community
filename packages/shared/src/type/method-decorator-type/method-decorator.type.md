# `MethodDecoratorType<K>`

Typed method decorator that preserves the decorated method's signature via `TypedPropertyDescriptor<K>`.

> Replaces the loosely-typed built-in `MethodDecorator` with a generic version that constrains `K extends AnyFn`, enabling type-safe decorator factories.

## Example

```ts
import type { AnyFn, MethodDecoratorType } from '@rnw-community/shared';

const Retry = <K extends AnyFn>(maxRetries: number): MethodDecoratorType<K> =>
    (target, propertyKey, descriptor) => {
        const original = descriptor.value!;
        descriptor.value = (async (...args: Parameters<K>) => {
            for (let i = 0; i < maxRetries; i++) {
                try {
                    return await original.apply(target, args);
                } catch {
                    if (i === maxRetries - 1) throw;
                }
            }
        }) as K;

        return descriptor;
    };
```
