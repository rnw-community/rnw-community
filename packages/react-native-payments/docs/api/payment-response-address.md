# `PaymentResponseAddressInterface`

The shape of `PaymentResponse.billingAddress` and `PaymentResponse.shippingAddress`, and of
`PaymentRequest.shippingAddress` while a change event is pending. Reach for it when reading a user's address off
a response or an in-progress shipping-address change.

## How

Present on `PaymentResponse` only when the matching `request*` flag (`requestBillingAddress` /
`requestShipping`) was set on `methodData.data`.

## Example

```ts
const response = await paymentRequest.show();

response.billingAddress; // PaymentResponseAddressInterface | null
```

## Pitfalls

On iOS the shipping address of a change event is **redacted** by PassKit: only `address2` (city), `address3`
(state), `postalCode` and `countryCode` are filled, while the street and the payer name, email and phone stay
empty until the payment is authorized — quote shipping from the postal code and the country, never from the
street. See [guides/change-events.md](../guides/change-events.md#changed-values-on-the-request).

## References

- [api/payment-response.md](./payment-response.md)
- [guides/change-events.md](../guides/change-events.md)
