# `AndroidPaymentMethodDataInterface` / `AndroidPaymentMethodDataDataInterface`

## What & why

The typed shape of the Android entry of `methodData`. Reach for these when building the `AndroidPay` entry of
your `methodData` array.

## How

| Type | Notes |
| --- | --- |
| `AndroidPaymentMethodDataInterface` | `supportedMethods: PaymentMethodNameEnum.AndroidPay` paired with an `AndroidPaymentMethodDataDataInterface` `data`. |
| `AndroidPaymentMethodDataDataInterface` | `supportedNetworks`, `environment`, `countryCode`, `currencyCode`, `gatewayConfig`, `allowedAuthMethods?` ([`AndroidAllowedAuthMethodsEnum`](./android-allowed-auth-methods-enum.md)), `totalPriceStatus?`, `checkoutOption?`, `transactionId?` — see [platforms/android.md](../platforms/android.md) for every field. |

`requestBillingAddress`, `requestPayerEmail`, `requestPayerName`, `requestPayerPhone` and `requestShipping` are
shared with [`IosPaymentMethodDataDataInterface`](./ios-payment-method-data.md) (both extend the package's
common `GenericPaymentMethodDataDataInterface`): each is an optional boolean that, when `true`, adds the matching
field to the resulting `PaymentResponse` — see [api/payment-response.md](./payment-response.md).

## Example

```ts
const androidMethod: AndroidPaymentMethodDataInterface = {
    supportedMethods: PaymentMethodNameEnum.AndroidPay,
    data: {
        supportedNetworks: [SupportedNetworkEnum.Visa],
        environment: EnvironmentEnum.TEST,
        countryCode: 'DE',
        currencyCode: 'EUR',
        gatewayConfig: { gateway: 'example', gatewayMerchantId: 'exampleGatewayMerchantId' },
    },
};
```

## Pitfalls

`checkoutOption: 'COMPLETE_IMMEDIATE_PURCHASE'` is only allowed together with `totalPriceStatus: 'FINAL'` —
the constructor throws on any other combination. See [platforms/android.md](../platforms/android.md).

## References

- [platforms/android.md](../platforms/android.md)
- [api/payment-method-name-enum.md](./payment-method-name-enum.md)
- [api/android-allowed-auth-methods-enum.md](./android-allowed-auth-methods-enum.md)
