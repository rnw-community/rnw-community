# ReactNative Payments

[![npm version](https://badge.fury.io/js/%40rnw-community%2Freact-native-payments.svg)](https://badge.fury.io/js/%40rnw-community%2Freact-native-payments)
[![coverage](https://img.shields.io/codecov/c/github/rnw-community/rnw-community?flag=react-native-payments&label=coverage)](https://app.codecov.io/gh/rnw-community/rnw-community)
[![npm downloads](https://img.shields.io/npm/dm/%40rnw-community%2Freact-native-payments.svg)](https://www.npmjs.com/package/%40rnw-community%2Freact-native-payments)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

> Accept Payments with Apple Pay and Android Pay using the Payment Request API.

Implementation of [W3C Payment Request API(version 08 September 2022)](https://www.w3.org/TR/payment-request/) for React
Native.

> Currently not all the features described for the browsers are supported by this lib. Please feel free to open a PR.
> See [TODO](#todo)

This library represents a significant improvement over the
fantastic [react-native-payments](https://github.com/naoufal/react-native-payments) library, with the following enhancements:

- Complete Rewrite: The library has undergone a comprehensive refactoring and is now fully written
  in [TypeScript](https://www.typescriptlang.org).
- Native Type Support: We have introduced native types for both IOS and Android, ensuring full typing and detailed
  documentation.
- Unified API: With the aim of simplifying usage, the library now offers a unified API for both IOS and Android. You will no
  longer need code-dependent logic when utilizing the library, thanks to unified `interfaces/enums/types`.
- Enhanced Native Code: The IOS and JAVA native code has been thoroughly updated, refactored, and simplified. All deprecated
  code has been removed, ensuring better performance and stability.
- Streamlined Gateway Support: While Stripe/Braintree built-in gateway support has been removed, we continue to support
  custom gateways. The removal of built-in gateway support enables us to focus on providing better integration for custom
  solutions, especially since Stripe and Braintree already have their dedicated libraries.
- ReactNative's New Architecture: The library now
  supports [Turbo Modules](https://reactnative.dev/docs/the-new-architecture/pillars-turbomodules)., ensuring compatibility
  with ReactNative's latest architecture.

These enhancements ensure that the library is more efficient, maintainable, and future-proof, offering a seamless payment
integration experience for your applications.

## For AI agents

Start with [llms.txt](llms.txt) for a curated, agent-oriented index of this package's docs (API surface, payment
change events, platform deviations, migration notes, native contract, and E2E coverage) and [AGENTS.md](AGENTS.md)
for architecture and contributor conventions.

## Quickstart

The fastest path from an empty project to an open payment sheet. Every step links to the full section for the details
this condensed version skips.

1. **Install** the package with your package manager, e.g. `yarn add @rnw-community/react-native-payments`. Autolinking
   picks up the TurboModule on both architectures — no manual `react-native link` step.
2. **Platform setup** (once per platform, before writing any code):
   - iOS — [Apple Pay setup](#applepay-setup): Apple developer account, merchant ID, `PassKit` import in
     `AppDelegate`.
   - Android — [Android Pay setup](#androidpay-setup): Google developer account, `play-services-wallet` dependency,
     test-card allowlist.
   - Expo — [Expo setup](#expo-setup): the `app.plugin` entry plus `expo prebuild --clean`.
3. **Ship a payment** — construct a request, check capability, show the sheet, close it:

```ts
import {
    PaymentComplete,
    PaymentMethodNameEnum,
    PaymentRequest,
    SupportedNetworkEnum,
} from '@rnw-community/react-native-payments';

const methodData = [
    {
        // Add a matching AndroidPay entry to the same array to support both platforms — see #2 below.
        supportedMethods: PaymentMethodNameEnum.ApplePay,
        data: {
            merchantIdentifier: 'merchant.com.your-app.namespace',
            supportedNetworks: [SupportedNetworkEnum.Visa, SupportedNetworkEnum.Mastercard],
            countryCode: 'US',
            currencyCode: 'USD',
        },
    },
];
const paymentDetails = { total: { label: 'Total', amount: { currency: 'USD', value: '10.00' } } };

const paymentRequest = new PaymentRequest(methodData, paymentDetails);

if (await paymentRequest.canMakePayment()) {
    const paymentResponse = await paymentRequest.show();
    const isConfirmed = await sendToYourBackend(paymentResponse.details); // your own gateway call

    await paymentResponse.complete(isConfirmed ? PaymentComplete.Success : PaymentComplete.Fail);
}
```

Only call `complete(PaymentComplete.Success)` once your backend has actually confirmed the charge — completing with
`Success` before that point tells the sheet (and the user) the payment went through even if it didn't. See
[Creating an Instance](#2-creating-an-instance) for the full two-platform `methodData`, [Payment change events](#payment-change-events)
for shipping/coupon updates while the sheet is open, and [How it works](#how-it-works) for why a `PaymentRequest` is
single-use — build a new one per payment attempt rather than reusing a settled request.

### Screenshots

Recording is deferred — not a documentation gap, a scheduling one: capturing needs the on-device Maestro fleet, which
is at capacity. The `Docs` [TODO](#todo) below carries the exact capture command so this stays actionable instead of
silently dropped; once captured, an Apple Pay and a Google Pay sheet GIF replace this placeholder, showing the exact
flow from the snippet above.

## Features

- Streamlined. Say goodbye to complicated checkout forms.
- Efficient. Accelerate checkouts for higher conversion rates.
- Forward-looking. Utilize a [W3C Standards API](https://www.w3.org/) endorsed by major companies such as Google, Firefox,
  and more.
- Versatile. Share payment code seamlessly across iOS, Android, and web applications.

## Installation

1. Install package `@rnw-community/react-native-payments` using your package manager.

### ApplePay setup

- ApplePay [overview](https://developer.apple.com/apple-pay/planning/).
- Create [Apple developer account](https://developer.apple.com/programs/enroll/).
- Follow [this guide](https://developer.apple.com/library/archive/ApplePay_Guide/Configuration.html) to setup ApplePay in
  your application.
- [Payment token reference](https://developer.apple.com/documentation/passkit/apple_pay/payment_token_format_reference?language=objc)

#### Objective-C setup

- Add following code to your `AppDelegate.h`:

```objc
#import <RCTAppDelegate.h>
#import <UIKit/UIKit.h>
#import <PassKit/PassKit.h> // Add this import

@interface AppDelegate : RCTAppDelegate
```

#### Swift setup

- Add following code to your `AppDelegate.swift`:

```swift
import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import PassKit // Add this import
```

### AndroidPay setup

- Create [Google developer account](https://support.google.com/googleplay/android-developer/answer/6112435?hl=en).
- Follow [this guide](https://developers.google.com/pay/api/android/guides/setup) to setup Google Pay Api in your
  application.
- [Google payments tutorial](https://developers.google.com/pay/api/android/guides/tutorial)
- [Google brand guidelines](https://developers.google.com/pay/api/android/guides/brand-guidelines)

- Use should use `19.0.0+` version of Google play services in your application:

```groovy
dependencies {
    // The version of react-native is set by the React Native Gradle Plugin
    implementation("com.facebook.react:react-android")

    implementation 'com.google.android.gms:play-services-wallet:19.2.0'
```

- Your google account that are you using for testing should be added to [Google Pay API Test Cards Allowlist](https://groups.google.com/g/googlepay-test-mode-stub-data?pli=1)

### Expo setup

To integrate with Expo [custom builds](https://docs.expo.dev/custom-builds/get-started/), you need to add the `@rnw-community/react-native-payments` plugin into your `app.config.js`:

1. Update your `app.config.js` configuration:

```js
export default {
    plugins: [
      ...
      [
          "@rnw-community/react-native-payments/app.plugin",
          {
              "merchantIdentifier": "merchant.react-native-payments"
          }
      ],
    ],
  },
};
```

`merchantIdentifier` accepts either a single identifier or an array of identifiers. Pass an array when your app resolves the Apple Pay merchant per country/environment at runtime — every identifier is then declared in the `com.apple.developer.in-app-payments` entitlement. Empty identifiers are ignored; if no non-empty identifier remains, prebuild fails with an error:

```js
{
    "merchantIdentifier": ["merchant.react-native-payments.fr", "merchant.react-native-payments.mg"]
}
```

2. Prebuild your project:

```bash
npx expo prebuild --clean
```

## Usage

Detailed guide should be found at:

- [developer.mozilla.org](https://developer.mozilla.org/en-US/docs/Web/API/Payment_Request_API/Using_the_Payment_Request_API) as API is fully compliant.
- [Google Web Payments guide](https://web.dev/payments/).

The PaymentRequest class is designed to facilitate the integration of payment processing into your React Native application.
It leverages TypeScript for robust typing and ensures seamless payment experiences across both iOS and Android platforms.
Below is a comprehensive guide on how to use the PaymentRequest class effectively:

### 1. Importing the class

```ts
import { PaymentRequest } from '@rnw-community/react-native-payments';
```

### 2. Creating an Instance

```ts
import { PaymentMethodNameEnum, SupportedNetworkEnum } from '@rnw-community/react-native-payments/src';

const methodData = [
    // ApplePay example
    {
        supportedMethods: PaymentMethodNameEnum.ApplePay,
        data: {
            merchantIdentifier: 'merchant.com.your-app.namespace',
            supportedNetworks: [SupportedNetworkEnum.Visa, SupportedNetworkEnum.Mastercard],
            countryCode: 'US',
            currencyCode: 'USD',
            requestBillingAddress: true,
            requestPayerEmail: true,
            requestShipping: true,
            applicationData: JSON.stringify({
                transactionId: 'unique-transaction-id-12345',
                timestamp: new Date().toISOString(),
            }),
        },
    },
    // AndroidPay
    {
        supportedMethods: PaymentMethodNameEnum.AndroidPay,
        data: {
            supportedNetworks: [SupportedNetworkEnum.Visa, SupportedNetworkEnum.Mastercard],
            environment: EnvironmentEnum.Test,
            countryCode: 'DE',
            currencyCode: 'EUR',
            requestBillingAddress: true,
            requestPayerEmail: true,
            requestShipping: true,
            totalPriceStatus: 'ESTIMATED',
            gatewayConfig: {
                gateway: 'example',
                gatewayMerchantId: 'exampleGatewayMerchantId',
            },
        },
    },
];

const paymentDetails = {
    // Provide payment details such as total amount, currency, and other relevant information
};

const paymentRequest = new PaymentRequest(methodData, paymentDetails);
```

> Note: The `methodData` parameter is an array of `PaymentMethodData` objects that represent
> the supported payment methods in your application. Each `PaymentMethodData` object should have a `supportedMethods`
> property specifying the type of payment method (e.g., `PaymentMethodNameEnum.AndroidPay`
> or `PaymentMethodNameEnum.ApplePay`)
> and a data property containing the corresponding platform-specific data.

#### 2.1 Additional methodData.data options

Depending on the platform and payment method, you can provide additional data to the `methodData.data` property:

- `environment`: This property represents the Android environment for the payment.
- `totalPriceStatus`: An optional Google Pay field describing how the total price will change: `'FINAL'` (default), `'ESTIMATED'` or `'NOT_CURRENTLY_KNOWN'`. A zero total amount (`'0.00'`) is valid per the W3C spec and can be combined with a non-final status when the price is not known upfront. See [TransactionInfo](https://developers.google.com/pay/api/android/reference/request-objects#TransactionInfo).
- `checkoutOption`: An optional Google Pay field selecting the payment sheet submit behavior: `'DEFAULT'` or `'COMPLETE_IMMEDIATE_PURCHASE'`. Google Pay only allows `'COMPLETE_IMMEDIATE_PURCHASE'` together with the `'FINAL'` `totalPriceStatus`, so the constructor throws on any other combination.
- `transactionId`: An optional Google Pay field with a unique identifier for correlating the payment attempt in Google Pay transaction events.
- `requestPayerName`: "An optional boolean field that, when present and set to true, indicates that the `PaymentResponse` will include the name of the payer.
- `requestPayerPhone`: "An optional boolean field that, when present and set to true, indicates that the `PaymentResponse` will include the phone of the payer.
- `requestBillingAddress`: An optional boolean field that, when present and set to true, indicates that the `PaymentResponse` will
  include the billing address of the payer.
- `requestPayerEmail`: An optional boolean field that, when present and set to true, indicates that the `PaymentResponse` will
  include the email address of the payer.
- `requestShipping`: An optional boolean field that, when present and set to true, indicates that the `PaymentResponse` will
  include the shipping address of the payer.
- `applicationData`: An optional string or object field for Apple Pay that allows you to store application-specific data. This data is not transmitted to Apple but is included in the payment token as a SHA-256 hash (applicationDataHash). You can use it to prevent replay attacks by associating a payment with a specific transaction.
- `couponCode`: An optional Apple Pay field, **beyond the W3C specification**, that prefills the coupon code field of the
  payment sheet. The field itself is only rendered when a `couponcodechange` listener is registered before `show()`, so
  the option is a no-op without one, below iOS 15 and on Android.

```ts
// Example of using applicationData with Apple Pay
const methodData = [
    {
        supportedMethods: PaymentMethodNameEnum.ApplePay,
        data: {
            merchantIdentifier: 'merchant.com.your-app.namespace',
            supportedNetworks: [SupportedNetworkEnum.Visa, SupportedNetworkEnum.Mastercard],
            countryCode: 'US',
            currencyCode: 'USD',
            applicationData: JSON.stringify({
                transactionId: 'unique-transaction-id-12345',
                timestamp: new Date().toISOString(),
            }),
        },
    },
];
```

#### 2.2 Supported networks

`supportedNetworks` accepts the `SupportedNetworkEnum` members. Apple Pay introduced some of them after the oldest
supported iOS version, so they only resolve on a recent enough device and are rejected as an invalid supported network
below it: `girocard` (iOS 14), `mir` (iOS 14.5), `dankort` (iOS 15.1) and `bancontact` (iOS 16).

> `SupportedNetworkEnum.Mir` is **deprecated**. Apple delisted the network over the sanctions against the issuing banks,
> so it resolves on iOS 14.5+ and keeps an existing integration building, but no Mir card can be provisioned into Apple
> Pay anymore. It is kept functional instead of being removed so upgrading does not break a build; do not add it to a new
> integration.

#### 2.3 Pending amounts

Every `PaymentItem` — the `total` and each entry of `displayItems` — accepts the W3C `pending` flag for an amount that is
not final yet, a shipping price that still has to be quoted for instance. Apple Pay renders such a row with `Pending`
instead of the amount (`PKPaymentSummaryItemTypePending`); Google Pay has no equivalent and ignores the flag.

```ts
const paymentDetails = {
    total: { label: 'Total', amount: { currency: 'USD', value: '10.00' } },
    displayItems: [{ label: 'Shipping', amount: { currency: 'USD', value: '0.00' }, pending: true }],
};
```

#### 2.4 Payment details modifiers

`details.modifiers` accepts an array of [`PaymentDetailsModifier`](https://www.w3.org/TR/payment-request/#dom-paymentdetailsmodifier),
one entry per `supportedMethods`. The library picks the entry whose `supportedMethods` matches the platform's active
payment method (`PaymentMethodNameEnum.ApplePay` on iOS, `PaymentMethodNameEnum.AndroidPay` on Android) and applies it
before serializing details to native: `modifier.total` overrides the top-level `total` and `modifier.additionalDisplayItems`
is appended to `displayItems`. A modifier for the other platform's method is ignored. The same resolution runs again on
every `updateWith()` call, so a listener can ship an updated `modifiers` array together with the rest of the update.
`modifier.data` is validated for shape but not forwarded to native — the bridge has no per-method extension point for it.

```ts
const paymentDetails = {
    total: { label: 'Total', amount: { currency: 'USD', value: '10.00' } },
    modifiers: [
        {
            supportedMethods: PaymentMethodNameEnum.ApplePay,
            total: { label: 'Total with Apple Pay discount', amount: { currency: 'USD', value: '9.00' } },
            additionalDisplayItems: [{ label: 'Apple Pay discount', amount: { currency: 'USD', value: '-1.00' } }],
        },
    ],
};
```

### 3. Checking Payment Capability

Before displaying the payment sheet to the user, you can check if the current device supports the payment methods specified:

```ts
const isPaymentPossible = await paymentRequest.canMakePayment();
```

This method returns a boolean value indicating whether the device supports the specified payment methods.

> The `PaymentRequest` class automatically handles platform-specific payment data based on the provided methodData.

### 4. Displaying the Payment Sheet

Once you have verified the device's capability, you can proceed to display the payment sheet for the user to complete the
transaction:

```ts
try {
    const paymentResponse = await paymentRequest.show();
    // Handle the payment response here
} catch (error) {
    // Handle errors or user cancellation
}

// or Promise style
const paymentResponse = paymentRequest.show().then(...).catch(...);
```

The `paymentRequest.show()` method returns a promise that resolves with a `PaymentResponse` object representing the user's
payment response.

> **A `PaymentRequest` is single-use.** As soon as `show()` settles — resolved, rejected or aborted — the request moves to
> the `closed` state per the W3C specification, its change-event listeners are released and every further `show()` rejects
> with a `DOMException` carrying `InvalidStateError`. Build a new `PaymentRequest` to retry a payment.

### 5. Processing the PaymentResponse

To send all the relevant payment information to the backend (BE) for further processing and validation, you need to extract
the required data from the `PaymentResponseDetailsInterface` object.
The `PaymentResponseDetailsInterface` provides various properties that encompass essential details about the payment,
including the payment method used, the payer's information, and transaction-related information.

```ts
const paymentResponse = paymentRequest.show().then((paymentResponse) => {
    // This field will have all Android payment token info AndroidPaymentMethodToken
    paymentResponse.androidPayToken;
    // This field will have all IOS payment token info IosPKToken
    paymentResponse.applePayToken;
    // Aditionally if was requested, shipping, billing and payer info would be available
    paymentResponse.billingAddress;
    paymentResponse.payerEmail;
    paymentResponse.payerName;
    paymentResponse.payerPhone;
    paymentResponse.shippingAddress;
    // Send data to your BE
    // Close paymnet sheet
}).catch(...);
```

The `PaymentResponseDetailsInterface` includes the following additional properties:

- `billingAddress`: This property represents user billing details `PaymentResponseAddressInterface` and available if was requested in the `PaymentRequest`.
- `shippingAddress`: This property represents user shipping details `PaymentResponseAddressInterface` and available if was requested in the `PaymentRequest`.
- `payerEmail`: This property represents user email and available if was requested in the `PaymentRequest`.
- `payerPhone`: This property represents user phone and available if was requested in the `PaymentRequest`.
- `androidPayToken`: This property represents `PaymentToken` information returned by `AndroidPay`, this should be sent to your payment provider.
- `applePayToken`: This property represents `PaymentToken` information returned by `ApplePay`, this should be sent to your payment provider.

### 6. Closing the Payment Sheet

Once the payment process is successfully completed, it's essential to close the payment sheet by calling the
`PaymentResponse.complete()` method. This method takes a parameter from the `PaymentComplete` enum to indicate the outcome of
the
payment and hide the payment sheet accordingly.

```ts
paymentResponse.complete(PaymentComplete.Success); // OR PaymentComplete.Fail
```

> This will have no affect in the Android platform due to AndroidPay implementation.

### 7. Aborting the Payment

The `PaymentRequset.abort()` method in the Payment Request API allows developers to programmatically cancel an ongoing
payment request or dismiss
the payment sheet when it is in an interactive state. This method is used to handle scenarios where the user decides to
cancel the
payment process or when specific conditions require the payment request to be aborted.

> This will have no affect in the Android platform due to AndroidPay implementation.

## Error Handling

Every throw/reject in this package maps to one of three error shapes:

- **`ConstructorError`** — a native `TypeError` (`instanceof TypeError`, `name === 'TypeError'`) for `new PaymentRequest(...)`
  validation failures: missing/invalid payment methods, total, display items or shipping options. This matches the W3C
  algorithm, which validates the constructor's dictionaries via WebIDL and `check and canonicalize (total) amount`, both of
  which throw `TypeError`.
- **`DOMException`** (`instanceof DOMException`, `error.name` is the W3C name) — for the spec-mandated runtime states:
  `AbortError`, `InvalidStateError`, `NotAllowedError`, `NotSupportedError`. `SecurityError` is defined but not currently
  reachable from this implementation (no permission-policy check exists in React Native).
- **`PaymentsError`** — a plain domain error (`instanceof Error`, `name === 'Error'`) for failures the W3C spec does not
  name: `show()` rejecting with a non-`Error` reason from the native module bridge (an `Error` reason is propagated
  as-is instead), every `abort()` rejection from the native module bridge regardless of the rejection reason's type,
  and a native payment response payload that fails to parse (malformed or syntactically valid but incomplete JSON from
  the platform SDK, including direct construction of `AndroidPaymentResponse`/`IosPaymentResponse` with malformed
  tokenization data).

```ts
import { DOMException } from '@rnw-community/react-native-payments';

try {
    await paymentRequest.show();
} catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
        // user cancelled
    }
}
```

| Public API failure                                              | Spec-mandated error       | Implemented as                        |
| ----------------------------------------------------------------- | -------------------------- | -------------------------------------- |
| `new PaymentRequest()` with no/invalid payment methods             | `TypeError`                | `ConstructorError` (`instanceof TypeError`) |
| `new PaymentRequest()` with missing/invalid/negative total         | `TypeError`                | `ConstructorError`                     |
| `new PaymentRequest()` with invalid display items                  | `TypeError`                | `ConstructorError`                     |
| `new PaymentRequest()` with invalid shipping options                | `TypeError`                | `ConstructorError`                     |
| `new PaymentRequest()` with no platform-matching payment method     | `NotSupportedError`        | `DOMException` (thrown at construction, see [Known deviations](#known-deviations)) |
| `canMakePayment()` when not `created`                               | `InvalidStateError`        | `DOMException`                         |
| `show()` when not `created`                                        | `InvalidStateError`        | `DOMException`                         |
| `show()` after the user cancels the native sheet                    | `AbortError`               | `DOMException`                         |
| `abort()` when not `interactive`                                    | `InvalidStateError`        | `DOMException`                         |
| `abort()` resolves a pending `show()`                                | `AbortError`               | `DOMException`                         |
| `PaymentRequestUpdateEvent.updateWith()` called twice for one event  | `InvalidStateError`        | `DOMException`                         |
| `PaymentResponse.complete()` / `retry()` called after `complete()`   | `InvalidStateError`        | `DOMException`                         |
| Native module bridge rejects `show()` with a non-`Error` reason     | *(not specified)*          | `PaymentsError`                        |
| Native module bridge rejects `abort()` (any reason)                 | *(not specified)*          | `PaymentsError`                        |
| Native payment response payload is malformed or incomplete JSON (incl. direct `AndroidPaymentResponse`/`IosPaymentResponse` construction) | *(not specified)* | `PaymentsError` |
| An `updateWith()` listener answers with an invalid total/items/options | *(not specified — spec treats this as no update)* | Logged via `console.warn`, change event answered with unchanged details |
| Native module is not linked (`Payments` bridge missing)              | *(not specified — build/config error)* | `Error` |

## Payment change events

While the payment sheet is open the user can change the shipping address, the shipping option, the payment card or a
coupon code. `PaymentRequest` models these as W3C change events: register listeners **before** calling `show()` and answer
each event with `PaymentRequestUpdateEvent.updateWith()`.

> **Platform support.** On iOS the events are delivered by PassKit: the payment sheet waits for the answer of a listener
> and is completed with the unchanged details whenever there is no listener for the event type, the listener fails or the
> sheet is torn down, so it can never hang. On Android the Google Pay sheet runs in its own activity and never asks the
> app for an in-sheet update, so listeners can be registered but never fire. On web the browser's own `PaymentRequest` is
> used, so change events there follow the browser implementation. A request without listeners shows the same sheet with
> the same summary items as before — PassKit now asks the app on every change and is answered immediately with no change,
> which is a main thread round trip and no longer a purely local update. The end to end verification on devices is tracked
> in [#393](https://github.com/rnw-community/rnw-community/issues/393).
>
> iOS only shows the shipping method picker and the coupon code field (iOS 15+) when a `shippingoptionchange` /
> `couponcodechange` listener is registered before `show()` — `details.shippingOptions` are passed to PassKit in that case.

### `PaymentRequest.addEventListener(type, listener)`

Registers the listener for one of `shippingaddresschange`, `shippingoptionchange`, `paymentmethodchange` or
`couponcodechange` (the last one is a PassKit extension, not part of the W3C specification). Several listeners can be
registered for the same event type — they run in registration order and the same function is never registered twice.
Dispatch stops at the first listener that answers with `updateWith`, exactly like the stop immediate propagation flag of
the W3C algorithm. One native subscription is kept per event type no matter how many listeners are added and removed, and
events are scoped to the request they belong to, so concurrent `PaymentRequest` instances never see each other's events.
Listeners are released when `show()` settles and when `abort()` resolves; registering on a closed request does nothing
because a request is single-use — create a new `PaymentRequest` to show the sheet again.

```ts
paymentRequest.addEventListener('shippingaddresschange', event => {
    event.updateWith({
        total: { label: 'Total', amount: { currency: 'USD', value: '25.00' } },
        displayItems: [{ label: 'Shipping', amount: { currency: 'USD', value: '5.00' } }],
    });
});
```

### `PaymentRequest.removeEventListener(type, listener)`

Removes the passed listener from the event type, matching the `EventTarget` signature. The native subscription is released
once the last listener of the type is gone, and native is told about the remaining event types right away — also while the
payment sheet is open.

```ts
paymentRequest.removeEventListener('shippingaddresschange', onShippingAddressChange);
```

### `PaymentRequestUpdateEvent.updateWith(detailsOrPromise)`

Answers the event with updated `PaymentDetailsUpdate` — `total`, `displayItems`, `shippingOptions` and `error` are all
optional and only the provided members replace the current details. It accepts a promise, so a listener can await a server
call before answering:

```ts
paymentRequest.addEventListener('shippingoptionchange', async event => {
    const quote = await fetch(`https://example.com/quote?option=${paymentRequest.shippingOption}`).then(response =>
        response.json()
    );

    event.updateWith({
        total: { label: 'Total', amount: { currency: 'USD', value: quote.total } },
        shippingOptions: [{ id: 'express', label: 'Express', amount: { currency: 'USD', value: quote.shipping } }],
    });
});
```

Every `PaymentShippingOption` needs an `id`, a `label` and an `amount`, because iOS renders the row from the label and the
amount and reports the selection back by the id. `detail` is optional and is shown by Apple Pay as the secondary line of
the row (`PKShippingMethod.detail`); `amount.currency` is ignored because the sheet is already bound to the
`currencyCode` of the method data. The initial `details.shippingOptions` and the ones answered with `updateWith` go
through the same conversion, so the same option always renders the same row.

> `selected` is part of the W3C dictionary but is **silently ignored on iOS**: PassKit has no preselection support and
> always shows its shipping-method picker with the first option of the array highlighted. Put the option you want
> preselected first in `shippingOptions` instead of relying on `selected`.

```ts
const shippingOptions = [
    { id: 'express', label: 'Express', detail: 'Next business day', amount: { currency: 'USD', value: '5.00' } },
    { id: 'ground', label: 'Ground', detail: '3-5 business days', amount: { currency: 'USD', value: '0.00' } },
];
```

Calling `updateWith` twice, or calling it once the event was already answered or the request is no longer showing, throws
a `DOMException` with `InvalidStateError`. A listener that throws, rejects, sends invalid details, never calls `updateWith`
or leaves its promise pending for more than 30 seconds is logged and answered with the unchanged details, so the payment
sheet never stalls. Updated details go through the same validation as the ones passed to the constructor — the total, the
display items and the shipping options all have to carry a valid decimal monetary value, and a shipping option also has
to carry an id and a label — so a malformed amount is reported to the console and never reaches the sheet.

### Sheet errors

`error` is either a plain string or a field level error that Apple Pay renders inline, next to the offending row of the
sheet, instead of as a generic banner. A string keeps the previous behaviour: an unserviceable shipping address for
`shippingaddresschange`, an invalid coupon code for `couponcodechange` (iOS 15+) and a generic payment error everywhere
else. `shippingoptionchange` has no error slot in PassKit, so an error answered there is ignored.

A field level error carries the discriminator, the field it belongs to and the message shown to the user:

```ts
import {
    PaymentAddressFieldEnum,
    PaymentContactFieldEnum,
    PaymentUpdateErrorTypeEnum,
} from '@rnw-community/react-native-payments';

paymentRequest.addEventListener('shippingaddresschange', event => {
    event.updateWith({
        error: {
            type: PaymentUpdateErrorTypeEnum.ShippingAddressField,
            key: PaymentAddressFieldEnum.PostalCode,
            message: 'We do not ship to this postal code',
        },
    });
});

paymentRequest.addEventListener('couponcodechange', event => {
    event.updateWith({
        error: { type: PaymentUpdateErrorTypeEnum.CouponCode, expired: true, message: 'SALE10 expired last week' },
    });
});
```

| `error.type`           | Additional member                | iOS `PKPaymentErrorDomain` error                                            |
| ---------------------- | -------------------------------- | --------------------------------------------------------------------------- |
| `shippingAddressField` | `key: PaymentAddressFieldEnum`   | `paymentShippingAddressInvalidErrorWithKey:`                                |
| `contactField`         | `field: PaymentContactFieldEnum` | `paymentContactInvalidErrorWithContactField:`                               |
| `couponCode`           | `expired?: boolean`              | `paymentCouponCodeInvalidError` / `paymentCouponCodeExpiredError` (iOS 15+) |

`PaymentAddressFieldEnum` maps onto the `CNPostalAddress` keys PassKit accepts: `addressLine` (street), `city`,
`country` (ISO country code), `dependentLocality` (sub locality), `postalCode`, `region` (state) and
`subAdministrativeArea`. `PaymentContactFieldEnum` maps onto `PKContactField`: `email`, `name`, `phone` and
`postalAddress`. An unknown field, an empty message or a coupon error below iOS 15 is dropped and the sheet is answered
with the updated details only. Android ignores every error because Google Pay never asks the app for an in-sheet update.

### `PaymentRequestUpdateEvent.isAnswered`

`true` once `updateWith` was called for the event. A listener built from several helpers can check it before answering a
second time:

```ts
paymentRequest.addEventListener('shippingoptionchange', event => {
    applyExpressSurcharge(event);

    if (!event.isAnswered) {
        event.updateWith({ total: { label: 'Total', amount: { currency: 'USD', value: '25.00' } } });
    }
});
```

### `PaymentMethodChangeEvent`

The event delivered for `paymentmethodchange` extends `PaymentRequestUpdateEvent` with the selected method:

```ts
paymentRequest.addEventListener('paymentmethodchange', event => {
    if (event.methodDetails?.['network'] === 'Amex') {
        event.updateWith({ error: 'Amex is not supported for this order' });
    }
});
```

### Changed values on the request

Before a listener runs, the changed value is stored on the request: `paymentRequest.shippingAddress`
(`PaymentResponseAddressInterface`), `paymentRequest.shippingOption` (the selected `PaymentShippingOption` id) and
`paymentRequest.couponCode`. On iOS the shipping address of a change event is **redacted** by PassKit: only `address2`
(city), `address3` (state), `postalCode` and `countryCode` are filled, while the street and the payer name, email and
phone stay empty until the payment is authorized — quote shipping from the postal code and the country, never from the
street. `paymentRequest.updating` is `true` while an event is being processed; a change event that
arrives during that window is answered with the unchanged details and is not dispatched to the listeners, but its
selection is still stored on the request, so these values always describe what the sheet shows right now.

## How it works

`PaymentRequest` is a thin JS state machine (`created` → `interactive` → `closed`) sitting on top of one TurboModule,
`Payments` (`NativePayments.ts` → `Payments.mm` on iOS, `PaymentsModule.java` on Android). Method calls (`show`,
`abort`, `canMakePayment`) go JS → native directly through the module. Change events flow the other way — native →
JS — through a `NativeEventEmitter` built over the same module handle, scoped to the request that is currently on
screen:

```text
 JS                                            Native (PassKit / Google Pay)
 ┌────────────────────────┐  show(requestId, …)  ┌───────────────────────────────┐
 │ PaymentRequest          │ ───────────────────▶ │ Payments TurboModule          │
 │ created -> interactive  │                       │ (Payments.mm / …Module.java) │
 └────────────┬────────────┘                       └───────────────┬───────────────┘
              │ addEventListener(type)                              │
              │ ── setActiveEvents(requestId, types) ──────────────▶│
              │                                                     │
              │◀─ shippingaddresschange {requestId, eventId, …} ────┤  (request-scoped emit)
              ▼
 ChangeEventDispatcher.dispatch(listeners)
              │ listener runs, calls updateWith(details) — or times out (changeEventTimeoutMs)
              ▼
 updatePaymentDetails(update, displayItems, shippingOptions) ───────▶  resolves the *pending*
   update = { requestId, eventId, eventName, total, error }           completion for that eventId
              │
              ▼
 show() resolves/rejects ── closeRequest() ──▶  state: closed  (single-use — see below)
```

**Why events are request-scoped.** The native module is a singleton — exactly one sheet can be interactive at a time —
but a JS app can construct several `PaymentRequest` instances in a session (retries, different carts). `show()` passes
the request's own `id`, native adopts it as the `activeRequestId`, and every event and completion carries `requestId` /
`eventId` so a second request can never intercept or answer the first one's events. The full contract — every native
method, payload shape and teardown path — is documented in
[get-native-payments-event-emitter.md](src/util/get-native-payments-event-emitter/get-native-payments-event-emitter.md);
the JS-side dispatch/timeout/answer lifecycle for one event is in
[change-event-dispatcher.md](src/class/change-event-dispatcher/change-event-dispatcher.md).

**Why a request is single-use.** The W3C spec already moves a settled `PaymentRequest` to a `closed` state; this
package treats that state as terminal instead of reusable. Reusing a request would mean keeping its native event
subscriptions alive with no terminal path left to release them, since `show()`/`abort()` are what tear them down. Making
`closed` permanent gives every request exactly one teardown path, guarantees against a leaked native listener, and keeps
the request-scoping guarantee above simple — a `requestId` is only ever active once. See
[Migrating from v2](#migrating-from-v2) below for the concrete behavior change, and
[Known deviations](#known-deviations) for how this differs from the spec.

For the full class/file layout and the native-side invariants that keep this contract intact across old architecture,
New Architecture and bridgeless, see [AGENTS.md](AGENTS.md).

## Migrating from v2

> **The native module interface changed** (`show()` now carries the request id, and the change-event methods are part of
> the TurboModule spec). Rebuild the native app when upgrading — a JavaScript-only update (e.g. CodePush/OTA) shipped on
> top of a v2 binary will fail to open the payment sheet.

The `v2.x` line shipped no change-event API: the sheet only ever showed the `PaymentDetailsInit` given to the
constructor, and neither `addEventListener` nor `removeEventListener` existed. Adopting the event API above is purely
additive — `PaymentRequest`, `canMakePayment()`, `show()`, `abort()` and `PaymentComplete` keep their v2 signatures, and a
consumer who never calls `addEventListener` sees the same sheet as before (aside from the iOS round trip described in
[Payment change events](#payment-change-events)).

> **Behavior change:** in `v2.x` a settled `PaymentRequest` could call `show()` again to reopen the sheet. From `v3`
> a `PaymentRequest` is single-use — once `show()` settles or `abort()` resolves the request is `closed`,
> `addEventListener` becomes a no-op and every further `show()` rejects with `InvalidStateError`. Construct a new
> `PaymentRequest` per payment attempt instead of reusing one across retries.

## Migrating from `react-native-payments` (upstream)

This package started as a rewrite of [naoufal/react-native-payments](https://github.com/naoufal/react-native-payments),
the original — now unmaintained — library. The intro bullets at the top of this readme summarize the rewrite; this
section maps the concrete API surface so an existing integration can be ported.

### API mapping

| Upstream (`react-native-payments`)                                                        | This package (`@rnw-community/react-native-payments`)                                          | Notes                                                                                          |
| -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `npm install react-native-payments` + `react-native link`                                    | `yarn add @rnw-community/react-native-payments`                                                    | Autolinked TurboModule — no manual linking step. See [Installation](#installation).             |
| `global.PaymentRequest = require('react-native-payments').PaymentRequest;`                   | `import { PaymentRequest } from '@rnw-community/react-native-payments';`                           | No global polyfill; import the class where you use it.                                          |
| `supportedMethods: ['apple-pay']` / `['android-pay']` (string)                               | `supportedMethods: PaymentMethodNameEnum.ApplePay` / `PaymentMethodNameEnum.AndroidPay` (enum)     | Same runtime values, typed.                                                                      |
| `new PaymentRequest(methodData, details, options)` — 3rd arg `options.requestPayerName` etc. | `new PaymentRequest(methodData, details)` — payer/shipping flags live on each entry's `methodData.data` | No top-level `options` object. See [Additional methodData.data options](#21-additional-methoddatadata-options). |
| `paymentRequest.show()`, reusable after a rejection                                          | `paymentRequest.show()` — **single-use**, `closed` once it settles                                 | See [How it works](#how-it-works) and [Migrating from v2](#migrating-from-v2).                   |
| `paymentRequest.abort()`                                                                      | `paymentRequest.abort()`                                                                            | Same name, TurboModule-backed, spec-mapped `DOMException` on misuse.                             |
| `addEventListener('shippingaddresschange' \| 'shippingoptionchange', e => e.updateWith(...))` | Same two, plus `paymentmethodchange` and the PassKit-only `couponcodechange`                        | Request-scoped native events, `isAnswered`, field-level errors. See [Payment change events](#payment-change-events). |
| `paymentResponse.details.paymentData` / `transactionIdentifier` (iOS)                        | `paymentResponse.details.applePayToken` (`IosPKToken`)                                              | One typed token object instead of loose fields.                                                  |
| `paymentResponse.details.getPaymentToken()` (Android, async) / `.paymentToken` (gateway)     | `paymentResponse.details.androidPayToken` (`AndroidPaymentMethodToken`)                             | Synchronous typed field; no async indirection, no built-in gateway token.                        |
| `paymentResponse.complete('success' \| 'fail' \| 'unknown')` (string)                        | `paymentResponse.complete(PaymentComplete.Success \| PaymentComplete.Fail \| PaymentComplete.Unknown)` (enum) | Same three outcomes, typed — see `PaymentComplete` in [Closing the Payment Sheet](#6-closing-the-payment-sheet). |
| Built-in Stripe / Braintree add-on packages                                                  | Removed — bring your own gateway via `gatewayConfig` (Android) or the raw token (iOS)               | Stripe/Braintree already ship their own maintained RN SDKs.                                      |
| Untyped JS, legacy bridge module                                                             | Full TypeScript, TurboModule (New Architecture-ready)                                               | See [How it works](#how-it-works).                                                                |
| Ad-hoc thrown errors, no stable identity                                                     | Spec-mapped `ConstructorError` / `DOMException` / `PaymentsError`                                   | See [Error Handling](#error-handling).                                                            |

### Worked example

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

try {
    const result = await fetch('...', { method: 'POST', body: JSON.stringify(applePayToken) });
    if (!result.ok) {
        throw new Error(`Backend rejected the payment: ${result.status}`);
    }
    successHandler(await result.json());
    await paymentResponse.complete(PaymentComplete.Success);
} catch (error) {
    errorHandler(error);
    await paymentResponse.complete(PaymentComplete.Fail);
}
```

The differences that matter beyond syntax: no `global.PaymentRequest` polyfill, enums instead of string literals, one
typed `applePayToken` instead of loose `transactionIdentifier`/`paymentData` fields, and — most importantly — this
`paymentRequest` cannot `show()` again. A retry constructs a new `PaymentRequest` from the same `methodData` /
`paymentDetails`, matching [Migrating from v2](#migrating-from-v2) above.

## Web platform

`payment-request.web.ts` / `payment-response.web.ts` are one-line passthroughs — `PaymentRequest` and `PaymentResponse`
resolve to `window.PaymentRequest` / `window.PaymentResponse` (or `null` when `window` is not defined, e.g. during SSR),
typed as `WebPaymentRequestConstructor` / `WebPaymentResponseConstructor` — aliases for the browser's own
`typeof window.PaymentRequest` / `typeof window.PaymentResponse` from `lib.dom`. On web there is no TurboModule, no
native class and none of this package's own logic in the loop: you get the browser's implementation of the W3C Payment
Request API, unmodified.

> **Type visibility caveat:** a bundler that platform-resolves `.web.ts` files (Metro building for the web target,
> `react-native-web` webpack configs) swaps in this passthrough at *runtime* regardless of what TypeScript shows you.
> `src/index.ts` re-exports the platform-agnostic `PaymentRequest` / `PaymentResponse` specifiers without a build-time
> branch, so a plain `tsc`/IDE setup resolves `import { PaymentRequest } from '@rnw-community/react-native-payments'`
> to the native class documented above on every platform, web included. Add
> `"moduleSuffixes": [".web", ".native", ""]` (or an order matching your own bundler's platform resolution) to your
> app's `tsconfig.json` if you need the IDE/`tsc` to show the true DOM types for a web build.

Apple Pay through this browser passthrough is **not** the native iOS integration documented under
[Apple Pay setup](#applepay-setup) — calling `show()` in Safari drives Safari's own Apple Pay JS flow, which fires a
`merchantvalidation` event that your own server must answer by completing Apple's merchant validation session
round-trip (TLS, your merchant certificate, Apple's validation URL) before the sheet can display line items. There is
no `merchantIdentifier` Expo plugin config, no PassKit entitlement and no `merchantCapabilities` on this path — see
[Apple Pay on the Web](https://developer.apple.com/documentation/apple_pay_on_the_web).

Browser support is inconsistent: Chrome, Edge and Safari (with the merchant-validation caveat above) implement the
Payment Request API; Firefox removed its implementation. Check [caniuse](https://caniuse.com/payment-request) before
shipping a web checkout on top of it, and always guard for `PaymentRequest`/`PaymentResponse` being **nullish** (a
truthiness or `== null` check, never `=== null`) — the passthrough returns `null` outside a `window` (SSR), while an
unsupported browser has no `window.PaymentRequest` at all, so the export resolves to `undefined` there.

None of the native-only behavior documented above for the `PaymentRequest` class applies to the browser's own
implementation:

- **`couponCode`** — populated only by the iOS 15+ PassKit `couponcodechange` flow; the browser's `PaymentRequest` has
  no `couponCode` property.
- **Normalized `AbortError`** — dismissing the sheet on web throws the browser's own native `DOMException`, not this
  package's [`PaymentsErrorEnum`](#paymentserrorenum)-driven `DOMException`; `isNativeUserCancellation` never runs on
  web.
- **Single-use request semantics** — the native class tracks `state: 'created' | 'interactive' | 'closed'` itself and
  rejects a reused, settled request with its own `InvalidStateError`. The browser enforces single-use per the W3C spec
  independently, through its own internal slots, not this package's state machine.
- **Listener auto-cleanup** — the request-scoped subscription bookkeeping and automatic teardown on `show()`/`abort()`
  described in [Payment change events](#payment-change-events) is this package's `NativeEventEmitter` plumbing over the
  TurboModule. The browser's `PaymentRequest` follows plain DOM `addEventListener`/`removeEventListener` semantics with
  no auto-cleanup — remove your own listeners when you are done with them.

## Type & class reference

Most public exports already appear in the usage examples above. The remaining exports are referenced here for
completeness — one usage example each.

### `PaymentsErrorEnum`

The message carried by every `DOMException` and rejection the library throws: `AbortError`, `InvalidStateError`,
`NotAllowedError`, `NotSupportedError`, `SecurityError`. Every `DOMException` also carries the W3C error name in
`error.name`, which is the stable way to branch on the failure. Native user cancellation (the person dismissing the
payment sheet on either platform) is normalized to an `AbortError` `DOMException`, matching the W3C behaviour:

```ts
paymentRequest.show().catch((error: Error) => {
    if (error.name === 'AbortError') {
        // the user dismissed the sheet
    }
});
```

### `PaymentDetailsUpdateError`

The type of `PaymentDetailsUpdate['error']` answered from `updateWith` — a plain string or one of the field level
errors documented under [Sheet errors](#sheet-errors).

```ts
const fieldError: PaymentDetailsUpdateError = {
    type: PaymentUpdateErrorTypeEnum.CouponCode,
    message: 'SALE10 expired last week',
    expired: true,
};
```

### `PaymentDetailsInit`

The second constructor argument. `total` is required; `displayItems`, `shippingOptions` and `id` are optional — an
`id` is generated with `uuid.v4()` when omitted.

```ts
const paymentDetails: PaymentDetailsInit = {
    total: { label: 'Total', amount: { currency: 'USD', value: '10.00' } },
    displayItems: [{ label: 'Item', amount: { currency: 'USD', value: '10.00' } }],
};
```

### `IosPKMerchantCapability`

Populates the optional `merchantCapabilities` of the Apple Pay `methodData.data`; defaults to 3-D Secure, debit and
credit when omitted.

```ts
const data = {
    merchantIdentifier: 'merchant.com.your-app.namespace',
    merchantCapabilities: [IosPKMerchantCapability.PKMerchantCapability3DS, IosPKMerchantCapability.PKMerchantCapabilityDebit],
};
```

### `AndroidPaymentMethodDataInterface` / `AndroidPaymentMethodDataDataInterface`

The typed shape of the Android entry of `methodData` shown in [Creating an Instance](#2-creating-an-instance):
`supportedMethods: PaymentMethodNameEnum.AndroidPay` paired with an `AndroidPaymentMethodDataDataInterface` `data`.

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
```

### `AndroidAllowedAuthMethodsEnum`

Restricts `methodData.data.allowedAuthMethods`; defaults to both `PAN_ONLY` and `CRYPTOGRAM_3DS` when omitted.

```ts
const allowedAuthMethods = [AndroidAllowedAuthMethodsEnum.PAN_ONLY];
```

### `AndroidPaymentResponse`

The `PaymentResponse` subclass `show()` resolves with on Android, parsed from the Google Pay JSON payload. Consumers
do not construct it directly — it comes back from `show()`.

```ts
const response = await paymentRequest.show();

if (response instanceof AndroidPaymentResponse) {
    response.details.androidPayToken.cardInfo.cardNetwork;
}
```

### `IosPaymentMethodDataInterface` / `IosPaymentMethodDataDataInterface`

The typed shape of the Apple Pay entry of `methodData` shown in [Creating an Instance](#2-creating-an-instance):
`supportedMethods: PaymentMethodNameEnum.ApplePay` paired with an `IosPaymentMethodDataDataInterface` `data`.

```ts
const iosMethod: IosPaymentMethodDataInterface = {
    supportedMethods: PaymentMethodNameEnum.ApplePay,
    data: {
        merchantIdentifier: 'merchant.com.your-app.namespace',
        countryCode: 'US',
        currencyCode: 'USD',
        supportedNetworks: [SupportedNetworkEnum.Visa],
    },
};
```

### `IosPKToken`

The Apple Pay token exposed as `paymentResponse.details.applePayToken`, carrying the PassKit payment data.

```ts
const response = await paymentRequest.show();

if (response instanceof IosPaymentResponse) {
    const token: IosPKToken = response.details.applePayToken;

    token.transactionIdentifier;
}
```

### `IosPaymentResponse`

The `PaymentResponse` subclass `show()` resolves with on iOS, parsed from the PassKit payment token. Consumers do not
construct it directly — it comes back from `show()`.

```ts
const response = await paymentRequest.show();

if (response instanceof IosPaymentResponse) {
    response.details.applePayToken.transactionIdentifier;
}
```

### `PaymentRequestEventType`

The union of event names accepted by `addEventListener`/`removeEventListener`: `'shippingaddresschange'`,
`'shippingoptionchange'`, `'paymentmethodchange'` or `'couponcodechange'`.

```ts
const eventType: PaymentRequestEventType = 'shippingoptionchange';

paymentRequest.addEventListener(eventType, event => event.updateWith({}));
```

### `PaymentRequestEventListener` / `PaymentMethodChangeEventListener`

The listener signatures `addEventListener` accepts: `PaymentRequestEventListener` for `shippingaddresschange`,
`shippingoptionchange` and `couponcodechange`; `PaymentMethodChangeEventListener` for `paymentmethodchange`.

```ts
const onShippingOptionChange: PaymentRequestEventListener = event => {
    event.updateWith({});
};

const onPaymentMethodChange: PaymentMethodChangeEventListener = event => {
    event.updateWith({});
};
```

### `PaymentRequestEventPayloadInterface`

The raw native payload carried by a change event, before it is applied to the request and dispatched to listeners.
`requestId` and `eventId` identify the request and the native completion handler; the rest is event-type specific.

```ts
const payload: PaymentRequestEventPayloadInterface = {
    requestId: paymentRequest.id,
    eventId: 1,
    shippingOption: 'express',
};
```

## Unit testing

Due to new TurboModules architecture in React Native, you can [encounter issues](https://github.com/rnw-community/rnw-community/issues/227) with Jest tests. To fix this, you can mock
the TurboModuleRegistry to disable the `Payment` module in Jest tests. Here is an example of how you can do this:

```ts
const turboModuleRegistry = jest.requireActual('react-native/Libraries/TurboModule/TurboModuleRegistry');

/** HINT: Mock TurboModuleRegistry to disable the `Payment` module in Jest tests */
export function setupJestTurboModuleMock(): void {
    jest.mock('react-native/Libraries/TurboModule/TurboModuleRegistry', () => {
        return {
            ...turboModuleRegistry,
            getEnforcing: (name: string) => {
                if (name === 'Payment') {
                    return null; // Return null to mock the Payment module
                }
                return turboModuleRegistry.getEnforcing(name);
            },
        };
    });
}
```

## Example

### Expo

You can find working example in the `App` component of the [react-native-payments-example](../react-native-payments-example/readme.md) package, running through its `apps/expo` target.

#### Web(react-native-web)

On web the library will fallback to [W3C implementation](https://developer.mozilla.org/en-US/docs/Web/API/Payment_Request_API)

### Bare React Native CLI

You can find working example in the `App` component of the [react-native-payments-example](../react-native-payments-example/readme.md) package, running through its `apps/bare` target.

## Troubleshooting

Every entry below traces back to a real report against this package or its native tooling.

**`pod install` / Gradle fails right after adding the package.** Autolinking (RN 0.60+) should pick this module up
without a manual link step. A stale `Podfile.lock`/`Pods` directory or an old Node version behind the CocoaPods
autolinking script are the most common causes of a cryptic `Podfile` parse error — matching the Node version pinned in
[`.nvmrc`](.nvmrc) resolved it in [#163](https://github.com/rnw-community/rnw-community/issues/163). Delete
`ios/Pods`, `ios/Podfile.lock` and re-run `pod install` before assuming the package itself is at fault.

**`UnsupportedTypeAnnotationParserError: TypeScript type annotation 'TSObjectKeyword' is unsupported in NativeModule specs`
during Gradle/Pod codegen, or Gradle's `PaymentsModule is not abstract and does not override abstract method show(...)`.**
Both are react-native-codegen/TurboModule spec mismatches between the installed package version and the installed
`react-native` version — see [#238](https://github.com/rnw-community/rnw-community/issues/238) and
[#174](https://github.com/rnw-community/rnw-community/issues/174). Upgrade `@rnw-community/react-native-payments` and
`react-native` together rather than pinning one against a much newer or older other; a leftover generated
`PaymentsSpec.java`/`Payments.mm` codegen artifact from before the bump is a common secondary cause — see the Metro vs
native rebuild entry below.

**Apple Pay sheet never appears, or fails with a merchant/entitlement error.** The `merchantIdentifier` passed to
`methodData.data` must exactly match a merchant ID declared in the app's `com.apple.developer.in-app-payments`
entitlement. For a bare RN app, add it in Xcode's Signing & Capabilities; for Expo, use the `merchantIdentifier` config
plugin option — single string or array — documented in [Expo setup](#expo-setup) and re-run `expo prebuild --clean`
after changing it. If the sheet still won't open on a physical device while running from Metro in `DEV`, first check
`merchantCapabilities`/`supportedNetworks` are set explicitly on `methodData.data` — a worked configuration that
resolved this for other users is in [#234](https://github.com/rnw-community/rnw-community/issues/234).

**Apple Pay works in the simulator but the token is unusable, or the reverse.** The simulator renders the real PassKit
sheet UI, but `paymentResponse.details.applePayToken` from it is not valid production payment data — Apple Pay must be
verified end-to-end on a physical device signed into an Apple ID with at least one provisioned card before shipping.
Conversely, a device-only failure usually means the merchant ID/capabilities/entitlement above, not the JS integration.

**Google Pay `canMakePayment()` returns `true` in `EnvironmentEnum.Production` you never tested.** This is by design,
not a bug: `canMakePayment()` on Android always checks against `ENVIRONMENT_TEST` regardless of the `environment` set
in `methodData.data`, mirroring the W3C surface (`canMakePayment` only answers "is a payment handler available", not
"is this specific environment reachable") — see [#259](https://github.com/rnw-community/rnw-community/issues/259).
Set the real `environment` for `show()` regardless of what `canMakePayment()` reported, and use accounts from the
[Test Cards Allowlist](https://groups.google.com/g/googlepay-test-mode-stub-data) documented under
[AndroidPay setup](#androidpay-setup) when testing.

**Metro reload doesn't pick up a fix, or the app red-screens / white-screens after bumping `react-native`.** A JS-only
Metro reload never re-runs native linking or codegen — after bumping `react-native`, this package's major version (see
[Migrating from v2](#migrating-from-v2)), or Xcode/Gradle toolchain versions, do a full native rebuild rather than a
Fast Refresh: delete `ios/Pods`, `ios/build`, `android/build`, `android/.cxx`, then `pod install` and rebuild from
Xcode/Gradle. A patch-version-only `react-native` bump that broke both platforms with no JS-visible error, as reported
in [#185](https://github.com/rnw-community/rnw-community/issues/185), is exactly this class of stale-native-artifact
failure, not a JS regression.

**New Architecture / bridgeless.** The package ships one TurboModule `Spec` consumed identically on the old
architecture, the New Architecture and bridgeless — `getNativePaymentsEventEmitter()` resolves through the same module
handle on all three, so switching `newArchEnabled` does not by itself require touching this package's integration (see
[How it works](#how-it-works)). This `null`-when-unimplemented guard only covers the *optional* change-event contract
(`setActiveEvents`/`updatePaymentDetails`/`addListener`/`removeListeners`) degrading to the v2 no-events flow — it does
**not** cover the required `show(requestId, methodData, details)` call: a `v3` JS bundle still needs a rebuilt `v3`
native binary, exactly as [Migrating from v2](#migrating-from-v2) describes, regardless of architecture. A build error
mentioning `TSObjectKeyword` or an abstract-method mismatch when New Architecture is enabled is the codegen
version-skew issue above, not a New Architecture incompatibility.

**Jest: `TurboModuleRegistry.getEnforcing(...): 'Payments' could not be found`.** Covered in
[Unit testing](#unit-testing) — mock `TurboModuleRegistry` to return `null` for the `Payments` module
([#227](https://github.com/rnw-community/rnw-community/issues/227)).

## TODO

### Docs

- [ ] Add gifs to the docs showing payment sheets appearing on IOS and Android — add `startRecording: "sheet"` /
      `stopRecording` around the sheet-presenting step of the `sheet_opens_on_show.yaml` flow documented in
      [e2e/readme.md](../react-native-payments-example/e2e/readme.md#flows), then run `yarn workspace
      @rnw-community/react-native-payments-example e2e:ios:bare` / `e2e:android:bare` (or the `:expo` targets) with
      `MAESTRO_DEBUG_OUTPUT_DIRECTORY` set the same way the `ios-maestro.yml` / `android-maestro.yml` CI workflows set
      it (`packages/react-native-payments-example/artifacts/maestro-<platform>-<target>`) so the `.mp4` lands next to
      the other Maestro artifacts; convert with `ffmpeg -i sheet.mp4 -vf "fps=12,scale=320:-1" sheet.gif`, then embed
      under [Screenshots](#screenshots).
- [x] Provide migration guide from `react-native-payments`. — see
      [Migrating from `react-native-payments` (upstream)](#migrating-from-react-native-payments-upstream)

### Native

- [ ] Investigate and implement `shipping options` on Android (iOS passes them to PassKit with a `shippingoptionchange`
      listener).
- [ ] Investigate and implement `coupons` support on Android (iOS enables the PassKit coupon field with a
      `couponcodechange` listener).
- [ ] Rewrite IOS to swift?
- [ ] Rewrite Android to Kotlin?
- [ ] Can we avoid modifying `AppDelegate.h` with importing `PassKit`?

### W3C compliance checklist

- [x] [PaymentRequestUpdateEvent](https://www.w3.org/TR/payment-request/#dom-paymentrequestupdateevent) — JavaScript
      layer and iOS PassKit delivery implemented (see [Payment change events](#payment-change-events)); on-device
      verification is tracked in [#393](https://github.com/rnw-community/rnw-community/issues/393)
- [x] [PaymentMethodChangeEvent](https://www.w3.org/TR/payment-request/#dom-paymentmethodchangeevent) — same
      implementation and verification status as `PaymentRequestUpdateEvent`
- [x] Implement [PaymentDetailsModifier](https://www.w3.org/TR/payment-request/#dom-paymentdetailsmodifier) — see
      [Payment details modifiers](#24-payment-details-modifiers)
- [x] Improve and unify errors according to the spec — see [Error Handling](#error-handling)
- [ ] Implement `PaymentResponse` `retry()` method
- [ ] Implement `PaymentResponse` `toJSON()` method

#### Known deviations

- **Android change events are a no-op.** Google Pay renders its sheet in its own activity and never asks the app for
  an in-sheet update, so `addEventListener` can be called but a registered listener never fires on Android.
- **`PaymentShippingOption.selected` is ignored on iOS.** PassKit has no preselection support and always shows its
  shipping-method picker with the first option of the array highlighted.
- **`PaymentRequest` is single-use**, deviating from the spec's reusable `closed` state: once `show()` settles or
  `abort()` resolves the request stays `closed` forever — `show()` always rejects and `addEventListener` is inert. A
  new `PaymentRequest` is required for every payment attempt. See [Migrating from v2](#migrating-from-v2).
- **`couponcodechange`** is a PassKit extension, not part of the W3C specification.
- **`NotSupportedError` is thrown at construction, not at `show()`.** The spec rejects `show()`'s promise with
  `NotSupportedError` when no payment handler is available; this implementation instead throws synchronously from the
  `PaymentRequest` constructor as soon as it fails to find a platform-matching payment method, since the native bridge
  needs to know the target platform's method data up front to serialize the request. The error name matches the spec;
  only the algorithm step it fires from differs.

## License

This library is licensed under The [MIT License](./LICENSE.md).
