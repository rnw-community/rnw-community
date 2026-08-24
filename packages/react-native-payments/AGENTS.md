# @rnw-community/react-native-payments

W3C Payment Request API implementation for React Native — Apple Pay (iOS) and Google Pay (Android). Includes Expo config plugin.

See [readme.md](readme.md) for the human-facing installation and usage guide. For a curated, agent-oriented index of
every doc in this package (API surface, change-event contract, E2E boundary), see [llms.txt](llms.txt) (or
[llms-full.txt](llms-full.txt) for the same tree fully inlined in one file).

## Docs

Pure-Markdown tree, one topic per file, relative links only:

```text
readme.md                          compact landing — value prop, install, quickstart, doc map
docs/
  getting-started/                 install.md + one quickstart per platform (ios/android/expo)
  platforms/                       ios.md, android.md, web.md, expo.md — setup, capabilities, deviations per platform
  api/                             index.md + one file per entity group, mirroring src/index.ts
  guides/                          change-events, modifiers, errors, retry, testing, troubleshooting, migrate-from-v2,
                                    migrate-from-upstream
  architecture.md                  the WHY — JS<->native contract, single-use requests, event lifecycle
  roadmap.md                       W3C compliance checklist + open work as issue links (no bare TODOs elsewhere)
```

### Adding a new export

Every export reachable from `src/index.ts` needs a `docs/api/<entity>.md` entry (grouped with a tightly-coupled
sibling only when the existing tree already groups that pair, e.g. a platform's `*DataInterface` with its
`*DataDataInterface`). Each entity file follows this exact section order:

1. **What & why** — one paragraph: the problem this entity solves, when to reach for it.
2. **How** — signature/options table, platform behavior matrix where it differs.
3. **Example** — one minimal compiling example (more only if platforms diverge).
4. **Pitfalls** — real ones only, sourced from issues/deviations — omit rather than invent one.
5. **References** — W3C anchor, Apple/Google doc links, and the guide/platform page with the full narrative.

Add the new file to [docs/api/index.md](docs/api/index.md) and to [llms.txt](llms.txt); regenerate
[llms-full.txt](llms-full.txt) by concatenating the doc tree in doc-map order, rebasing every embedded file's
relative links to be relative to the package root (llms-full.txt's own frame of reference) rather than leaving
them relative to the file they originally came from.

## Package Commands

```bash
pnpm test && pnpm test:coverage && pnpm build && pnpm ts && pnpm lint:fix
```

## Architecture

```
src/
  @standard/
    android/     — Android-specific enums, request/response types, payment method data
    ios/         — iOS-specific enums (PKContact, PKMerchantCapability, PKPaymentNetworks), request/response types
    w3c/         — W3C standard types (PaymentItem, PaymentDetailsInit, PaymentMethodData)
  class/
    change-event-dispatcher/        — ChangeEventDispatcher (one change-event lifecycle: dispatch, answer, timeout;
                                      internals documented in change-event-dispatcher.md)
    native-payments/                — NativePayments (thin TurboModule wrapper)
    payment-request/                — PaymentRequest (main class), payment-request.web.ts (browser shim)
    payment-request-update-event/   — PaymentRequestUpdateEvent (updateWith)
    payment-method-change-event/    — PaymentMethodChangeEvent (extends PaymentRequestUpdateEvent)
    payment-response/               — PaymentResponse, IosPaymentResponse, AndroidPaymentResponse, web shims
  constant/      — changeEventTimeoutMs
  enum/          — PaymentMethodNameEnum, EnvironmentEnum, PaymentComplete, SupportedNetworkEnum,
                   PaymentUpdateErrorTypeEnum + PaymentAddressFieldEnum + PaymentContactFieldEnum (field level errors)
  error/         — ConstructorError, DOMException, PaymentsError
  expo-plugins/  — withApplePay, withGooglePay, withPayments (Expo config plugin)
  interface/     — GenericPaymentMethodDataDataInterface, PaymentResponseAddress, change-event payload/registration/native update
  type/          — AmountValue, PaymentRequestEventType, PaymentDetailsUpdateError, change-event listener types
  util/          — Validation utilities (monetary values, display items, shipping options, payment methods, totals,
                   updated details), getNativePaymentsEventEmitter + the JS<->native change-event contract (.md),
                   change-event logging
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
- `PaymentRequest` constructor validates per W3C spec, then serializes platform-specific JSON for native bridge; the
  total, the display items and the shipping options run through the same validators on the change-event path, so an
  update that fails them is answered like a failing listener and never reaches the sheet
- `details.modifiers` is resolved against the platform's active payment method (`PaymentMethodNameEnum.ApplePay` on
  iOS, `AndroidPay` on Android) in `resolvePaymentDetailsModifier`: a matching modifier's `total` overrides the
  effective total and its `additionalDisplayItems` are appended to `displayItems` before either reaches native (Android
  `transactionInfo` at construction, iOS PassKit summary items at `show()`); a modifier for the other platform's method
  is left untouched. The same resolution re-runs on every `updateWith()` so a listener can ship new modifiers with the
  rest of the update; `this.details` always keeps the raw, unresolved values it was given
- iOS builds `PKShippingMethod` and `PKPaymentSummaryItem` with one converter each for the initial `show()` details and
  for `updatePaymentDetails`, so an option or an item renders the same in both flows: label, amount, identifier and the
  optional detail for a shipping method, `PKPaymentSummaryItemTypePending` for a `pending` item
- `PaymentDetailsUpdate.error` is either a string or a discriminated field error mapped onto the matching
  `PKPaymentErrorDomain` constructor (shipping address key, contact field, invalid/expired coupon code)
- Every iOS 15+ PassKit symbol is reached only from `applyCouponCodeSupportToRequest:methodData:`,
  `resolveCouponCodeChangeEventWithErrors:…`, `getCouponCodeErrorsWithMessage:expired:` and
  `getPaymentMethodUpdateWithSummaryItems:errors:`, so the file builds with `-Wunguarded-availability-new` as an error
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
  [get-native-payments-event-emitter.md](src/util/get-native-payments-event-emitter/get-native-payments-event-emitter.md)
- Change events are request-scoped: `show()` passes the request `id` to native so `activeRequestId` is adopted at
  presentation time regardless of whether any listener was ever registered, `setActiveEvents(requestId, eventNames)`
  scopes the handshake per request, one native subscription per event type feeds every listener registered for it, and
  subscriptions are removed on every terminal path (`show()` resolve/reject, `abort()`)
- `setActiveEvents` rejects a `requestId` that does not match the presented sheet's `activeRequestId`, including while
  `activeRequestId` is `nil` — a request that never called `show()` can never hijack the identity of the sheet another
  request has on screen; `activeRequestId` is only released on full teardown, not when a still-presented request opts
  out of every event type
- Listeners run sequentially and dispatch stops at the first one that answers with `updateWith`, mirroring the stop
  immediate propagation flag of the W3C algorithm; a listener that throws is logged and the next one still runs
- Every delivered change event answers native exactly once through `updatePaymentDetails`, even when the listener fails,
  never returns or leaves its update pending: [`ChangeEventDispatcher`](src/class/change-event-dispatcher/change-event-dispatcher.md)
  races **one** `changeEventTimeoutMs` deadline over the listener bodies and their answer together, so a listener
  awaiting a request that never settles cannot pin a native completion
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

`@expo/config-plugins`, `@rnw-community/shared`, `react-native-uuid`. Peers: `react`, `react-native`, `expo`.

### Coverage

**100%** for branches, lines, statements and functions.

### TypeScript Config

Uses `"lib": ["es2021", "DOM"]` in all tsconfigs (needs DOM types for W3C Payment API).

### E2E (arriving)

Unit tests cover the JS layer at 100%; on-device verification of the event API (sheet opens, shipping/coupon change
round-trip, async `updateWith` completion) is out of scope here and tracked across three follow-up issues instead:

- [#397](https://github.com/rnw-community/rnw-community/issues/397) ports the `maestro-e2e` agent skill into this
  repo's `.claude/skills`.
- [#393](https://github.com/rnw-community/rnw-community/issues/393) adds the Maestro flow suites (iOS simulator +
  Android emulator, both app targets) and the local `pnpm e2e:*` runner scripts.
- [#395](https://github.com/rnw-community/rnw-community/issues/395) wires `ios-maestro.yml` / `android-maestro.yml`
  CI workflows on the self-hosted fleet, with native build caching and failure artifacts.
