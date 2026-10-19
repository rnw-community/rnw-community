# `PaymentsConfig` / `ResolvedPaymentsConfig` / `resolvePaymentsConfig`

## What & why

One typed config for the facts the native setup and the JS method data must agree on: the Apple Pay merchant
identifier(s), the card networks and the Google Pay environment. The Expo config plugin and `rnw-payments doctor`
write it into the native projects, and `resolvePaymentsConfig` hands the same values to the method data at runtime, so
changing a merchant identifier in one place updates the entitlement and the request together.

## How

Put it in `payments.config.ts`, `payments.config.js` or `payments.config.json` at the app root (looked up in that
order; a `.ts` file needs Node 22.18+ to be loaded by the Expo plugin and the doctor):

| Field                  | Type                                            | Default                            |
| ---------------------- | ----------------------------------------------- | ---------------------------------- |
| `merchantIdentifier`   | `string \| string[]`                            | _(required)_                       |
| `supportedNetworks`    | `SupportedNetworkEnum[]` or their string values | every `SupportedNetworkEnum` value |
| `googlePayEnvironment` | `EnvironmentEnum` or its string value           | `EnvironmentEnum.PRODUCTION`       |

```ts
resolvePaymentsConfig(config: PaymentsConfig): ResolvedPaymentsConfig
```

`resolvePaymentsConfig` rejects a `merchantIdentifier` that is not a string or an array of strings, drops empty and
duplicated merchant identifiers, applies the defaults and throws the same error
in every consumer (prebuild, doctor, app) when no merchant identifier is left, the network list is empty, or a network
or environment is unknown. `ResolvedPaymentsConfig` carries `merchantIdentifiers` (non-empty tuple),
`supportedNetworks` and `googlePayEnvironment`.

The Expo plugin uses its inline options when given and falls back to the config file otherwise.

## Example

```ts
// payments.config.ts
import type { PaymentsConfig } from '@rnw-community/react-native-payments';

export default {
    merchantIdentifier: 'merchant.com.your-app',
    supportedNetworks: ['visa', 'masterCard'],
    googlePayEnvironment: 'TEST',
} satisfies PaymentsConfig;
```

```ts
import {
    createApplePayMethodData,
    createGooglePayMethodData,
    resolvePaymentsConfig,
} from '@rnw-community/react-native-payments';

import paymentsConfig from './payments.config';

const {
    merchantIdentifiers: [merchantIdentifier],
    supportedNetworks,
    googlePayEnvironment,
} = resolvePaymentsConfig(paymentsConfig);

const applePay = createApplePayMethodData({ merchantIdentifier, supportedNetworks, countryCode: 'US', currencyCode: 'USD' });
const googlePay = createGooglePayMethodData({
    environment: googlePayEnvironment,
    supportedNetworks,
    currencyCode: 'USD',
    gatewayConfig: { gateway: 'example', gatewayMerchantId: 'exampleGatewayMerchantId' },
});
```

## Pitfalls

- Import only types from the package in `payments.config.ts`: the Expo plugin and the doctor load the file in Node,
  where the package root (which imports `react-native`) cannot run. Use the string values (`'visa'`, `'TEST'`) instead
  of the enums there.

## References

- [platforms/expo.md](../platforms/expo.md) — what each field writes into the native projects
- [create-apple-pay-method-data.md](./create-apple-pay-method-data.md), [create-google-pay-method-data.md](./create-google-pay-method-data.md)
- [Apple — Setting up Apple Pay](https://developer.apple.com/documentation/passkit/setting-up-apple-pay)
