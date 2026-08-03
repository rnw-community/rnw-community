# `ConstructorError`

A native `TypeError` thrown from `new PaymentRequest(...)` when the input dictionaries fail W3C validation.
Reach for `instanceof TypeError` to catch it, matching the spec's WebIDL / `check and canonicalize (total)
amount` algorithm, which itself throws `TypeError`.

## How

| Check | Trigger |
| --- | --- |
| `instanceof TypeError` | Always true — `ConstructorError` is a `TypeError` subclass. |
| `name` | `'TypeError'` |
| Thrown from | Missing/invalid payment methods, total, display items or shipping options. |

## Example

```ts
try {
    new PaymentRequest([], paymentDetails);
} catch (error) {
    if (error instanceof TypeError) {
        // invalid constructor input
    }
}
```

## Pitfalls

Distinct from `DOMException NotSupportedError`, which is also thrown at construction time but only when the
input is otherwise valid and no platform-matching payment method exists — see
[architecture.md](../architecture.md).

## References

- [guides/errors.md](../guides/errors.md)
