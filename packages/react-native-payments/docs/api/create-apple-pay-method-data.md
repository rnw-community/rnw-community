# `createApplePayMethodData` / `ApplePayMethodDataOptions`

## What & why

Builds the Apple Pay entry of the `methodData` array from the few fields that are specific to your merchant. Reach for it
instead of hand-writing `{ supportedMethods: PaymentMethodNameEnum.ApplePay, data: { … } }` when the defaults below
match your integration.

## How

```ts
createApplePayMethodData(options: ApplePayMethodDataOptions): IosPaymentMethodDataInterface
```

`ApplePayMethodDataOptions` is [`IosPaymentMethodDataDataInterface`](./ios-payment-method-data.md) with
`supportedNetworks` made optional. Every option is copied into `data` unchanged. Only the defaults below are filled in:

| Option                 | Required | Default when omitted                                                                                                                 |
| ---------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `merchantIdentifier`   | yes      | —                                                                                                                                    |
| `countryCode`          | yes      | —                                                                                                                                    |
| `currencyCode`         | yes      | —                                                                                                                                    |
| `supportedNetworks`    | no       | `[SupportedNetworkEnum.Visa, SupportedNetworkEnum.Mastercard]`                                                                       |
| `merchantCapabilities` | no       | Left unset — the request then uses `3DS`, `Debit` and `Credit`, see [ios-pk-merchant-capability.md](./ios-pk-merchant-capability.md) |

The function is pure: it has no native call, no platform check, and every result has its own `supportedNetworks`
array.

## Example

```ts
import { createApplePayMethodData } from '@rnw-community/react-native-payments';

const applePayMethodData = createApplePayMethodData({
    merchantIdentifier: 'merchant.com.your-app.namespace',
    countryCode: 'US',
    currencyCode: 'USD',
});
```

## References

- [api/ios-payment-method-data.md](./ios-payment-method-data.md) — the raw shape this function returns
- [api/create-google-pay-method-data.md](./create-google-pay-method-data.md)
- [platforms/ios.md](../platforms/ios.md)
- [Apple `PKPaymentRequest`](https://developer.apple.com/documentation/passkit/pkpaymentrequest)
