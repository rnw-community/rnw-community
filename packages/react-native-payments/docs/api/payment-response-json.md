# `PaymentResponseJsonInterface`

The return type of `PaymentResponse.toJSON()`, and what `JSON.stringify(paymentResponse)` produces. Reach for it
when you need the spec-shaped serialization of a response, e.g. to log or transmit it.

## How

| Member | Notes |
| --- | --- |
| `requestId`, `methodName`, `details` | Always present. |
| `shippingAddress`, `payerName`, `payerEmail`, `payerPhone` | Read from `details`; default to `null` when not requested. |
| `shippingOption` | Mirrors `PaymentRequest.shippingOption` at the moment `show()` resolved; `null` when shipping options were never offered. |

## Example

```ts
const json: PaymentResponseJsonInterface = paymentResponse.toJSON();
// { requestId, methodName, details, shippingAddress, shippingOption, payerName, payerEmail, payerPhone }
```

## Pitfalls

None — a pure serialization of `PaymentResponse`, always safe to call once `show()` has resolved.

## References

- [api/payment-response.md](./payment-response.md)
