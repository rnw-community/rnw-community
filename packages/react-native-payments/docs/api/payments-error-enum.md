# `PaymentsErrorEnum`

The message carried by every `DOMException` and rejection the library throws. Reach for it to compare against
`error.message`, though `error.name` is the more stable field to branch on.

## How

| Member | W3C error name |
| --- | --- |
| `AbortError` | User or code aborted the request. |
| `InvalidStateError` | Method called while the request/response is in the wrong state. |
| `NotAllowedError` | Not currently reachable from this implementation. |
| `NotSupportedError` | No platform-matching payment handler. |
| `SecurityError` | Defined but not currently reachable — no permission-policy check exists in React Native. |

Every `DOMException` also carries the W3C error name in `error.name`, which is the stable way to branch on the
failure. Native user cancellation (the person dismissing the payment sheet on either platform) is normalized to
an `AbortError` `DOMException`, matching the W3C behaviour.

## Example

```ts
paymentRequest.show().catch((error: Error) => {
    if (error.name === 'AbortError') {
        // the user dismissed the sheet
    }
});
```

## Pitfalls

Branch on `error.name`, not on `error.message` — the enum values back the message, but the name is the field the
W3C spec actually stabilizes.

## References

- [guides/errors.md](../guides/errors.md)
