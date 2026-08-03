# `PaymentDetailsInit`

The second constructor argument to `PaymentRequest`. Reach for it to type the `paymentDetails` object you build
before constructing a request.

## How

| Member | Required | Notes |
| --- | --- | --- |
| `total` | yes | The `PaymentItem` shown as the sheet's total — see [api/payment-item-shipping-option.md](./payment-item-shipping-option.md). |
| `displayItems` | no | Line items shown above the total. |
| `shippingOptions` | no | Offered shipping options — see [api/payment-item-shipping-option.md](./payment-item-shipping-option.md). |
| `modifiers` | no | Per-method total/display-item overrides — see [guides/modifiers.md](../guides/modifiers.md). |
| `id` | no | Generated with `uuid.v4()` when omitted. |

## Example

```ts
const paymentDetails: PaymentDetailsInit = {
    total: { label: 'Total', amount: { currency: 'USD', value: '10.00' } },
    displayItems: [{ label: 'Item', amount: { currency: 'USD', value: '10.00' } }],
};
```

## Pitfalls

The total, the display items and the shipping options all have to carry a valid decimal monetary value, or the
constructor throws `ConstructorError` — see [api/constructor-error.md](./constructor-error.md).

## References

- [W3C `PaymentDetailsInit`](https://www.w3.org/TR/payment-request/#dom-paymentdetailsinit)
- [api/payment-request.md](./payment-request.md)
