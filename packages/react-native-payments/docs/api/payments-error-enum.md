# `PaymentsErrorEnum`

## What & why

The W3C `DOMException` **names** this library throws — `PaymentsErrorEnum.AbortError` etc. are the exact strings
assigned to `error.name`, not the human-readable message. Reach for it when constructing or comparing against a
`DOMException`'s `name`, e.g. in a custom native module shim or a test fixture.

## How

| Member | `error.name` value | Meaning |
| --- | --- | --- |
| `AbortError` | `'AbortError'` | User or code aborted the request. |
| `InvalidStateError` | `'InvalidStateError'` | Method called while the request/response is in the wrong state. |
| `NotAllowedError` | `'NotAllowedError'` | Not currently reachable from this implementation. |
| `NotSupportedError` | `'NotSupportedError'` | No platform-matching payment handler. |
| `SecurityError` | `'SecurityError'` | Defined but not currently reachable — no permission-policy check exists in React Native. |

Every `DOMException` sets `this.name` to the `PaymentsErrorEnum` member it was constructed with, so
`error.name` (not `error.message`) is the stable way to branch on the failure — `error.message` is a separate,
human-readable string (e.g. `"The operation was aborted."`) formatted independently of this enum. Native user
cancellation (the person dismissing the payment sheet on either platform) is normalized to an `AbortError`
`DOMException`, matching the W3C behaviour.

## Example

```ts
paymentRequest.show().catch((error: Error) => {
    if (error.name === 'AbortError') {
        // the user dismissed the sheet
    }
});
```

## Pitfalls

Branch on `error.name`, not `error.message` — `PaymentsErrorEnum` members are names, and the message text is an
implementation detail that can change without notice.

## References

- [guides/errors.md](../guides/errors.md)
- [api/dom-exception.md](./dom-exception.md)
