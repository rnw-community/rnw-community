# Unit testing

Due to the New Architecture TurboModules in React Native, you can
[encounter issues](https://github.com/rnw-community/rnw-community/issues/227) with Jest tests. To fix this, you
can mock the `TurboModuleRegistry` to disable the `Payments` module in Jest tests:

```ts
const turboModuleRegistry = jest.requireActual('react-native/Libraries/TurboModule/TurboModuleRegistry');

export function setupJestTurboModuleMock(): void {
    jest.mock('react-native/Libraries/TurboModule/TurboModuleRegistry', () => {
        return {
            ...turboModuleRegistry,
            getEnforcing: (name: string) => {
                if (name === 'Payment') {
                    return null;
                }
                return turboModuleRegistry.getEnforcing(name);
            },
        };
    });
}
```

If Jest fails with `TurboModuleRegistry.getEnforcing(...): 'Payments' could not be found`, this mock is the fix —
see [#227](https://github.com/rnw-community/rnw-community/issues/227) and
[troubleshooting.md](./troubleshooting.md).

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
