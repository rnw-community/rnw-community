# getNativePaymentsEventEmitter

Resolves the single emitter used by every `PaymentRequest` to receive change events from the native `Payments` module. It
is built from the same module handle used for method calls, so old architecture, New Architecture and bridgeless all
resolve one instance. It returns `null` while the native module cannot emit events, which is what keeps `show()` working
on a native side that does not implement the change-event contract yet.

```ts
import { getNativePaymentsEventEmitter } from './util/get-native-payments-event-emitter/get-native-payments-event-emitter.util';

const subscription = getNativePaymentsEventEmitter()?.addListener('shippingaddresschange', payload => payload.requestId);
subscription?.remove();
```

## JS <-> native contract

The methods below are members of the codegen `Spec` in `NativePayments.ts` — `Payments.mm` (`RCTEventEmitter`) and
`PaymentsModule.java` both implement them. `NativePaymentsChangeEventsInterface` keeps them optional at the type level and
`NativePayments` subtracts them from the `Spec` type, so a JS bundle running against an older installed binary that lacks
them degrades to the v2 behaviour instead of crashing: every call site guards with `isDefined` and
`getNativePaymentsEventEmitter()` returns `null`.

### Native -> JS events

Event names are the W3C event types, emitted through `RCTEventEmitter` (`supportedEvents`):

| Event name              | Payload                                               |
| ----------------------- | ----------------------------------------------------- |
| `paymentmethodchange`   | `{ requestId, eventId, methodName?, methodDetails? }` |
| `shippingaddresschange` | `{ requestId, eventId, shippingAddress? }`            |
| `shippingoptionchange`  | `{ requestId, eventId, shippingOption? }`             |
| `couponcodechange`      | `{ requestId, eventId, couponCode? }`                 |

`requestId` is the `PaymentRequest.id` passed to `show()` — JS drops events whose `requestId` belongs to another or to an
already finished request. `eventId` is a monotonic counter identifying the native completion handler the event belongs to;
JS echoes it back untouched. `shippingOption` is the selected option `id`.

`shippingAddress` follows `PaymentResponseAddressInterface`. PassKit **redacts** the contact of an in-sheet address change
for privacy: only the coarse fields arrive (`address2` from `city`, `address3` from `state`, plus `postalCode` and
`countryCode`), while `address1` (street) and the name, email and phone are empty until the payment is authorized. A
listener therefore quotes shipping from the postal code and country, not from the street.

### JS -> native handshake

`setActiveEvents(requestId: string, eventNames: string[])` is called whenever the listener set of a request changes and
again from `show()`. It declares the event types that currently have a JS listener **for that request**, so a second
`PaymentRequest` never clobbers the registrations of the first one. Native must only invoke its `didSelect…` delegates
(and therefore wait for a response) for the declared types, and must complete immediately with a no-change update for
everything else. An empty array means the request is finished — pending completions are flushed with no-change updates.
It is sent on every add and remove, including while the sheet is open, and never again once the request is closed.

### JS -> native response

`updatePaymentDetails(update, displayItems, shippingOptions)` is called exactly once per delivered event, after the
listener and its `updateWith` promise settle. A listener that throws, rejects, never calls `updateWith`, supplies details
that fail validation, or leaves its update pending past the change-event timeout still produces this call, carrying the
unchanged details — native never waits. The call is skipped only when the request finished in the meantime, in which case
native has already torn the sheet down.

- `update`: `{ requestId, eventName, eventId?, total, error }` — `total` is a `PaymentItem`, `error` is `''` when there is
  none, `eventId` is the one carried by the answered event and is omitted when the event did not carry one
- `displayItems`: array of `PaymentItem`
- `shippingOptions`: array of `PaymentShippingOption`

`displayItems`, `total` and `shippingOptions` are the same shapes `show()` receives in `details`, and iOS converts them
with the same converters in both flows, so an option renders identically whether it came with the initial details or with
an update:

| `PaymentShippingOption` | `PKShippingMethod`                       |
| ----------------------- | ---------------------------------------- |
| `id`                    | `identifier`                             |
| `label`                 | `label` (`summaryItemWithLabel:amount:`) |
| `amount.value`          | `amount` (`NSDecimalNumber`)             |
| `amount.currency`       | not sent — the sheet uses `currencyCode` |
| `detail`                | `detail`                                 |
| `selected`              | not sent — PassKit selects the first row |

An option whose `id`, `label` or `amount.value` is not a string is skipped with a warning instead of reaching the sheet
as a `NaN` amount. A `PaymentItem` becomes a `PKPaymentSummaryItem` under the same rules, with `pending: true` selecting
`PKPaymentSummaryItemTypePending` and an unusable amount falling back to zero.

Native resolves the completion only when the answered `eventId` is still the pending one: a second change event of the
same type supersedes the first, and the answer of the superseded event is rejected with `no_completion` instead of being
applied to the newer handler. An update without an `eventId` is accepted, which is what keeps an older JS bundle working.

`addListener`/`removeListeners` are the `NativeEventEmitter` bookkeeping methods and carry no request semantics; their
presence is what tells JS that the native module can emit change events at all.

## iOS semantics

The module is a singleton, so exactly one request is interactive at a time:

- `setActiveEvents` adopts `requestId` as the active one when no sheet is presented. While a sheet is presented, a call
  carrying a different `requestId` is logged and ignored — the events of the presented request keep working.
- An empty `eventNames` for the active request releases the request: the active set and the active `requestId` are
  cleared and pending completions are flushed, while the summary items of the presented sheet are kept, so removing the
  last listener mid-sheet degrades to the no-listener behaviour instead of breaking the sheet. Because the release also
  drops the active `requestId`, the request that comes next is always adopted, even when the previous sheet was never
  completed.
- `show()` flushes what a previous sheet left pending and forgets that a sheet is presented, so a request that never
  reached a terminal path cannot disable the events of the requests after it.
- `PKPaymentRequest.shippingMethods` is filled from `details.shippingOptions` and `supportsCouponCode` — together with
  the `couponCode` prefilled from the iOS method data — is enabled only
  when `shippingoptionchange` / `couponcodechange` are active for the request; the shipping methods of an
  `updatePaymentDetails` are applied under the same condition, so a picker never appears for a request that cannot answer
  its selection. A request without listeners is therefore functionally unchanged against v2 — the same summary items, the
  same sheet — with the difference that PassKit now asks on every change and gets an immediate no-change answer, a
  main-thread round trip that shows as a brief spinner on the card or address row.

Every `didSelectShippingContact` / `didSelectShippingMethod` / `didSelectPaymentMethod` / `didChangeCouponCode` handler is
stored in a per-event-type registry together with its `eventId` and taken out of it in the same step that invokes it, so
it fires exactly once and is never dropped without being invoked:

- event type not active (no listener, other request, JS not observing) -> invoked immediately with the current summary
  items and no errors, and no JS event is emitted
- event type active -> the handler waits while JS dispatches, and `updatePaymentDetails` invokes it with the new summary
  items, shipping methods and error
- a second event of the same type supersedes the first: the pending handler is flushed with no change before the new one
  is stored under a new `eventId`
- `paymentAuthorizationViewControllerDidFinish`, `didAuthorizePayment`, `complete`, `abort`, `show`, `stopObserving` and
  `invalidate` flush every still pending handler with the current summary items, so the sheet can never hang;
  `invalidate` also dismisses the sheet it was still presenting, which is what keeps a reload from leaving a sheet with a
  dangling delegate on screen
- `updatePaymentDetails` with no pending handler for the event, or with the `eventId` of a superseded one (late answer,
  dismissed sheet, other request) rejects with `no_completion` and changes nothing

A string `update.error` reaches PassKit as `paymentShippingAddressUnserviceableError` for `shippingaddresschange`,
`paymentCouponCodeInvalidError` for `couponcodechange` (iOS 15+) and a `PKPaymentUnknownError` for `paymentmethodchange`
(iOS 15+). An object `update.error` is a field level error and is mapped by its `type` instead of by the event:
`shippingAddressField` to `paymentShippingAddressInvalidErrorWithKey:` with the `CNPostalAddress` key of `error.key`,
`contactField` to `paymentContactInvalidErrorWithContactField:` with the `PKContactField` of `error.field` and
`couponCode` to `paymentCouponCodeExpiredError` or `paymentCouponCodeInvalidError` (iOS 15+). An unknown type, an unknown
field or an empty message resolves the event without an error. `shippingoptionchange` has no error slot in
`PKPaymentRequestShippingMethodUpdate`, so an error answered there is logged and dropped.

## Android semantics

Google Pay renders its sheet in its own activity and never asks the app for an in-sheet update, so `setActiveEvents`,
`updatePaymentDetails`, `addListener` and `removeListeners` exist to satisfy the shared spec and are documented no-ops:
`updatePaymentDetails` resolves right away and no change event is ever emitted.
