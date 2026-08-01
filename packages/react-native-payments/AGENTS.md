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
- The change-event native methods are NOT part of the codegen `Spec` yet: every `Spec` member has to exist in
  `Payments.mm` and `PaymentsModule.java`, so they live in `NativePaymentsChangeEventsInterface` as optional members and
  every call site guards with `isDefined`. `getNativePaymentsEventEmitter()` returns `null` while native cannot emit, so
  `show()` keeps working unchanged on both architectures. They move into `Spec` with the native implementations
- Change events are request-scoped: native events carry the request `id`, `setActiveEvents(requestId, eventNames)` scopes
  the handshake per request, one native subscription per event type feeds every listener registered for it, and
  subscriptions are removed on every terminal path (`show()` resolve/reject, `abort()`)
- Listeners run sequentially and dispatch stops at the first one that answers with `updateWith`, mirroring the stop
  immediate propagation flag of the W3C algorithm; a listener that throws is logged and the next one still runs
- Every delivered change event answers native exactly once through `updatePaymentDetails`, even when the listener fails or
  leaves its update pending past `changeEventTimeoutMs`
- A dispatch is bound to an event generation bumped on every terminal path, so a response that arrives after the sheet
  finished is dropped instead of reaching native, and an event arriving while another one is processed is answered
  immediately with the unchanged details

### Dependencies

`@expo/config-plugins`, `@rnw-community/shared`, `react-native-uuid`, `validator`. Peers: `react`, `react-native`, `expo`.

### Coverage

Custom: branches **92%** (platform-conditional code), rest **99.9%**.

### TypeScript Config

Uses `"lib": ["es2021", "DOM"]` in all tsconfigs (needs DOM types for W3C Payment API).
