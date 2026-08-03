# `IosPaymentMethodDataInterface` / `IosPaymentMethodDataDataInterface`

## What & why

The typed shape of the Apple Pay entry of `methodData`. Reach for these when building the `ApplePay` entry of
your `methodData` array.

## How

| Type | Notes |
| --- | --- |
| `IosPaymentMethodDataInterface` | `supportedMethods: PaymentMethodNameEnum.ApplePay` paired with an `IosPaymentMethodDataDataInterface` `data`. |
| `IosPaymentMethodDataDataInterface` | `merchantIdentifier`, `supportedNetworks`, `countryCode`, `currencyCode`, plus the iOS-only options in [platforms/ios.md](../platforms/ios.md) (`merchantCapabilities?` — [`IosPKMerchantCapability`](./ios-pk-merchant-capability.md), `shippingType`, `couponCode`, `applicationData`) and the cross-platform request flags below. |

`requestBillingAddress`, `requestPayerEmail`, `requestPayerName`, `requestPayerPhone` and `requestShipping` are
shared with [`AndroidPaymentMethodDataDataInterface`](./android-payment-method-data.md) (both extend the
package's common `GenericPaymentMethodDataDataInterface`): each is an optional boolean that, when `true`, adds
the matching field to the resulting `PaymentResponse` — see [api/payment-response.md](./payment-response.md).

## Example

```ts
const iosMethod: IosPaymentMethodDataInterface = {
    supportedMethods: PaymentMethodNameEnum.ApplePay,
    data: {
        merchantIdentifier: 'merchant.com.your-app.namespace',
        countryCode: 'US',
        currencyCode: 'USD',
        supportedNetworks: [SupportedNetworkEnum.Visa],
        merchantCapabilities: [
            IosPKMerchantCapability.PKMerchantCapability3DS,
            IosPKMerchantCapability.PKMerchantCapabilityDebit,
        ],
    },
};
```

## Pitfalls

`applicationData` is not transmitted to Apple but is included in the payment token as a SHA-256 hash
(`applicationDataHash`) — use it to prevent replay attacks by associating a payment with a specific transaction,
not to pass data your backend needs verbatim.

## References

- [platforms/ios.md](../platforms/ios.md)
- [api/payment-method-name-enum.md](./payment-method-name-enum.md)
- [api/ios-pk-merchant-capability.md](./ios-pk-merchant-capability.md)
