# @Log decorator

Class property decorator that logs the method name and its arguments when the method is called.

> Class name and method name are logged by default as the logger context property.

## Usage

```typescript
import {Log} from '@rnw-community/nestjs-enterprise';

class CatsService {
    @Log('Finding all cats', 'Successully found all cats', 'Failed to find all cats')
    findAll() {
        return 'This action returns all cats';
    }
}
```

> Decorator supports Promise, Observable and plain return types.

## PreLog, PostLog and ErrorLog handlers

Instead of passing strings to the `@Log` decorator, you can pass functions that will be called before the method is
called(`PreLog`), after the method is called(`PostLog`) and when the method throws an error respectively(`ErrorLog`).

> All log handlers provide full typescript support for the arguments and return type from the original method.

```typescript
import {Log} from '@rnw-community/nestjs-enterprise';

class CatsService {
    @Log(
        (offset, limit) => console.log(`Finding all cats ${offset} ${limit}`),
        (result, offset, limit) => console.log(`Successully found all cats ${result}, ${offset} ${limit}`),
        (error, offset, limit) => console.log(`Failed to find all cats ${offset} ${limit}`, error)
    )
    findAll(offset: number, limit: number): string[] {
        return `This action returns all cats ${offset} ${limit}`;
    }
}
```

> PostLog and ErrorLog are optional


## TODO

- [ ] Implement automatic logging based on the arguments and return type of the method
