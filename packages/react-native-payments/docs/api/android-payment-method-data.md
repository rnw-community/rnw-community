# `AndroidPaymentMethodDataInterface` / `AndroidPaymentMethodDataDataInterface` / `AndroidAllowedAuthMethodsEnum`

The typed shape of the Android entry of `methodData`, and the enum restricting its `allowedAuthMethods`. Reach
for these when building the `AndroidPay` entry of your `methodData` array.

## How

| Type | Notes |
| --- | --- |
| `AndroidPaymentMethodDataInterface` | `supportedMethods: PaymentMethodNameEnum.AndroidPay` paired with an `AndroidPaymentMethodDataDataInterface` `data`. |
| `AndroidPaymentMethodDataDataInterface` | `supportedNetworks`, `environment`, `countryCode`, `currencyCode`, `gatewayConfig`, `allowedAuthMethods?`, `totalPriceStatus?`, `checkoutOption?`, `transactionId?` — see [platforms/android.md](../platforms/android.md) for every field. |
| `AndroidAllowedAuthMethodsEnum` | `PAN_ONLY`, `CRYPTOGRAM_3DS` — defaults to both when `allowedAuthMethods` is omitted. |

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
        environment: EnvironmentEnum.Test,
        countryCode: 'DE',
        currencyCode: 'EUR',
        gatewayConfig: { gateway: 'example', gatewayMerchantId: 'exampleGatewayMerchantId' },
    },
};

const allowedAuthMethods = [AndroidAllowedAuthMethodsEnum.PAN_ONLY];
```

## Pitfalls

`checkoutOption: 'COMPLETE_IMMEDIATE_PURCHASE'` is only allowed together with `totalPriceStatus: 'FINAL'` —
the constructor throws on any other combination. See [platforms/android.md](../platforms/android.md).

## References

- [platforms/android.md](../platforms/android.md)
- [api/payment-method-name-enum.md](./payment-method-name-enum.md)
