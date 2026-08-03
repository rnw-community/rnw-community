# Expo

This package links native code (PassKit on iOS, the Google Pay API on Android), so it cannot run inside
**Expo Go**. It requires an Expo [custom build](https://docs.expo.dev/custom-builds/get-started/) (a.k.a.
development build / `expo-dev-client`) — add the `@rnw-community/react-native-payments` plugin into your
`app.config.js`. See [getting-started/quickstart-expo.md](../getting-started/quickstart-expo.md) for the minimal
setup steps.

`merchantIdentifier` accepts either a single identifier or an array of identifiers. Pass an array when your app
resolves the Apple Pay merchant per country/environment at runtime — every identifier is then declared in the
`com.apple.developer.in-app-payments` entitlement. Empty identifiers are ignored; if no non-empty identifier
remains, prebuild fails with an error:

```js
{
    "merchantIdentifier": ["merchant.react-native-payments.fr", "merchant.react-native-payments.mg"]
}
```

## Plugin options reference

| Option | Type | Default | What it mutates |
| --- | --- | --- | --- |
| `merchantIdentifier` | `string \| string[]` | *(required)* | iOS entitlements plist: appends every non-empty identifier to `com.apple.developer.in-app-payments`, de-duplicated. Throws at prebuild time if no non-empty identifier is provided. |
| `supportedNetworks` | `SupportedNetworkEnum[]` | every `SupportedNetworkEnum` value | Android `AndroidManifest.xml`: writes the comma-joined list as the `com.rnw-community.react-native-payments.supported-networks` meta-data value on the main application. Throws if given an empty array or a value outside `SupportedNetworkEnum`. |
| `googlePayEnvironment` | `EnvironmentEnum` | `EnvironmentEnum.PRODUCTION` | Android `AndroidManifest.xml`: writes the `com.google.android.gms.wallet.api.environment` meta-data value on the main application. Throws if given a value outside `EnvironmentEnum`. |

`withGooglePay` also always writes `com.google.android.gms.wallet.api.enabled=true` (no option needed) so the
Google Pay API is enabled for the app. `SupportedNetworkEnum` and `EnvironmentEnum` are both exported from the
package root — see [api/supported-network-enum.md](../api/supported-network-enum.md) and
[api/environment-enum.md](../api/environment-enum.md).

Building the package before prebuild is required for local/monorepo consumers: `expo prebuild` resolves
`@rnw-community/react-native-payments/app.plugin` through the package's `exports` map, which only points at
`dist` — run `yarn build` (or your workspace's build step) for this package before `expo prebuild` if you are
linking it locally rather than installing it from npm.

## Example

You can find a working example in the `App` component of the
[react-native-payments-example](../../../react-native-payments-example/readme.md) package, running through its
`apps/expo` target.
