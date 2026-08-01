# @rnw-community/react-native-payments

W3C Payment Request API implementation for React Native — Apple Pay (iOS) and Google Pay (Android). Includes Expo config plugin.

## Package Commands

```bash
yarn test && yarn test:coverage && yarn build && yarn ts && yarn lint:fix
```

## Architecture

```
src/
  @standard/
    android/     — Android-specific enums, request/response types, payment method data
    ios/         — iOS-specific enums (PKContact, PKMerchantCapability, PKPaymentNetworks), request/response types
    w3c/         — W3C standard types (PaymentItem, PaymentDetailsInit, PaymentMethodData)
  class/
    change-event-dispatcher/        — ChangeEventDispatcher (one change-event lifecycle: dispatch, answer, timeout)
    native-payments/                — NativePayments (thin TurboModule wrapper)
    payment-request/                — PaymentRequest (main class), payment-request.web.ts (browser shim)
    payment-request-update-event/   — PaymentRequestUpdateEvent (updateWith)
    payment-method-change-event/    — PaymentMethodChangeEvent (extends PaymentRequestUpdateEvent)
    payment-response/               — PaymentResponse, IosPaymentResponse, AndroidPaymentResponse, web shims
  constant/      — changeEventTimeoutMs
  enum/          — PaymentMethodNameEnum, EnvironmentEnum, PaymentComplete, SupportedNetworkEnum
  error/         — ConstructorError, DOMException, PaymentsError
  expo-plugins/  — withApplePay, withGooglePay, withPayments (Expo config plugin)
  interface/     — GenericPaymentMethodDataDataInterface, PaymentResponseAddress, change-event payload/registration/native update
  type/          — AmountValue, PaymentRequestEventType, change-event listener types
  util/          — Validation utilities (monetary values, display items, payment methods, totals, updated details),
                   getNativePaymentsEventEmitter + the JS<->native change-event contract (.md), change-event logging
  NativePayments.ts — TurboModule spec (TurboModuleRegistry.get<Spec>('Payments'))
  app.plugin.ts  — Expo plugin entry point
```

### Subpath Exports

`./app.plugin` (Expo plugin), `./package.json`

### Key Patterns

- `.web.ts` suffix for web platform overrides (browser's native PaymentRequest)
- `@standard/` separates W3C spec types from platform-specific types
- TurboModule architecture (React Native New Architecture codegen)
- Expo plugin (`withPayments`) composes `withApplePay` + `withGooglePay`
- `PaymentRequest` constructor validates per W3C spec, then serializes platform-specific JSON for native bridge
- The change-event methods (`setActiveEvents`, `updatePaymentDetails`, `addListener`, `removeListeners`) are members of
  the codegen `Spec`, so they have to exist in `Payments.mm`, `PaymentsModule.java` and both `android/src/*arch`
  `PaymentsSpec.java` variants — the TS spec and the three native surfaces only ever change together, in one commit
- `NativePayments` types them through `NativePaymentsChangeEventsInterface & Omit<Spec, …>` so they stay optional and
  every call site keeps its `isDefined` guard: a new JS bundle on an older installed binary degrades to the v2 flow,
  `getNativePaymentsEventEmitter()` returns `null` and `show()` keeps working on both architectures
- iOS delivers the events from `Payments.mm` (an `RCTEventEmitter`): every PassKit `didSelect…`/`didChange…` handler goes
  into a per-event-type registry, is taken out of it before being invoked (single fire), completes immediately with a
  no-change update when its event type is not active for the current request, and is flushed on every teardown path
  (`didFinish`, `didAuthorizePayment`, `complete`, `abort`, `stopObserving`, `invalidate`) so the sheet cannot hang.
  Android answers the same contract with documented no-ops. The semantics live in
  `src/util/get-native-payments-event-emitter/get-native-payments-event-emitter.md`
- Change events are request-scoped: native events carry the request `id`, `setActiveEvents(requestId, eventNames)` scopes
  the handshake per request, one native subscription per event type feeds every listener registered for it, and
  subscriptions are removed on every terminal path (`show()` resolve/reject, `abort()`)
- Listeners run sequentially and dispatch stops at the first one that answers with `updateWith`, mirroring the stop
  immediate propagation flag of the W3C algorithm; a listener that throws is logged and the next one still runs
- Every delivered change event answers native exactly once through `updatePaymentDetails`, even when the listener fails,
  never returns or leaves its update pending: `ChangeEventDispatcher` races **one** `changeEventTimeoutMs` deadline over
  the listener bodies and their answer together, so a listener awaiting a request that never settles cannot pin a native
  completion
- Native events carry a monotonic `eventId` that JS echoes back in the update, and native resolves a completion only for
  the `eventId` it is still waiting for, so the answer of a superseded event can never be applied to the newer one
- A dispatch is bound to an event generation bumped on every terminal path, so a response that arrives after the sheet
  finished is dropped instead of reaching native, and an event arriving while another one is processed is answered
  immediately with the unchanged details — its selection is still recorded on the request first, so
  `shippingAddress` / `shippingOption` / `couponCode` always mirror the latest selection of the sheet and never a
  superseded one
- `show()` resolve/reject and `abort()` all funnel through `closeRequest()`: the state becomes `closed` before the
  registrations are dropped, so an event racing the emitter teardown is ignored even though its handler is still alive
- A `PaymentRequest` is single-use: once it is `closed`, `show()` rejects with `InvalidStateError` and `addEventListener`
  is inert, which is what keeps a subscription from being created without a terminal path left to remove it. This is a
  deliberate v3 behavior change — earlier drafts let a settled request re-register listeners and show again; consumers
  construct a new `PaymentRequest` to retry

### Dependencies

`@expo/config-plugins`, `@rnw-community/shared`, `react-native-uuid`, `validator`. Peers: `react`, `react-native`, `expo`.

### Coverage

Custom: branches **92%** (platform-conditional code), rest **99.9%**.

### TypeScript Config

Uses `"lib": ["es2021", "DOM"]` in all tsconfigs (needs DOM types for W3C Payment API).
