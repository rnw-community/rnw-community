# Payment change events

While the payment sheet is open the user can change the shipping address, the shipping option, the payment card
or a coupon code. `PaymentRequest` models these as W3C change events: register listeners **before** calling
`show()` and answer each event with `PaymentRequestUpdateEvent.updateWith()`.

> **Platform support.** On iOS the events are delivered by PassKit: the payment sheet waits for the answer of a
> listener and is completed with the unchanged details whenever there is no listener for the event type, the
> listener fails or the sheet is torn down, so it can never hang. On Android the Google Pay sheet runs in its own
> activity and never asks the app for an in-sheet update, so listeners can be registered but never fire. On web
> the browser's own `PaymentRequest` is used, so change events there follow the browser implementation. A request
> without listeners shows the same sheet with the same summary items as before — PassKit now asks the app on
> every change and is answered immediately with no change, which is a main thread round trip and no longer a
> purely local update. The end to end verification on devices is tracked in
> [#393](https://github.com/rnw-community/rnw-community/issues/393).
>
> iOS only shows the shipping method picker and the coupon code field (iOS 15+) when a `shippingoptionchange` /
> `couponcodechange` listener is registered before `show()` — `details.shippingOptions` are passed to PassKit in
> that case.

## `PaymentRequest.addEventListener(type, listener)`

Registers the listener for one of `shippingaddresschange`, `shippingoptionchange`, `paymentmethodchange` or
`couponcodechange` (the last one is a PassKit extension, not part of the W3C specification). Several listeners
can be registered for the same event type — they run in registration order and the same function is never
registered twice. Dispatch stops at the first listener that answers with `updateWith`, exactly like the stop
immediate propagation flag of the W3C algorithm. One native subscription is kept per event type no matter how
many listeners are added and removed, and events are scoped to the request they belong to, so concurrent
`PaymentRequest` instances never see each other's events. Listeners are released when `show()` settles and when
`abort()` resolves; registering on a closed request does nothing because a request is single-use — create a new
`PaymentRequest` to show the sheet again.

```ts
paymentRequest.addEventListener('shippingaddresschange', event => {
    event.updateWith({
        total: { label: 'Total', amount: { currency: 'USD', value: '25.00' } },
        displayItems: [{ label: 'Shipping', amount: { currency: 'USD', value: '5.00' } }],
    });
});
```

## `PaymentRequest.removeEventListener(type, listener)`

Removes the passed listener from the event type, matching the `EventTarget` signature. The native subscription
is released once the last listener of the type is gone, and native is told about the remaining event types right
away — also while the payment sheet is open.

```ts
paymentRequest.removeEventListener('shippingaddresschange', onShippingAddressChange);
```

## Event-handler attributes

`onshippingaddresschange`, `onshippingoptionchange`, `onpaymentmethodchange`, `oncouponcodechange` are thin
property alternatives to `addEventListener`/`removeEventListener`, one per event type, matching the
`EventTarget` IDL attribute semantics: assigning a function **replaces** the previously assigned attribute
handler (an implicit `removeEventListener` of the old one followed by `addEventListener` of the new one);
assigning `null` clears it without registering a new listener; reading the property returns the currently
assigned handler, or `null` when none was set. The attribute handler is otherwise an ordinary listener — it
coexists with every listener registered through `addEventListener` for the same type and runs in the order it
was (re-)registered.

```ts
paymentRequest.onshippingaddresschange = event => {
    event.updateWith({
        total: { label: 'Total', amount: { currency: 'USD', value: '25.00' } },
        displayItems: [{ label: 'Shipping', amount: { currency: 'USD', value: '5.00' } }],
    });
};

paymentRequest.onshippingaddresschange = null; // clears it
```

## `PaymentRequestUpdateEvent.updateWith(detailsOrPromise)`

Answers the event with updated `PaymentDetailsUpdate` — `total`, `displayItems`, `shippingOptions` and `error`
are all optional and only the provided members replace the current details. It accepts a promise, so a listener
can await a server call before answering:

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

Every `PaymentShippingOption` needs an `id`, a `label` and an `amount`, because iOS renders the row from the
label and the amount and reports the selection back by the id. `detail` is optional and is shown by Apple Pay as
the secondary line of the row (`PKShippingMethod.detail`); `amount.currency` is ignored because the sheet is
already bound to the `currencyCode` of the method data. The initial `details.shippingOptions` and the ones
answered with `updateWith` go through the same conversion, so the same option always renders the same row.

> `selected` is part of the W3C dictionary but is **silently ignored on iOS**: PassKit has no preselection
> support and always shows its shipping-method picker with the first option of the array highlighted. Put the
> option you want preselected first in `shippingOptions` instead of relying on `selected`.

```ts
const shippingOptions = [
    { id: 'express', label: 'Express', detail: 'Next business day', amount: { currency: 'USD', value: '5.00' } },
    { id: 'ground', label: 'Ground', detail: '3-5 business days', amount: { currency: 'USD', value: '0.00' } },
];
```

Calling `updateWith` twice, or calling it once the event was already answered or the request is no longer
showing, throws a `DOMException` with `InvalidStateError`. A listener that throws, rejects, sends invalid
details, never calls `updateWith` or leaves its promise pending for more than 30 seconds is logged and answered
with the unchanged details, so the payment sheet never stalls. Updated details go through the same validation as
the ones passed to the constructor — the total, the display items and the shipping options all have to carry a
valid decimal monetary value, and a shipping option also has to carry an id and a label — so a malformed amount
is reported to the console and never reaches the sheet.

## Sheet errors

`error` is either a plain string or a field level error that Apple Pay renders inline, next to the offending row
of the sheet, instead of as a generic banner. A string keeps the previous behaviour: an unserviceable shipping
address for `shippingaddresschange`, an invalid coupon code for `couponcodechange` (iOS 15+) and a generic
payment error everywhere else. `shippingoptionchange` has no error slot in PassKit, so an error answered there is
ignored.

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

| `error.type` | Additional member | iOS `PKPaymentErrorDomain` error |
| --- | --- | --- |
| `shippingAddressField` | `key: PaymentAddressFieldEnum` | `paymentShippingAddressInvalidErrorWithKey:` |
| `contactField` | `field: PaymentContactFieldEnum` | `paymentContactInvalidErrorWithContactField:` |
| `couponCode` | `expired?: boolean` | `paymentCouponCodeInvalidError` / `paymentCouponCodeExpiredError` (iOS 15+) |

`PaymentAddressFieldEnum` maps onto the `CNPostalAddress` keys PassKit accepts: `addressLine` (street), `city`,
`country` (ISO country code), `dependentLocality` (sub locality), `postalCode`, `region` (state) and
`subAdministrativeArea`. `PaymentContactFieldEnum` maps onto `PKContactField`: `email`, `name`, `phone` and
`postalAddress`. An unknown field, an empty message or a coupon error below iOS 15 is dropped and the sheet is
answered with the updated details only. Android ignores every error because Google Pay never asks the app for an
in-sheet update.

## `PaymentRequestUpdateEvent.isAnswered`

`true` once `updateWith` was called for the event. A listener built from several helpers can check it before
answering a second time:

```ts
paymentRequest.addEventListener('shippingoptionchange', event => {
    applyExpressSurcharge(event);

    if (!event.isAnswered) {
        event.updateWith({ total: { label: 'Total', amount: { currency: 'USD', value: '25.00' } } });
    }
});
```

## `PaymentMethodChangeEvent`

The event delivered for `paymentmethodchange` extends `PaymentRequestUpdateEvent` with the selected method:

```ts
paymentRequest.addEventListener('paymentmethodchange', event => {
    if (event.methodDetails?.['network'] === 'Amex') {
        event.updateWith({ error: 'Amex is not supported for this order' });
    }
});
```

## Changed values on the request

Before a listener runs, the changed value is stored on the request: `paymentRequest.shippingAddress`
(`PaymentResponseAddressInterface`), `paymentRequest.shippingOption` (the selected `PaymentShippingOption` id)
and `paymentRequest.couponCode`. On iOS the shipping address of a change event is **redacted** by PassKit: only
`address2` (city), `address3` (state), `postalCode` and `countryCode` are filled, while the street and the payer
name, email and phone stay empty until the payment is authorized — quote shipping from the postal code and the
country, never from the street. `paymentRequest.updating` is `true` while an event is being processed; a change
event that arrives during that window is answered with the unchanged details and is not dispatched to the
listeners, but its selection is still stored on the request, so these values always describe what the sheet
shows right now.

## References

- [`PaymentRequestUpdateEvent`](https://www.w3.org/TR/payment-request/#dom-paymentrequestupdateevent)
- [`PaymentMethodChangeEvent`](https://www.w3.org/TR/payment-request/#dom-paymentmethodchangeevent)
- [api/payment-request-update-event.md](../api/payment-request-update-event.md)
- [api/events-types.md](../api/events-types.md)
