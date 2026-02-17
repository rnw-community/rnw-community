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
    native-payments/   — NativePayments (thin TurboModule wrapper)
    payment-request/   — PaymentRequest (main class), payment-request.web.ts (browser shim)
    payment-response/  — PaymentResponse, IosPaymentResponse, AndroidPaymentResponse, web shims
  enum/          — PaymentMethodNameEnum, EnvironmentEnum, PaymentComplete, SupportedNetworkEnum
  error/         — ConstructorError, DOMException, PaymentsError
  expo-plugins/  — withApplePay, withGooglePay, withPayments (Expo config plugin)
  interface/     — GenericPaymentMethodDataDataInterface, PaymentResponseAddress
  util/          — Validation utilities (monetary values, display items, payment methods, totals)
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

### Dependencies

`@expo/config-plugins`, `@rnw-community/shared`, `react-native-uuid`, `validator`. Peers: `react`, `react-native`, `expo`.

### Coverage

Custom: branches **76.15%** (platform-conditional code), rest **99.9%**.

### TypeScript Config

Uses `"lib": ["es2021", "DOM"]` in all tsconfigs (needs DOM types for W3C Payment API).
```
