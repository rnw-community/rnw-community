# `AbstractConstructor<T>`

Type representing an abstract class constructor that produces instances of `T`.

> Useful for NestJS DI tokens, service injection patterns, and any scenario where you need to reference an abstract class as a value (e.g., `@Inject(ServiceToken)`).

## Example

```ts
import type { AbstractConstructor } from '@rnw-community/shared';

interface LoggerInterface {
    log(message: string): void;
}

const createService = (LoggerToken: AbstractConstructor<LoggerInterface>) => {
    // Use LoggerToken as a NestJS injection token
    Inject(LoggerToken)(target, propertyKey);
};
```
