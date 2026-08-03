# `IosPKMerchantCapability`

## What & why

Populates the optional `merchantCapabilities` of the Apple Pay `methodData.data`, declaring which payment
processing capabilities the merchant supports. Reach for it only when the default set does not match your
merchant configuration.

## How

| Member | Meaning |
| --- | --- |
| `PKMerchantCapability3DS` | Supports 3-D Secure. |
| `PKMerchantCapabilityCredit` | Supports credit cards. |
| `PKMerchantCapabilityDebit` | Supports debit cards. |
| `PKMerchantCapabilityEMV` | Supports EMV-mode payment cards. |
| `PKMerchantCapabilityInstantFundsOut` | Supports instant funds out for eligible cards. |

`merchantCapabilities` defaults to `PKMerchantCapability3DS`, `PKMerchantCapabilityDebit` and
`PKMerchantCapabilityCredit` when omitted from
[`IosPaymentMethodDataDataInterface`](./ios-payment-method-data.md).

## Example

```ts
import { IosPKMerchantCapability } from '@rnw-community/react-native-payments';

const data = {
    merchantIdentifier: 'merchant.com.your-app.namespace',
    merchantCapabilities: [
        IosPKMerchantCapability.PKMerchantCapability3DS,
        IosPKMerchantCapability.PKMerchantCapabilityDebit,
    ],
};
```

## Pitfalls

None beyond matching the capabilities you actually support — PassKit rejects the request if none of the declared
capabilities match an available payment network.

## References

- [Apple `PKMerchantCapability`](https://developer.apple.com/documentation/passkit/pkmerchantcapability?language=objc)
- [api/ios-payment-method-data.md](./ios-payment-method-data.md)
