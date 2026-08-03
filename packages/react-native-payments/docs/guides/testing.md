# Unit testing

Without a linked native binary, `NativePayments` (`src/class/native-payments/native-payments.ts`) falls back to a
`Proxy` that throws `The package 'react-native-payments' doesn't seem to be linked` for any required method call
(`show`, `abort`, `complete`, `canMakePayment`, `hasEnrolledInstrument`) — see
[architecture.md](../architecture.md). Mock `react-native`'s `NativeModules.Payments` so the module resolves to
your own fakes instead of falling through to that proxy:

```ts
import { jest } from '@jest/globals';

jest.mock('react-native', () => ({
    NativeModules: {
        Payments: {
            show: jest.fn(() => Promise.resolve(JSON.stringify({ token: {} }))),
            abort: jest.fn(() => Promise.resolve()),
            canMakePayments: jest.fn(() => Promise.resolve(true)),
            hasEnrolledInstrument: jest.fn(() => Promise.resolve(true)),
            complete: jest.fn(() => Promise.resolve()),
            retry: jest.fn(() => Promise.resolve()),
            setActiveEvents: jest.fn(() => Promise.resolve()),
            updatePaymentDetails: jest.fn(() => Promise.resolve()),
            addListener: jest.fn(),
            removeListeners: jest.fn(),
        },
    },
    Platform: { OS: 'ios', select: (specifics: { default: string }) => specifics.default },
    TurboModuleRegistry: { get: () => null },
}));
```

This works regardless of architecture: `NativePayments` only reaches for the TurboModule path
(`TurboModuleRegistry.get('Payments')`, plural) when `global.__turboModuleProxy` is set, which a Jest run
normally never sets, so it resolves `NativeModules.Payments` instead — mock that key directly rather than
`TurboModuleRegistry.getEnforcing`, which this package never calls. All ten `Spec` members from
`NativePayments.ts` are stubbed, so `retry()` and event registration do not silently no-op in a test that
exercises them. If Jest fails with `The package 'react-native-payments' doesn't seem to be linked`, this mock is
the fix — see [#227](https://github.com/rnw-community/rnw-community/issues/227) and
[troubleshooting.md](./troubleshooting.md).

`show`'s fake resolves to `{ token: {} }` rather than `'{}'` because `PaymentRequest.show()` parses the resolved
string straight into `IosPaymentResponse`/`AndroidPaymentResponse` — `'{}'` has no `token` (iOS) or
`paymentMethodData` (Android) key and rejects with `PaymentsError: Failed parsing PaymentRequest details`.
Replace the fake per test with a payload shaped like `IosPKPayment` (iOS) or `AndroidPaymentData` (Android) once
the assertions need real token/address fields.

## Example apps

- **Expo** — the `App` component of the
  [react-native-payments-example](../../../react-native-payments-example/readme.md) package, running through its
  `apps/expo` target.
- **Bare React Native CLI** — the same `App` component, running through the
  [react-native-payments-example](../../../react-native-payments-example/readme.md) package's `apps/bare` target.

## End-to-end verification

Unit tests cover the JS layer at 100%; on-device verification of the event API (sheet opens, shipping/coupon
change round-trip, async `updateWith` completion) runs locally through the Maestro flow suite in
[react-native-payments-example/e2e/readme.md](../../../react-native-payments-example/e2e/readme.md), but is not
yet wired into CI — tracked in [#395](https://github.com/rnw-community/rnw-community/issues/395).
