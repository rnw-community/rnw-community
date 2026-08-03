# `PaymentDetailsModifier`

## What & why

A per-`supportedMethods` override for `total` and `displayItems`. Reach for it when a payment method needs a
different price than the top-level `total` (e.g. an Apple Pay discount).

## How

| Member | Notes |
| --- | --- |
| `supportedMethods` | Matched against the platform's active payment method — see [api/payment-method-name-enum.md](./payment-method-name-enum.md). |
| `total` | Overrides the top-level `total` when matched. |
| `additionalDisplayItems` | Appended to `displayItems` when matched. |
| `data` | Validated for shape but not forwarded to native — the bridge has no per-method extension point for it. |

## Example

```ts
const paymentDetails = {
    total: { label: 'Total', amount: { currency: 'USD', value: '10.00' } },
    modifiers: [
        {
            supportedMethods: PaymentMethodNameEnum.ApplePay,
            total: { label: 'Total with Apple Pay discount', amount: { currency: 'USD', value: '9.00' } },
            additionalDisplayItems: [{ label: 'Apple Pay discount', amount: { currency: 'USD', value: '-1.00' } }],
        },
    ],
};
```

## Pitfalls

A modifier for the other platform's method is ignored. The same resolution re-runs on every `updateWith()` call,
so a listener can ship an updated `modifiers` array together with the rest of the update.

## References

- [W3C `PaymentDetailsModifier`](https://www.w3.org/TR/payment-request/#dom-paymentdetailsmodifier)
- [guides/modifiers.md](../guides/modifiers.md)
