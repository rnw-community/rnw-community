# ReactNative Payments

[![npm version](https://badge.fury.io/js/%40rnw-community%2Freact-native-payments.svg)](https://badge.fury.io/js/%40rnw-community%2Freact-native-payments)
[![coverage](https://img.shields.io/codecov/c/github/rnw-community/rnw-community?flag=react-native-payments&label=coverage)](https://app.codecov.io/gh/rnw-community/rnw-community)
[![npm downloads](https://img.shields.io/npm/dm/%40rnw-community%2Freact-native-payments.svg)](https://www.npmjs.com/package/%40rnw-community%2Freact-native-payments)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

> Accept Payments with Apple Pay and Android Pay using the Payment Request API.

TurboModule-based implementation of the [W3C Payment Request API](https://www.w3.org/TR/payment-request/)
(08 September 2022) for React Native — full TypeScript, a unified iOS/Android API, and an Expo config plugin. A
rewrite of [naoufal/react-native-payments](https://github.com/naoufal/react-native-payments); see
[Migrating from upstream](docs/guides/migrate-from-upstream.md) if you are porting an existing integration.

## For AI agents

Start with [llms.txt](llms.txt) for a curated, agent-oriented index of this package's docs and [AGENTS.md](AGENTS.md)
for architecture and contributor conventions.

## Install

```bash
npm install @rnw-community/react-native-payments
```

Autolinking picks up the TurboModule on both architectures — no manual `react-native link` step. Complete the
one-time platform setup before writing any code:
[iOS](docs/getting-started/quickstart-ios.md) · [Android](docs/getting-started/quickstart-android.md) ·
[Expo](docs/getting-started/quickstart-expo.md).

## Quickstart

```ts
import {
    PaymentComplete,
    PaymentRequest,
    createApplePayMethodData,
    createGooglePayMethodData,
} from '@rnw-community/react-native-payments';

const methodData = [
    createApplePayMethodData({ merchantIdentifier: 'merchant.com.your-app', countryCode: 'US', currencyCode: 'USD' }),
    createGooglePayMethodData({
        countryCode: 'US',
        currencyCode: 'USD',
        gatewayConfig: { gateway: 'example', gatewayMerchantId: 'id' },
    }),
];
const paymentRequest = new PaymentRequest(methodData, {
    total: { label: 'Total', amount: { currency: 'USD', value: '10.00' } },
});

if (await paymentRequest.canMakePayment()) {
    const paymentResponse = await paymentRequest.show();
    const isConfirmed = await sendToYourBackend(paymentResponse.details); // your own gateway call

    await paymentResponse.complete(isConfirmed ? PaymentComplete.SUCCESS : PaymentComplete.FAIL);
}
```

[`createApplePayMethodData`](docs/api/create-apple-pay-method-data.md) and
[`createGooglePayMethodData`](docs/api/create-google-pay-method-data.md) fill in the defaults: Visa and Mastercard on
both platforms, plus the Google Pay `TEST` environment — pass `environment: EnvironmentEnum.PRODUCTION` for live
payments. Each one returns the plain `methodData` entry, so you can still write that object by hand — see
[api/ios-payment-method-data.md](docs/api/ios-payment-method-data.md) and
[api/android-payment-method-data.md](docs/api/android-payment-method-data.md) for the raw shape.

`sendToYourBackend` is where your payment service provider comes in — the
[gateway recipes](docs/guides/gateways/index.md) give the exact method data, token and server call for Stripe, Adyen,
Braintree and Checkout.com. Only call `complete(PaymentComplete.SUCCESS)` once your backend has actually confirmed the
charge. A
`PaymentRequest` is single-use — build a new one per payment attempt rather than reusing a settled request; see
[docs/architecture.md](docs/architecture.md).
[`createPaymentRequestFactory`](docs/api/create-payment-request-factory.md) builds a fresh request per attempt from
shared configuration. For shipping/coupon change events and payment details modifiers, see the [doc map](#doc-map)
below.

### Screenshots

Recording is deferred, not dropped — capture needs the on-device Maestro fleet, tracked in
[docs/roadmap.md](docs/roadmap.md#docs). Once captured, an Apple Pay and a Google Pay sheet GIF replace this
placeholder.

## Doc map

- **Getting started** — [Install](docs/getting-started/install.md) ·
  [iOS](docs/getting-started/quickstart-ios.md) · [Android](docs/getting-started/quickstart-android.md) ·
  [Expo](docs/getting-started/quickstart-expo.md)
- **Platforms** — [iOS](docs/platforms/ios.md) · [Android](docs/platforms/android.md) ·
  [Web](docs/platforms/web.md) · [Expo](docs/platforms/expo.md)
- **API reference** — [index](docs/api/index.md) (`PaymentRequest`, `PaymentResponse`, every exported type/enum)
- **Guides** — [Payment change events](docs/guides/change-events.md) ·
  [Payment details modifiers](docs/guides/modifiers.md) · [Error handling](docs/guides/errors.md) ·
  [Retrying a payment](docs/guides/retry.md) · [Unit testing](docs/guides/testing.md) ·
  [Setup doctor](docs/guides/setup-doctor.md) ·
  [Troubleshooting](docs/guides/troubleshooting.md)
- **Gateway recipes** — [Pick your gateway](docs/guides/gateways/index.md): [Stripe](docs/guides/gateways/stripe.md) ·
  [Adyen](docs/guides/gateways/adyen.md) · [Braintree](docs/guides/gateways/braintree.md) ·
  [Checkout.com](docs/guides/gateways/checkout-com.md) · [Direct tokenization](docs/guides/gateways/direct.md)
- **Architecture** — [The JS↔native contract, single-use requests, event lifecycle](docs/architecture.md)
- **Roadmap** — [Open work and the W3C compliance checklist](docs/roadmap.md)

## Migrating

- [From `v2` to `v3`](docs/guides/migrate-from-v2.md) — the native module interface change and the single-use
  request behavior change.
- [From upstream `react-native-payments`](docs/guides/migrate-from-upstream.md) — the full API mapping and a
  worked before/after example.

## W3C compliance

This package implements the [W3C Payment Request API](https://www.w3.org/TR/payment-request/) — change events,
`PaymentDetailsModifier`, `hasEnrolledInstrument()`, `retry()`, `toJSON()` and the event-handler attributes are
all implemented, with a small set of documented platform deviations (Android delivers only the shipping change
events, iOS ignores `shippingOption.selected`, `PaymentRequest` is single-use). See the full
[W3C compliance checklist](docs/roadmap.md#w3c-compliance-checklist) and each platform's known deviations in
[docs/platforms/](docs/platforms/).

## Architecture & contributing

See [AGENTS.md](AGENTS.md) for the source layout, TurboModule/Expo-plugin architecture, and coverage. For
end-to-end verification, see
[react-native-payments-example/e2e/readme.md](../react-native-payments-example/e2e/readme.md).

## License

This library is licensed under The [MIT License](./LICENSE.md).
