# Payment details modifiers

`details.modifiers` accepts an array of
[`PaymentDetailsModifier`](https://www.w3.org/TR/payment-request/#dom-paymentdetailsmodifier), one entry per
`supportedMethods`. The library picks the entry whose `supportedMethods` matches the platform's active payment
method (`PaymentMethodNameEnum.ApplePay` on iOS, `PaymentMethodNameEnum.AndroidPay` on Android) and applies it
before serializing details to native: `modifier.total` overrides the top-level `total` and
`modifier.additionalDisplayItems` is appended to `displayItems`. A modifier for the other platform's method is
ignored. The same resolution runs again on every `updateWith()` call, so a listener can ship an updated
`modifiers` array together with the rest of the update. `modifier.data` is validated for shape but not forwarded
to native — the bridge has no per-method extension point for it.

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

## References

- [`PaymentDetailsModifier`](https://www.w3.org/TR/payment-request/#dom-paymentdetailsmodifier)
- [api/payment-details-modifier.md](../api/payment-details-modifier.md)
