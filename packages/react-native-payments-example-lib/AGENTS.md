# @rnw-community/react-native-payments-example-lib

Private. Shared UI components and payment logic used by the example apps (bare RN and Expo).

## Architecture

```
src/
  component/   — App.tsx (main payment UI), RequestOptionsForm, SwitchRow
  payment/     — createPaymentRequest factory, method-data/ (iOS/Android configs), paymentDetails
  util/        — getPaymentName helper
```

## Key Patterns

- Sources are consumed directly (`main: "src/index.ts"`) — no build step
- Shared between `react-native-payments-example` and `react-native-payments-example-expo`

## Dependencies

`@rnw-community/react-native-payments` (workspace), `@rnw-community/shared` (workspace), `react`, `react-native`.

This is an example/demo package — no publish.
