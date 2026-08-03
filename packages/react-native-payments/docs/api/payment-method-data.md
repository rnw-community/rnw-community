# `PaymentMethodData`

## What & why

The generic W3C union type backing one entry of the `methodData` array passed to `new PaymentRequest(...)`. Reach
for it only when writing platform-agnostic helper code; concrete integrations use the platform-specific
`IosPaymentMethodDataInterface` / `AndroidPaymentMethodDataInterface` instead.

## How

`PaymentMethodData` is the union of `IosPaymentMethodDataInterface` and `AndroidPaymentMethodDataInterface`,
discriminated by `supportedMethods` (`PaymentMethodNameEnum`).

## Example

```ts
const methodData: PaymentMethodData[] = [
    {
        supportedMethods: PaymentMethodNameEnum.ApplePay,
        data: {
            merchantIdentifier: 'merchant.com.your-app.namespace',
            supportedNetworks: [SupportedNetworkEnum.Visa],
            countryCode: 'US',
            currencyCode: 'USD',
        },
    },
];
```

## Pitfalls

Prefer the platform-specific interfaces directly — see
[api/ios-payment-method-data.md](./ios-payment-method-data.md) and
[api/android-payment-method-data.md](./android-payment-method-data.md) — for full field-level typing instead of
this union.

## References

- [W3C `PaymentMethodData`](https://www.w3.org/TR/payment-request/#dom-paymentmethoddata)
- [api/payment-request.md](./payment-request.md)
