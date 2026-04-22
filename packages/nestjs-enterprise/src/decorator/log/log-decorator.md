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
        (result, offset, limit) =>
            `found ${result.length.toString()} cats for offset=${offset.toString()} limit=${limit.toString()}`,
        (error, offset) => `failed at offset=${offset.toString()}: ${String(error)}`
    )
    async findAll(offset: number, limit: number): Promise<string[]> {
        return ['tom', 'jerry'].slice(offset, offset + limit);
    }
}
```

`offset`/`limit` are `number`, `result` is `string[]`, `error` is `unknown` — all inferred from `findAll`'s signature.

For duration / latency metrics, reach for `@HistogramMetric` from `@rnw-community/nestjs-enterprise` — that is its purpose. `Log` is intentionally timing-free so the two concerns compose via stacked decorators without overlap.

For `Observable<T>`-returning methods, `postLog` fires per emission (value-oriented), already wired inside the adapter.

## Hooks are optional

Omit any of the three to skip that lifecycle. `preLog` can also be omitted entirely (`@Log()` emits nothing).
