# `PaymentResponseAddressInterface`

The shape of `PaymentResponse.details.billingAddress` and `PaymentResponse.details.shippingAddress`, and of
`PaymentRequest.shippingAddress` while a change event is pending. Reach for it when reading a user's address off
a response or an in-progress shipping-address change.

## How

`details.billingAddress` and `details.shippingAddress` are always objects on the two concrete response classes
(`IosPaymentResponse`, `AndroidPaymentResponse`) — never absent — but every field is an empty string unless the
matching request flag was set:

| Platform | Populated when |
| --- | --- |
| iOS `billingAddress` | `requestBillingAddress` is `true`. |
| iOS `shippingAddress` | `requestShipping` is `true`. |
| Android `billingAddress` | `requestBillingAddress`, `requestPayerName` **or** `requestPayerPhone` is `true` — Google Pay returns the billing address whenever any of the three is requested, not only `requestBillingAddress`. |
| Android `shippingAddress` | `requestShipping` is `true`. |

`PaymentRequest.shippingAddress` (the in-progress change-event value, not the settled response) is
`Maybe<PaymentResponseAddressInterface>` — `null` until the first `shippingaddresschange` event arrives.

## Example

```ts
const response = await paymentRequest.show();

response.details.billingAddress; // PaymentResponseAddressInterface, empty strings if not requested
```

## Pitfalls

- Reading `response.billingAddress` directly (instead of `response.details.billingAddress`) reads `undefined` —
  see [api/payment-response.md](./payment-response.md).
- On Android, `billingAddress` is populated by `requestPayerName`/`requestPayerPhone` alone, even without
  `requestBillingAddress` — do not use its presence to infer that billing address was explicitly requested.
- On iOS the shipping address of a change event is **redacted** by PassKit: only `address2` (city), `address3`
  (state), `postalCode` and `countryCode` are filled, while the street and the payer name, email and phone stay
  empty until the payment is authorized — quote shipping from the postal code and the country, never from the
  street. See [guides/change-events.md](../guides/change-events.md#changed-values-on-the-request).

## References

- [api/payment-response.md](./payment-response.md)
- [guides/change-events.md](../guides/change-events.md)
