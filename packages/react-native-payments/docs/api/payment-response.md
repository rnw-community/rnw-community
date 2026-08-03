# `PaymentResponse`

## What & why

The result of a settled `show()` call — carries the payment method's token/details and the methods to close out
the sheet. Reach for it right after `await paymentRequest.show()` to send data to your backend and finish the
transaction.

## How

| Member | Signature | Notes |
| --- | --- | --- |
| `requestId`, `methodName`, `shippingOption` | readonly properties | Mirror the constructor arguments — `shippingOption` is the selected option's id at the moment `show()` resolved, or `null`. |
| `details` | `PaymentResponseDetailsInterface` | Everything platform/payment-method specific lives here — see below. |
| `complete(result)` | `(result: PaymentComplete): Promise<void>` | Dismisses the sheet with the given outcome. No effect on Android. See [platforms/android.md](../platforms/android.md). |
| `retry(errorFields?)` | `(errorFields?: PaymentValidationErrors): Promise<void>` | Asks the user to correct fields instead of completing — see [guides/retry.md](../guides/retry.md). |
| `toJSON()` | `(): PaymentResponseJsonInterface` | Spec-shaped serialization — see [api/payment-response-json.md](./payment-response-json.md). |

`billingAddress`, `shippingAddress`, `payerEmail`, `payerName`, `payerPhone`, `androidPayToken` and
`applePayToken` are **not** direct properties of `PaymentResponse` — they live on `paymentResponse.details`
(`PaymentResponseDetailsInterface`):

| `details` member | Type | Notes |
| --- | --- | --- |
| `billingAddress?` | `PaymentResponseAddressInterface` | Present only if `requestBillingAddress` was set — also populated on Android when `requestPayerName`/`requestPayerPhone` is set, see [api/payment-response-address.md](./payment-response-address.md). |
| `shippingAddress?` | `PaymentResponseAddressInterface` | Present only if `requestShipping` was set. |
| `payerEmail?`, `payerName?`, `payerPhone?` | `string` | Present only if the matching `request*` flag was set. |
| `androidPayToken` | `AndroidPaymentMethodToken` | Populated on `AndroidPaymentResponse`, an empty placeholder token otherwise — see [api/android-payment-response.md](./android-payment-response.md). |
| `applePayToken` | `IosPKToken` | Populated on `IosPaymentResponse`, an empty placeholder token otherwise — see [api/ios-payment-response.md](./ios-payment-response.md). |

## Example

```ts
const paymentResponse = await paymentRequest.show();

paymentResponse.details.billingAddress;
paymentResponse.details.payerEmail;

const json = paymentResponse.toJSON();
// { requestId, methodName, details, shippingAddress, shippingOption, payerName, payerEmail, payerPhone }

await paymentResponse.complete(PaymentComplete.SUCCESS);
```

## Pitfalls

- `PaymentResponse.complete()` **after** `retry()` throws `InvalidStateError` instead of reaching native —
  `complete()` unconditionally dismisses the sheet, which would silently cancel the correction opportunity
  `retry()` just opened. See [guides/retry.md](../guides/retry.md).
- `shippingAddress`, `payerName`, `payerEmail` and `payerPhone` on `toJSON()`'s output default to `null` when not
  requested; `shippingOption` mirrors `PaymentRequest.shippingOption` at the moment `show()` resolved and is
  `null` when shipping options were never offered.
- Reading `paymentResponse.billingAddress` (or any of the other `details` members) directly on the response
  instead of through `.details` is `undefined` at the type level — `PaymentResponse` only declares `requestId`,
  `methodName`, `details` and `shippingOption`.

## References

- [W3C `PaymentResponse`](https://www.w3.org/TR/payment-request/#paymentresponse-interface)
- [guides/retry.md](../guides/retry.md)
- [guides/errors.md](../guides/errors.md)
