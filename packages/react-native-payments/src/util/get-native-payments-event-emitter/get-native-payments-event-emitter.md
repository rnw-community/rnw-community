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

| Event name              | Payload                                      |
| ----------------------- | -------------------------------------------- |
| `paymentmethodchange`   | `{ requestId, methodName?, methodDetails? }` |
| `shippingaddresschange` | `{ requestId, shippingAddress? }`            |
| `shippingoptionchange`  | `{ requestId, shippingOption? }`             |
| `couponcodechange`      | `{ requestId, couponCode? }`                 |

`requestId` is the `PaymentRequest.id` passed to `show()` — JS drops events whose `requestId` belongs to another or to an
already finished request. `shippingAddress` follows `PaymentResponseAddressInterface`, `shippingOption` is the selected
option `id`.

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

- `update`: `{ requestId, eventName, total, error }` — `total` is a `PaymentItem`, `error` is `''` when there is none
- `displayItems`: array of `PaymentItem`
- `shippingOptions`: array of `PaymentShippingOption`

`addListener`/`removeListeners` are the `NativeEventEmitter` bookkeeping methods and carry no request semantics; their
presence is what tells JS that the native module can emit change events at all.

## iOS semantics

The module is a singleton, so exactly one request is interactive at a time:

- `setActiveEvents` adopts `requestId` as the active one when no sheet is presented. While a sheet is presented, a call
  carrying a different `requestId` is logged and ignored — the events of the presented request keep working.
- An empty `eventNames` for the active request empties the active set and flushes pending completions, but keeps the
  summary items of the presented sheet, so removing the last listener mid-sheet degrades to the no-listener behaviour
  instead of breaking the sheet.
- `PKPaymentRequest.shippingMethods` is filled from `details.shippingOptions` and `supportsCouponCode` is enabled only
  when `shippingoptionchange` / `couponcodechange` are active for the request, which keeps a request without listeners
  byte-for-byte identical to the v2 sheet.

Every `didSelectShippingContact` / `didSelectShippingMethod` / `didSelectPaymentMethod` / `didChangeCouponCode` handler is
stored in a per-event-type registry and taken out of it before being invoked, so it fires exactly once:

- event type not active (no listener, other request, JS not observing) -> invoked immediately with the current summary
  items and no errors, and no JS event is emitted
- event type active -> the handler waits while JS dispatches, and `updatePaymentDetails` invokes it with the new summary
  items, shipping methods and error
- `paymentAuthorizationViewControllerDidFinish`, `didAuthorizePayment`, `complete`, `abort`, `stopObserving` and
  `invalidate` flush every still pending handler with the current summary items, so the sheet can never hang
- `updatePaymentDetails` with no pending handler for the event (late answer, dismissed sheet, other request) rejects with
  `no_completion` and changes nothing

`update.error` reaches PassKit as `paymentShippingAddressUnserviceableError` for `shippingaddresschange`,
`paymentCouponCodeInvalidError` for `couponcodechange` (iOS 15+) and a `PKPaymentUnknownError` for `paymentmethodchange`
(iOS 15+). `shippingoptionchange` has no error slot in `PKPaymentRequestShippingMethodUpdate`, so an error answered there
is logged and dropped.

## Android semantics

Google Pay renders its sheet in its own activity and never asks the app for an in-sheet update, so `setActiveEvents`,
`updatePaymentDetails`, `addListener` and `removeListeners` exist to satisfy the shared spec and are documented no-ops:
`updatePaymentDetails` resolves right away and no change event is ever emitted.
