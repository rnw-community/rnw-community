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
- Add following code to your `AppDelegate.h`:
```objc
#import <RCTAppDelegate.h>
#import <UIKit/UIKit.h>
#import <PassKit/PassKit.h> // Add this import

@interface AppDelegate : RCTAppDelegate

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

## Usage

Detailed guide should be found at:
- [developer.mozilla.org](https://developer.mozilla.org/en-US/docs/Web/API/Payment_Request_API/Using_the_Payment_Request_API) as API is fully compliant.
- [Google Web Payments guide](https://web.dev/payments/).

The PaymentRequest class is designed to facilitate the integration of payment processing into your React Native application.
It leverages TypeScript for robust typing and ensures seamless payment experiences across both iOS and Android platforms.
Below is a comprehensive guide on how to use the PaymentRequest class effectively:

### 1. Importing the class

```ts
import {PaymentRequest} from '@rnw-community/react-native-payments';
```

### 2. Creating an Instance

```ts
import { PaymentMethodNameEnum, SupportedNetworkEnum } from "@rnw-community/react-native-payments/src";

const methodData = [
    // ApplePay example
    {
        supportedMethods: PaymentMethodNameEnum.ApplePay,
        data: {
            merchantIdentifier: 'merchant.com.your-app.namespace',
            supportedNetworks: [SupportedNetworkEnum.Visa, SupportedNetworkEnum.MasterCard],
            countryCode: 'US',
            currencyCode: 'USD',
            requestBilling: true,
            requestEmail: true,
            requestShipping: true
        }
    },
    // AndroidPay
    {
        supportedMethods: PaymentMethodNameEnum.AndroidPay,
        data: {
            supportedNetworks: [SupportedNetworkEnum.Visa, SupportedNetworkEnum.MasterCard],
            environment: EnvironmentEnum.Test,
            countryCode: 'DE',
            currencyCode: 'EUR',
            requestBilling: true,
            requestEmail: true,
            requestShipping: true,
            gatewayConfig: {
                gateway: 'example',
                gatewayMerchantId: 'exampleGatewayMerchantId',
            },
        }
    }
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
- `requestBilling`: An optional boolean field that, when present and set to true, indicates that the `PaymentResponse` will
  include the billing address of the payer.
- `requestEmail`: An optional boolean field that, when present and set to true, indicates that the `PaymentResponse` will
  include the email address of the payer.
- `requestShipping`: An optional boolean field that, when present and set to true, indicates that the `PaymentResponse` will
  include the shipping address of the payer.

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
paymentResponse.complete(PaymentComplete.Success) // OR PaymentComplete.Fail
```

> This will have no affect in the Android platform due to AndroidPay implementation.

### 7. Aborting the Payment

The `PaymentRequset.abort()` method in the Payment Request API allows developers to programmatically cancel an ongoing
payment request or dismiss
the payment sheet when it is in an interactive state. This method is used to handle scenarios where the user decides to
cancel the
payment process or when specific conditions require the payment request to be aborted.

> This will have no affect in the Android platform due to AndroidPay implementation.

## Example

You can find working example in the `App` component of
the [react-native-payments-example](../react-native-payments-example/README.md) package.

## TODO

### Docs

- [ ] Add gifs to the docs showing payment sheets appearing on IOS and Android.
- [ ] Provide migration guide from `react-native-payments`.

### Native

- [ ] Investigate and implement `shipping options`.
- [ ] Investigate and implement `coupons` support.
- [ ] Rewrite IOS to swift?
- [ ] Rewrite Android to Kotlin?
- [ ] Can we avoid modifying `AppDelegate.h` with importing `PassKit`?

### W3C spec:

- [ ] Implement events:
    - [ ] [PaymentRequestUpdateEvent](https://www.w3.org/TR/payment-request/#dom-paymentrequestupdateevent)
    - [ ] [PaymentMethodChangeEvent](https://www.w3.org/TR/payment-request/#dom-paymentmethodchangeevent)
- [ ] Implement [PaymentDetailsModifier](https://www.w3.org/TR/payment-request/#dom-paymentdetailsmodifier)
- [ ] Improve and unify errors according to the spec
- [ ] Implement `PaymentResponse` `retry()` method
- [ ] Implement `PaymentResponse` `toJSON()` method

### Other

- [ ] Add unit tests
- [ ] Refactor `utils`
- [ ] Add web support
- [ ] Merge react-native-payments-example into this package, and setup it properly
- [ ] CI/CD:
    - [ ] check/setup pull request
    - [ ] check/setup push to master and release to NPM
    - [ ] add e2e via maestro for IOS
    - [ ] add e2e via maestro for Android

## License

This library is licensed under The [MIT License](./LICENSE.md).
