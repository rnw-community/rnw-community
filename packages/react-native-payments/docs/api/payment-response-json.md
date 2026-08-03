# `PaymentResponseJsonInterface`

## What & why

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
import type { PaymentResponseJsonInterface } from '@rnw-community/react-native-payments';

const paymentResponse = await paymentRequest.show();

const json: PaymentResponseJsonInterface = paymentResponse.toJSON();
// { requestId, methodName, details, shippingAddress, shippingOption, payerName, payerEmail, payerPhone }

json.requestId;
json.shippingAddress; // PaymentResponseAddressInterface | null

const serialized = JSON.stringify(paymentResponse); // same shape, via JSON.stringify's toJSON() hook
```

## Pitfalls

None — a pure serialization of `PaymentResponse`, always safe to call once `show()` has resolved.

## References

- [api/payment-response.md](./payment-response.md)
