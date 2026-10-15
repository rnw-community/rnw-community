# iOS quickstart

The fastest path to an Apple Pay sheet. See [Platforms — iOS](../platforms/ios.md) for the full setup story
(capabilities, deviations, native code snippets).

1. Create an [Apple developer account](https://developer.apple.com/programs/enroll/) and a merchant ID.
2. Follow Apple's [Apple Pay configuration guide](https://developer.apple.com/library/archive/ApplePay_Guide/Configuration.html)
   to enable the capability and register the merchant ID.
3. Run `pod install` — the pod links `PassKit` itself, no `AppDelegate` import is needed (see
   [Platforms — iOS](../platforms/ios.md#native-setup)).
4. Build the Apple Pay method data with `createApplePayMethodData`, construct a `PaymentRequest` and call `show()`:

```ts
import { PaymentRequest, createApplePayMethodData } from '@rnw-community/react-native-payments';

const methodData = [
    createApplePayMethodData({ merchantIdentifier: 'merchant.com.your-app', countryCode: 'US', currencyCode: 'USD' }),
];
const paymentResponse = await new PaymentRequest(methodData, {
    total: { label: 'Total', amount: { currency: 'USD', value: '10.00' } },
}).show();
```

`supportedNetworks` defaults to Visa and Mastercard — see
[api/create-apple-pay-method-data.md](../api/create-apple-pay-method-data.md). To write the method data by hand
instead, pass `{ supportedMethods: PaymentMethodNameEnum.ApplePay, data: { merchantIdentifier, supportedNetworks,
countryCode, currencyCode } }` — see [api/ios-payment-method-data.md](../api/ios-payment-method-data.md). The
[readme quickstart](../../readme.md#quickstart) shows the full flow, including `complete()`.

`merchantIdentifier` passed to `methodData.data` must exactly match the merchant ID declared in the app's
`com.apple.developer.in-app-payments` entitlement, or the sheet fails with a merchant/entitlement error — see
[Troubleshooting](../guides/troubleshooting.md).
