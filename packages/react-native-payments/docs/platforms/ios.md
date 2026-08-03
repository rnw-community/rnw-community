# iOS (Apple Pay)

Setup, capabilities, and how this package's `PaymentRequest` maps onto PassKit.

## Setup

- Apple Pay [overview](https://developer.apple.com/apple-pay/planning/).
- Create an [Apple developer account](https://developer.apple.com/programs/enroll/).
- Follow [this guide](https://developer.apple.com/library/archive/ApplePay_Guide/Configuration.html) to set up
  Apple Pay in your application.
- [Payment token reference](https://developer.apple.com/documentation/passkit/apple_pay/payment_token_format_reference?language=objc).

### Native setup

Add the following code to your `AppDelegate.h` (Objective-C):

```objc
#import <RCTAppDelegate.h>
#import <UIKit/UIKit.h>
#import <PassKit/PassKit.h> // Add this import

@interface AppDelegate : RCTAppDelegate
```

Add the following code to your `AppDelegate.swift` (Swift):

```swift
import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import PassKit // Add this import
```

## Capabilities

- `merchantCapabilities` (`IosPKMerchantCapability`, see [api/ios-payment-method-data.md](../api/ios-payment-method-data.md))
  defaults to 3-D Secure, debit and credit when omitted.
- `supportedNetworks` accepts every `SupportedNetworkEnum` member, but Apple Pay introduced some of them after the
  oldest supported iOS version: `girocard` needs iOS 14, `mir` needs iOS 14.5, `dankort` needs iOS 15.1 and
  `bancontact` needs iOS 16 — each is rejected as an invalid supported network below its minimum iOS version. See
  [api/supported-network-enum.md](../api/supported-network-enum.md).
- `shippingType` (`Shipping` / `Delivery` / `Pickup`) forwards to `PKShippingType` — `Pickup` maps to
  `PKShippingTypeStorePickup`. See [Known deviations](#known-deviations).
- `couponCode` prefills the coupon code field of the sheet, but the field itself is only rendered when a
  `couponcodechange` listener is registered before `show()`, and only on iOS 15+. See
  [guides/change-events.md](../guides/change-events.md).
- `canMakePayment()` maps to PassKit's `canMakePaymentsUsingNetworks:`, restricting the check to the request's
  `supportedNetworks`.
- `retry()` reuses the same `PKPaymentErrorDomain` field-error constructors as
  [Sheet errors](../guides/change-events.md#sheet-errors) to fail the pending authorization and let the user
  correct and resubmit. See [guides/retry.md](../guides/retry.md).

## Known deviations

- **`PaymentShippingOption.selected` is ignored.** PassKit has no preselection support and always shows its
  shipping-method picker with the first option of the array highlighted. Put the option you want preselected
  first in `shippingOptions` instead of relying on `selected`.
- **`shippingType: 'pickup'` maps to `PKShippingTypeStorePickup`.** PassKit also has
  `PKShippingTypeServicePickup`, which has no W3C equivalent and is not exposed by this library.
- **`retry()` supports at most one in-sheet correction pass.** This package's `PaymentRequest` is single-use (see
  [architecture.md](../architecture.md)) and its native bridge resolves the `show()` promise exactly once per
  authorization, so there is no channel left to deliver a second submission to JavaScript. If the user corrects
  the fields and resubmits, this package fails and dismisses the sheet automatically instead of silently hanging
  — see [guides/retry.md](../guides/retry.md).
- **`hasEnrolledInstrument()`** maps to PassKit's `canMakePaymentsUsingNetworks:`, the same capability check as
  `canMakePayment()` restricted to `supportedNetworks`.
