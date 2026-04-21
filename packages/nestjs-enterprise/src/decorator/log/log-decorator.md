# `@Log` decorator

Method decorator that wires the NestJS `Logger` as a transport and logs lifecycle events for the decorated method. Handles sync, `Promise`, and `Observable` return shapes from a single decorator.

Log context is `ClassName::methodName`; empty-string hook results are skipped (no blank-message transport calls).

## Usage

```ts
import { Log } from '@rnw-community/nestjs-enterprise';

class CatsService {
    @Log('finding all cats', 'found all cats', 'failed to find cats')
    findAll(): string[] {
        return ['tom', 'jerry'];
    }
}
```

## Function hooks with automatic type narrowing

Every hook accepts either a string or a function. Callback parameter types are inferred from the decorated method — no annotations, no generics.

```ts
import { Log } from '@rnw-community/nestjs-enterprise';

class CatsService {
    @Log(
        (offset, limit) => `finding cats offset=${offset.toString()} limit=${limit.toString()}`,
        (result, durationMs, offset, limit) =>
            `found ${result.length.toString()} cats for offset=${offset.toString()} in ${durationMs.toFixed(1)}ms`,
        (error, durationMs, offset) => `failed at offset=${offset.toString()} after ${durationMs.toFixed(1)}ms: ${String(error)}`
    )
    async findAll(offset: number, limit: number): Promise<string[]> {
        return ['tom', 'jerry'].slice(offset, offset + limit);
    }
}
```

`offset`/`limit` are `number`, `result` is `string[]`, `error` is `unknown`, `durationMs` is `number` (method duration in milliseconds) — all inferred from `findAll`'s signature.

For `Observable<T>`-returning methods, `postLog` fires per emission (value-oriented) via `observableStrategy`, already wired inside the adapter.

## Hooks are optional

Omit any of the three to skip that lifecycle. `preLog` can also be omitted entirely (`@Log()` emits nothing).
