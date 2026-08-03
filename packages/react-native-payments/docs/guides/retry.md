# Retrying the payment

`PaymentResponse.retry(errorFields?)` asks the user to correct one or more invalid fields instead of completing
the payment. Call it **instead of** `complete()`, before the sheet has been dismissed:

```ts
import { PaymentAddressFieldEnum, PaymentComplete, PaymentContactFieldEnum } from '@rnw-community/react-native-payments';

const validation = await validatePaymentOnBackend(paymentResponse);

if (!validation.ok) {
    await paymentResponse.retry({
        error: 'We could not process your payment',
        payer: { [PaymentContactFieldEnum.Email]: 'Please provide a valid email' },
        shippingAddress: { [PaymentAddressFieldEnum.PostalCode]: 'We do not ship to this postal code' },
    });
} else {
    await paymentResponse.complete(PaymentComplete.SUCCESS);
}
```

`retry()` throws a `DOMException` with `InvalidStateError` if `complete()` was already called on this response,
or if `retry()` was already called once — this package supports **at most one** `retry()` call per
`PaymentResponse` (see [Known deviations](#known-deviations)). `errorFields` is optional; an omitted
`payer`/`shippingAddress` still fails the attempt but nothing is highlighted in the sheet. Calling `complete()`
**after** `retry()` also throws `InvalidStateError` instead of reaching native — `complete()` unconditionally
dismisses the sheet, which would silently cancel the correction opportunity `retry()` just opened.

> **iOS**: `retry()` reuses the same `PKPaymentErrorDomain` field-error constructors as
> [Sheet errors](./change-events.md#sheet-errors) — `payer` keys are `PaymentContactFieldEnum`, `shippingAddress`
> keys are `PaymentAddressFieldEnum` — to fail the pending authorization with those errors instead of dismissing
> the sheet, so PassKit highlights the offending rows and lets the user correct and resubmit. This package
> cannot route a second submission back to `show()`'s already-settled promise (see
> [PaymentRequest is single-use](../architecture.md)), so if the user resubmits, the sheet is failed and
> dismissed automatically; `retry()` itself only resolves once the errors have been handed to the sheet, not once
> the user has finished correcting them. **Android**: `retry()` is a documented no-op — it resolves like the
> spec's return type without re-displaying the Google Pay sheet, matching the existing `complete()`/`abort()`
> no-op boundary on Android.

## Known deviations

- **`PaymentResponse.retry()` supports at most one in-sheet correction pass, and only on iOS.** The spec
  algorithm re-presents the sheet and lets the user submit a corrected response an arbitrary number of times,
  handing back the same `PaymentResponse` updated in place. This package's `PaymentRequest` is single-use (see
  [architecture.md](../architecture.md)) and its native bridge resolves the `show()` promise exactly once per
  authorization, so there is no channel left to deliver a second submission to JavaScript. `retry()` therefore
  only feeds `errorFields` into the still-open native sheet through the existing `PKPaymentErrorDomain`
  field-error path (see [Sheet errors](./change-events.md#sheet-errors)) for the _current_ pending authorization,
  then resolves — it does not wait for, or expose, whatever the user does next. If PassKit fires a second
  authorization after that (the user corrected the fields and resubmitted), this package fails and dismisses it
  automatically instead of silently hanging, and that resubmission is lost — a real re-presentation would need a
  new native show-path (a second, JS-observable authorization channel) that is out of scope here. On Android,
  `retry()` is a documented no-op: it resolves without any visual effect, consistent with `complete()` and
  `abort()`'s existing no-op boundary on Android (Google Pay's sheet is a separate activity with no in-sheet
  update mechanism at all).

## References

- [api/payment-response.md](../api/payment-response.md)
- [api/payment-validation-errors.md](../api/payment-validation-errors.md)
