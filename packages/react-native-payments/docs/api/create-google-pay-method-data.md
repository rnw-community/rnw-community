# `createGooglePayMethodData` / `GooglePayMethodDataOptions`

## What & why

Builds the Google Pay entry of the `methodData` array from the few fields that are specific to your merchant. Reach for
it instead of hand-writing `{ supportedMethods: PaymentMethodNameEnum.AndroidPay, data: { … } }` when the defaults below
match your integration.

## How

```ts
createGooglePayMethodData(options: GooglePayMethodDataOptions): AndroidPaymentMethodDataInterface
```

`GooglePayMethodDataOptions` is [`AndroidPaymentMethodDataDataInterface`](./android-payment-method-data.md) with
`environment` and `supportedNetworks` made optional. Every option is copied into `data` unchanged. Only the defaults
below are filled in:

| Option                            | Required    | Default when omitted                                                                                                                                    |
| --------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `currencyCode`                    | yes         | —                                                                                                                                                       |
| `gatewayConfig` or `directConfig` | exactly one | —                                                                                                                                                       |
| `countryCode`                     | no          | — (Google Pay requires it for EEA merchants)                                                                                                            |
| `environment`                     | no          | `EnvironmentEnum.TEST`                                                                                                                                  |
| `supportedNetworks`               | no          | `[SupportedNetworkEnum.Visa, SupportedNetworkEnum.Mastercard]`                                                                                          |
| `allowedAuthMethods`              | no          | Left unset — the request then sends `PAN_ONLY` and `CRYPTOGRAM_3DS`, see [android-allowed-auth-methods-enum.md](./android-allowed-auth-methods-enum.md) |

The function is pure: it has no native call, no platform check, and every result has its own `supportedNetworks`
array.

## Example

```ts
import { EnvironmentEnum, createGooglePayMethodData } from '@rnw-community/react-native-payments';

const googlePayMethodData = createGooglePayMethodData({
    countryCode: 'US',
    currencyCode: 'USD',
    gatewayConfig: { gateway: 'example', gatewayMerchantId: 'exampleGatewayMerchantId' },
    environment: __DEV__ ? EnvironmentEnum.TEST : EnvironmentEnum.PRODUCTION,
});
```

## Pitfalls

- `environment` defaults to `EnvironmentEnum.TEST`, which only returns test card data. Pass
  `EnvironmentEnum.PRODUCTION` for live payments.

## References

- [api/android-payment-method-data.md](./android-payment-method-data.md) — the raw shape this function returns
- [api/create-apple-pay-method-data.md](./create-apple-pay-method-data.md)
- [api/environment-enum.md](./environment-enum.md)
- [platforms/android.md](../platforms/android.md)
- [Google Pay `PaymentDataRequest`](https://developers.google.com/pay/api/android/reference/request-objects#PaymentDataRequest)
