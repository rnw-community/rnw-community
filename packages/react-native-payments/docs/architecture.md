# How it works

`PaymentRequest` is a thin JS state machine (`created` → `interactive` → `closed`) sitting on top of one
TurboModule, `Payments` (`NativePayments.ts` → `Payments.mm` on iOS, `PaymentsModule.java` on Android). Method
calls (`show`, `abort`, `canMakePayment`) go JS → native directly through the module. Change events flow the
other way — native → JS — through a `NativeEventEmitter` built over the same module handle, scoped to the
request that is currently on screen:

```text
 JS                                            Native (PassKit / Google Pay)
 ┌────────────────────────┐  show(requestId, …)  ┌───────────────────────────────┐
 │ PaymentRequest          │ ───────────────────▶ │ Payments TurboModule          │
 │ created -> interactive  │                       │ (Payments.mm / …Module.java) │
 └────────────┬────────────┘                       └───────────────┬───────────────┘
              │ addEventListener(type)                              │
              │ ── setActiveEvents(requestId, types) ──────────────▶│
              │                                                     │
              │◀─ shippingaddresschange {requestId, eventId, …} ────┤  (request-scoped emit)
              ▼
 ChangeEventDispatcher.dispatch(listeners)
              │ listener runs, calls updateWith(details) — or times out (changeEventTimeoutMs)
              ▼
 updatePaymentDetails(update, displayItems, shippingOptions) ───────▶  resolves the *pending*
   update = { requestId, eventId, eventName, total, error }           completion for that eventId
              │
              ▼
 show() resolves/rejects ── closeRequest() ──▶  state: closed  (single-use — see below)
```

## Why events are request-scoped

The native module is a singleton — exactly one sheet can be interactive at a time — but a JS app can construct
several `PaymentRequest` instances in a session (retries, different carts). `show()` passes the request's own
`id`, native adopts it as the `activeRequestId`, and every event and completion carries `requestId` / `eventId`
so a second request can never intercept or answer the first one's events. The full contract — every native
method, payload shape and teardown path — is documented in
[get-native-payments-event-emitter.md](../src/util/get-native-payments-event-emitter/get-native-payments-event-emitter.md);
the JS-side dispatch/timeout/answer lifecycle for one event is in
[change-event-dispatcher.md](../src/class/change-event-dispatcher/change-event-dispatcher.md).

## Why a request is single-use

The W3C spec already moves a settled `PaymentRequest` to a `closed` state; this package treats that state as
terminal instead of reusable. Reusing a request would mean keeping its native event subscriptions alive with no
terminal path left to release them, since `show()`/`abort()` are what tear them down. Making `closed` permanent
gives every request exactly one teardown path, guarantees against a leaked native listener, and keeps the
request-scoping guarantee above simple — a `requestId` is only ever active once. See
[guides/migrate-from-v2.md](./guides/migrate-from-v2.md) for the concrete behavior change, and the platform pages
([platforms/ios.md](./platforms/ios.md), [platforms/android.md](./platforms/android.md),
[platforms/web.md](./platforms/web.md)) for how this differs from the spec.

## `NotSupportedError` thrown at construction, not at `show()`

The spec rejects `show()`'s promise with `NotSupportedError` when no payment handler is available; this
implementation instead throws synchronously from the `PaymentRequest` constructor as soon as it fails to find a
platform-matching payment method, since the native bridge needs to know the target platform's method data up
front to serialize the request. The error name matches the spec; only the algorithm step it fires from differs.
See [guides/errors.md](./guides/errors.md).

For the full class/file layout and the native-side invariants that keep this contract intact across old
architecture, New Architecture and bridgeless, see [AGENTS.md](../AGENTS.md).
