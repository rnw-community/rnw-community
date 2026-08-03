# `DOMException`

## What & why

The spec-mandated runtime error for `created`/`interactive`/`closed` state violations and abort/not-supported
conditions. Reach for `instanceof DOMException` plus `error.name` to branch on the W3C error name.

## How

| Check | Trigger |
| --- | --- |
| `instanceof DOMException` | Always true for spec-mandated runtime states. |
| `error.name` | One of `AbortError`, `InvalidStateError`, `NotAllowedError`, `NotSupportedError`, `SecurityError` — see [api/payments-error-enum.md](./payments-error-enum.md). |

See [guides/errors.md](../guides/errors.md) for the full table of which public API failure produces which
`DOMException` name.

## Example

```ts
import { DOMException } from '@rnw-community/react-native-payments';

try {
    await paymentRequest.show();
} catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
        // user cancelled
    }
}
```

## Pitfalls

`SecurityError` is defined but not currently reachable from this implementation — no permission-policy check
exists in React Native.

## References

- [guides/errors.md](../guides/errors.md)
