# Android quickstart

The fastest path to a Google Pay sheet. See [Platforms — Android](../platforms/android.md) for the full setup
story (capabilities, deviations, dependency version).

1. Create a [Google developer account](https://support.google.com/googleplay/android-developer/answer/6112435?hl=en).
2. Follow Google's [Google Pay API for Android setup guide](https://developers.google.com/pay/api/android/guides/setup).
3. Depend on `com.google.android.gms:play-services-wallet:20.0.0` or newer — see
   [Platforms — Android](../platforms/android.md#native-setup) for the Gradle snippet.
4. Add your test Google account to the
   [Google Pay API Test Cards Allowlist](https://groups.google.com/g/googlepay-test-mode-stub-data?pli=1).
5. Build the Google Pay method data with `createGooglePayMethodData`, construct a `PaymentRequest` and call `show()`:

```ts
import { PaymentRequest, createGooglePayMethodData } from '@rnw-community/react-native-payments';

const methodData = [
    createGooglePayMethodData({
        countryCode: 'US',
        currencyCode: 'USD',
        gatewayConfig: { gateway: 'example', gatewayMerchantId: 'id' },
    }),
];
const paymentResponse = await new PaymentRequest(methodData, {
    total: { label: 'Total', amount: { currency: 'USD', value: '10.00' } },
}).show();
```

6. Pick your gateway: replace the `example` gateway, which only returns a placeholder token, with your payment
   service provider's `gatewayConfig` from the [gateway recipes](../guides/gateways/index.md).

`environment` defaults to `EnvironmentEnum.TEST` and `supportedNetworks` to Visa and Mastercard. Pass
`environment: EnvironmentEnum.PRODUCTION` for live payments — see
[api/create-google-pay-method-data.md](../api/create-google-pay-method-data.md). To write the method data by hand
instead, pass `{ supportedMethods: PaymentMethodNameEnum.AndroidPay, data: { supportedNetworks, environment,
countryCode, currencyCode, gatewayConfig } }` — see [api/android-payment-method-data.md](../api/android-payment-method-data.md).
The [readme quickstart](../../readme.md#quickstart) shows the full flow, including `complete()`.

`canMakePayment()` and `hasEnrolledInstrument()` on Android check Google Pay readiness against the same
`environment` set on `methodData.data` that `show()` uses. See [Platforms — Android](../platforms/android.md).
