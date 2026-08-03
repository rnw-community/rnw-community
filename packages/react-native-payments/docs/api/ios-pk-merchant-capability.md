# `IosPKMerchantCapability`

## What & why

Populates the optional `merchantCapabilities` of the Apple Pay `methodData.data`, declaring which payment
processing capabilities the merchant supports. Reach for it only when the default set does not match your
merchant configuration.

## How

| Member | Meaning | Accepted by this package's native bridge? |
| --- | --- | --- |
| `PKMerchantCapability3DS` | Supports 3-D Secure. | Yes |
| `PKMerchantCapabilityCredit` | Supports credit cards. | Yes |
| `PKMerchantCapabilityDebit` | Supports debit cards. | Yes |
| `PKMerchantCapabilityEMV` | Supports the EMV payment protocol — per Apple's guidance, only relevant for China UnionPay transactions; use `PKMerchantCapability3DS` for other networks. | Yes |
| `PKMerchantCapabilityInstantFundsOut` | Supports Instant Funds Out **disbursements** (`PKDisbursementRequest`), not ordinary purchase payments. | **No — see Pitfalls.** |

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

- **`PKMerchantCapabilityInstantFundsOut` is rejected by this package's native iOS bridge.**
  `merchantCapabilityFromString:` in `ios/Payments.mm` only maps `PKMerchantCapability3DS`,
  `PKMerchantCapabilityEMV`, `PKMerchantCapabilityCredit` and `PKMerchantCapabilityDebit` — passing
  `PKMerchantCapabilityInstantFundsOut` fails the native `merchantCapabilityFromString:` lookup and rejects the
  whole `show()` call with `invalid_merchant_capability`. This member exists on the TypeScript enum but is not
  currently usable through this package.
- PassKit also rejects the request if none of the (accepted) declared capabilities match an available payment
  network.

## References

- [Apple `PKMerchantCapability`](https://developer.apple.com/documentation/passkit/pkmerchantcapability?language=objc)
- [api/ios-payment-method-data.md](./ios-payment-method-data.md)
