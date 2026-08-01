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

The methods below are declared as optional members of `NativePaymentsChangeEventsInterface` and are called only when the
native module actually exposes them. They move into the codegen `Spec` in `NativePayments.ts` once the iOS and Android
implementations land, because every member of that spec has to exist in `Payments.mm` and `PaymentsModule.java`.

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
