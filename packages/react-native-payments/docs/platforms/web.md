# Web (react-native-web)

`payment-request.web.ts` / `payment-response.web.ts` are one-line passthroughs — `PaymentRequest` and
`PaymentResponse` resolve to `window.PaymentRequest` / `window.PaymentResponse` (or `null` when `window` is not
defined, e.g. during SSR), typed as `WebPaymentRequestConstructor` / `WebPaymentResponseConstructor` — aliases
for the browser's own `typeof window.PaymentRequest` / `typeof window.PaymentResponse` from `lib.dom`. On web
there is no TurboModule, no native class and none of this package's own logic in the loop: you get the browser's
implementation of the W3C Payment Request API, unmodified.

> **Type visibility caveat:** a bundler that platform-resolves `.web.ts` files (Metro building for the web
> target, `react-native-web` webpack configs) swaps in this passthrough at *runtime* regardless of what
> TypeScript shows you. `src/index.ts` re-exports the platform-agnostic `PaymentRequest` / `PaymentResponse`
> specifiers without a build-time branch, so a plain `tsc`/IDE setup resolves
> `import { PaymentRequest } from '@rnw-community/react-native-payments'` to the native class documented in
> [api/payment-request.md](../api/payment-request.md) on every platform, web included. Add
> `"moduleSuffixes": [".web", ".native", ""]` (or an order matching your own bundler's platform resolution) to
> your app's `tsconfig.json` if you need the IDE/`tsc` to show the true DOM types for a web build.

Apple Pay through this browser passthrough is **not** the native iOS integration documented in
[platforms/ios.md](./ios.md) — calling `show()` in Safari drives Safari's own Apple Pay JS flow, which fires a
`merchantvalidation` event that your own server must answer by completing Apple's merchant validation session
round-trip (TLS, your merchant certificate, Apple's validation URL) before the sheet can display line items.
There is no `merchantIdentifier` Expo plugin config, no PassKit entitlement and no `merchantCapabilities` on this
path — see [Apple Pay on the Web](https://developer.apple.com/documentation/apple_pay_on_the_web).

Browser support is inconsistent: Chrome, Edge and Safari (with the merchant-validation caveat above) implement
the Payment Request API; Firefox removed its implementation. Check [caniuse](https://caniuse.com/payment-request)
before shipping a web checkout on top of it, and always guard for `PaymentRequest`/`PaymentResponse` being
**nullish** (a truthiness or `== null` check, never `=== null`) — the passthrough returns `null` outside a
`window` (SSR), while an unsupported browser has no `window.PaymentRequest` at all, so the export resolves to
`undefined` there.

## Known deviations from the native classes

None of the native-only behavior documented for the `PaymentRequest`/`PaymentResponse` classes applies to the
browser's own implementation:

- **`couponCode`** — populated only by the iOS 15+ PassKit `couponcodechange` flow; the browser's
  `PaymentRequest` has no `couponCode` property.
- **Normalized `AbortError`** — dismissing the sheet on web throws the browser's own native `DOMException`, not
  this package's [`PaymentsErrorEnum`](../api/payments-error-enum.md)-driven `DOMException`;
  `isNativeUserCancellation` never runs on web.
- **Single-use request semantics** — the native class tracks `state: 'created' | 'interactive' | 'closed'` itself
  and rejects a reused, settled request with its own `InvalidStateError`. The browser enforces single-use per the
  W3C spec independently, through its own internal slots, not this package's state machine. See
  [architecture.md](../architecture.md).
- **Listener auto-cleanup** — the request-scoped subscription bookkeeping and automatic teardown on
  `show()`/`abort()` described in [guides/change-events.md](../guides/change-events.md) is this package's
  `NativeEventEmitter` plumbing over the TurboModule. The browser's `PaymentRequest` follows plain DOM
  `addEventListener`/`removeEventListener` semantics with no auto-cleanup — remove your own listeners when you
  are done with them.

## Usage

Detailed guide can be found at:

- [developer.mozilla.org](https://developer.mozilla.org/en-US/docs/Web/API/Payment_Request_API/Using_the_Payment_Request_API)
  as the API is fully compliant.
- [Google Web Payments guide](https://web.dev/payments/).
