# Migrating from `react-native-payments` (upstream)

This package started as a rewrite of [naoufal/react-native-payments](https://github.com/naoufal/react-native-payments),
the original — now unmaintained — library. The [readme](../../readme.md) summarizes the rewrite; this page maps
the concrete API surface so an existing integration can be ported.

## API mapping

| Upstream (`react-native-payments`) | This package (`@rnw-community/react-native-payments`) | Notes |
| --- | --- | --- |
| `npm install react-native-payments` + `react-native link` | `yarn add @rnw-community/react-native-payments` | Autolinked TurboModule — no manual linking step. See [getting-started/install.md](../getting-started/install.md). |
| `global.PaymentRequest = require('react-native-payments').PaymentRequest;` | `import { PaymentRequest } from '@rnw-community/react-native-payments';` | No global polyfill; import the class where you use it. |
| `supportedMethods: ['apple-pay']` / `['android-pay']` (string) | `supportedMethods: PaymentMethodNameEnum.ApplePay` / `PaymentMethodNameEnum.AndroidPay` (enum) | Same runtime values, typed. |
| `new PaymentRequest(methodData, details, options)` — 3rd arg `options.requestPayerName` etc. | `new PaymentRequest(methodData, details)` — payer/shipping flags live on each entry's `methodData.data` | No top-level `options` object. See [api/payment-request.md](../api/payment-request.md). |
| `paymentRequest.show()`, reusable after a rejection | `paymentRequest.show()` — **single-use**, `closed` once it settles | See [architecture.md](../architecture.md) and [migrate-from-v2.md](./migrate-from-v2.md). |
| `paymentRequest.abort()` | `paymentRequest.abort()` | Same name, TurboModule-backed, spec-mapped `DOMException` on misuse. |
| `addEventListener('shippingaddresschange' \| 'shippingoptionchange', e => e.updateWith(...))` | Same two, plus `paymentmethodchange` and the PassKit-only `couponcodechange` | Request-scoped native events, `isAnswered`, field-level errors. See [change-events.md](./change-events.md). |
| `paymentResponse.details.paymentData` / `transactionIdentifier` (iOS) | `paymentResponse.details.applePayToken` (`IosPKToken`) | One typed token object instead of loose fields. |
| `paymentResponse.details.getPaymentToken()` (Android, async) / `.paymentToken` (gateway) | `paymentResponse.details.androidPayToken` (`AndroidPaymentMethodToken`) | Synchronous typed field; no async indirection, no built-in gateway token. |
| `paymentResponse.complete('success' \| 'fail' \| 'unknown')` (string) | `paymentResponse.complete(PaymentComplete.SUCCESS \| PaymentComplete.FAIL \| PaymentComplete.UNKNOWN)` (enum) | Same three outcomes, typed — see [api/payment-complete-enum.md](../api/payment-complete-enum.md). |
| Built-in Stripe / Braintree add-on packages | Removed — bring your own gateway via `gatewayConfig` (Android) or the raw token (iOS) | Stripe/Braintree already ship their own maintained RN SDKs. |
| Untyped JS, legacy bridge module | Full TypeScript, TurboModule (New Architecture-ready) | See [architecture.md](../architecture.md). |
| Ad-hoc thrown errors, no stable identity | Spec-mapped `ConstructorError` / `DOMException` / `PaymentsError` | See [errors.md](./errors.md). |

## Worked example

Before (upstream, from the original readme's Apple Pay quickstart):

```js
// index.ios.js
global.PaymentRequest = require('react-native-payments').PaymentRequest;

const METHOD_DATA = [
    {
        supportedMethods: ['apple-pay'],
        data: {
            merchantIdentifier: 'merchant.com.your-app.namespace',
            supportedNetworks: ['visa', 'mastercard', 'amex'],
            countryCode: 'US',
            currencyCode: 'USD',
        },
    },
];

const DETAILS = {
    id: 'basic-example',
    displayItems: [{ label: 'Movie Ticket', amount: { currency: 'USD', value: '15.00' } }],
    total: { label: 'Merchant Name', amount: { currency: 'USD', value: '15.00' } },
};

const paymentRequest = new PaymentRequest(METHOD_DATA, DETAILS);

paymentRequest.show().then(paymentResponse => {
    const { transactionIdentifier, paymentData } = paymentResponse.details;

    return fetch('...', { method: 'POST', body: { transactionIdentifier, paymentData } })
        .then(res => res.json())
        .then(successHandler)
        .catch(errorHandler)
        .then(() => paymentResponse.complete('success'));
});
```

After (this package):

```ts
import {
    PaymentComplete,
    PaymentMethodNameEnum,
    PaymentRequest,
    SupportedNetworkEnum,
} from '@rnw-community/react-native-payments';

const methodData = [
    {
        supportedMethods: PaymentMethodNameEnum.ApplePay,
        data: {
            merchantIdentifier: 'merchant.com.your-app.namespace',
            supportedNetworks: [SupportedNetworkEnum.Visa, SupportedNetworkEnum.Mastercard, SupportedNetworkEnum.Amex],
            countryCode: 'US',
            currencyCode: 'USD',
        },
    },
];

const paymentDetails = {
    id: 'basic-example',
    displayItems: [{ label: 'Movie Ticket', amount: { currency: 'USD', value: '15.00' } }],
    total: { label: 'Merchant Name', amount: { currency: 'USD', value: '15.00' } },
};

const paymentRequest = new PaymentRequest(methodData, paymentDetails);

const paymentResponse = await paymentRequest.show();
const applePayToken = paymentResponse.details.applePayToken; // typed IosPKToken

let responseBody: unknown;
let backendAccepted = false;
let backendError: unknown;

try {
    const result = await fetch('...', { method: 'POST', body: JSON.stringify(applePayToken) });
    if (!result.ok) {
        throw new Error(`Backend rejected the payment: ${result.status}`);
    }
    responseBody = await result.json();
    backendAccepted = true;
} catch (error) {
    backendError = error;
}

// complete() is called exactly once, before either handler, so a throw from successHandler/errorHandler can
// never prevent it from running or trigger a second call.
await paymentResponse.complete(backendAccepted ? PaymentComplete.SUCCESS : PaymentComplete.FAIL);

if (backendAccepted) {
    successHandler(responseBody);
} else {
    errorHandler(backendError);
}
```

The differences that matter beyond syntax: no `global.PaymentRequest` polyfill, enums instead of string literals,
one typed `applePayToken` instead of loose `transactionIdentifier`/`paymentData` fields, and — most importantly —
this `paymentRequest` cannot `show()` again. A retry constructs a new `PaymentRequest` from the same
`methodData` / `paymentDetails`, matching [migrate-from-v2.md](./migrate-from-v2.md) above.
