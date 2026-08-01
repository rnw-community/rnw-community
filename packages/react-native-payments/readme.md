# ReactNative Payments

[![npm version](https://badge.fury.io/js/%40rnw-community%2Fnestjs-webpack-swc.svg)](https://badge.fury.io/js/%40rnw-community%2Freact-native-payments)
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

```ts
const shippingOptions = [
    { id: 'express', label: 'Express', detail: 'Next business day', amount: { currency: 'USD', value: '5.00' } },
    { id: 'ground', label: 'Ground', detail: '3-5 business days', amount: { currency: 'USD', value: '0.00' } },
];
```

Calling `updateWith` twice, or calling it once the event was already answered or the request is no longer showing, throws
a `DOMException` with `InvalidStateError`. A listener that throws, rejects, sends invalid details, never calls `updateWith`
or leaves its promise pending for more than 30 seconds is logged and answered with the unchanged details, so the payment
sheet never stalls.

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

You can find working example in the `App` component of the [react-native-payments-expo-example](../react-native-payments-expo-example/README.md) package.

#### Web(react-native-web)

On web the library will fallback to [W3C implementation](https://developer.mozilla.org/en-US/docs/Web/API/Payment_Request_API)

### Bare React Native CLI

You can find working example in the `App` component of the [react-native-payments-example](../react-native-payments-example/README.md) package.

## TODO

### Docs

- [ ] Add gifs to the docs showing payment sheets appearing on IOS and Android.
- [ ] Provide migration guide from `react-native-payments`.

### Native

- [ ] Investigate and implement `shipping options` on Android (iOS passes them to PassKit with a `shippingoptionchange`
      listener).
- [ ] Investigate and implement `coupons` support on Android (iOS enables the PassKit coupon field with a
      `couponcodechange` listener).
- [ ] Rewrite IOS to swift?
- [ ] Rewrite Android to Kotlin?
- [ ] Can we avoid modifying `AppDelegate.h` with importing `PassKit`?

### W3C spec:

- [ ] Implement events (JavaScript layer and iOS delivery landed, Android is a no-op, device verification pending):
    - [ ] [PaymentRequestUpdateEvent](https://www.w3.org/TR/payment-request/#dom-paymentrequestupdateevent)
    - [ ] [PaymentMethodChangeEvent](https://www.w3.org/TR/payment-request/#dom-paymentmethodchangeevent)
- [ ] Implement [PaymentDetailsModifier](https://www.w3.org/TR/payment-request/#dom-paymentdetailsmodifier)
- [ ] Improve and unify errors according to the spec
- [ ] Implement `PaymentResponse` `retry()` method
- [ ] Implement `PaymentResponse` `toJSON()` method

### Other

- [ ] Refactor `utils`
- [ ] Find alternative/suctom implementation for the `validator` library

## License

This library is licensed under The [MIT License](./LICENSE.md).
