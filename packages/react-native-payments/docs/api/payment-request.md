# `PaymentRequest`

## What & why

The entry point of the library: constructs a W3C-shaped payment request, checks device capability, and drives
the native Apple Pay / Google Pay sheet through one TurboModule. Reach for it whenever you need to accept a
payment — everything else in this package (events, responses, errors) hangs off an instance of this class.

## How

```ts
import { PaymentRequest } from '@rnw-community/react-native-payments';
```

| Member | Signature | Notes |
| --- | --- | --- |
| constructor | `new PaymentRequest(methodData, details)` | Validates per W3C spec, then serializes platform-specific JSON for native. Throws `ConstructorError` on invalid input, `DOMException NotSupportedError` when no platform-matching method is found — see [architecture.md](../architecture.md). |
| `canMakePayment()` | `(): Promise<boolean>` | iOS: PassKit `canMakePaymentsUsingNetworks:` restricted to `supportedNetworks`. Android: Google Pay `isReadyToPay` against `EnvironmentEnum.TEST` always — see [platforms/android.md](../platforms/android.md). Rejects `InvalidStateError` when not `created`. |
| `hasEnrolledInstrument()` | `(): Promise<boolean>` | Android: `isReadyToPay` with `existingPaymentMethodRequired: true`, optimistic — see [platforms/android.md](../platforms/android.md). Rejects `InvalidStateError` when not `created`. |
| `show()` | `(): Promise<PaymentResponse>` | Presents the sheet; single-use — see [architecture.md](../architecture.md). Rejects `AbortError` on user cancellation, `InvalidStateError` when not `created`. |
| `abort()` | `(): Promise<void>` | Dismisses an interactive sheet. No effect on Android (Google Pay activity has no in-sheet dismiss). Rejects `InvalidStateError` when not `interactive`. |
| `addEventListener` / `removeEventListener` | `(type, listener) => void` | See [guides/change-events.md](../guides/change-events.md). |
| `on*` attributes | `onshippingaddresschange`, `onshippingoptionchange`, `onpaymentmethodchange`, `oncouponcodechange` | See [guides/change-events.md](../guides/change-events.md#event-handler-attributes). |
| `shippingAddress`, `shippingOption`, `couponCode`, `updating`, `id` | properties | Mirror the latest change-event selection — see [guides/change-events.md](../guides/change-events.md#changed-values-on-the-request). |

`methodData` is an array of `IosPaymentMethodDataInterface` / `AndroidPaymentMethodDataInterface` entries — see
[api/ios-payment-method-data.md](./ios-payment-method-data.md) and
[api/android-payment-method-data.md](./android-payment-method-data.md). `details` is a `PaymentDetailsInit` — see
[api/payment-details-init.md](./payment-details-init.md).

## Example

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
    const isConfirmed = await sendToYourBackend(paymentResponse.details);

    await paymentResponse.complete(isConfirmed ? PaymentComplete.SUCCESS : PaymentComplete.FAIL);
}
```

## Pitfalls

- **A `PaymentRequest` is single-use.** As soon as `show()` settles — resolved, rejected or aborted — the
  request moves to the `closed` state, its change-event listeners are released and every further `show()`
  rejects with `InvalidStateError`. Build a new `PaymentRequest` to retry a payment. See
  [architecture.md](../architecture.md).
- Only call `complete(PaymentComplete.SUCCESS)` once your backend has actually confirmed the charge — completing
  with `SUCCESS` before that point tells the sheet (and the user) the payment went through even if it didn't.
- On web, `PaymentRequest` resolves to the browser's own implementation — see [platforms/web.md](../platforms/web.md).

## References

- [W3C `PaymentRequest`](https://www.w3.org/TR/payment-request/#paymentrequest-interface)
- [architecture.md](../architecture.md)
- [guides/errors.md](../guides/errors.md)
