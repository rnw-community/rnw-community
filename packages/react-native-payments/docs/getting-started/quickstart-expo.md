# Expo quickstart

This package links native code (PassKit on iOS, the Google Pay API on Android), so it cannot run inside
**Expo Go**. It requires an Expo [custom build](https://docs.expo.dev/custom-builds/get-started/) (a.k.a.
development build / `expo-dev-client`). See [Platforms — Expo](../platforms/expo.md) for the full plugin
options reference.

1. Add the `@rnw-community/react-native-payments` plugin to your `app.config.js`:

```js
export default {
    plugins: [
        ...
        [
            "@rnw-community/react-native-payments/app.plugin",
            {
                "merchantIdentifier": "merchant.react-native-payments"
            }
        ],
    ],
};
```

2. Prebuild your project:

```bash
npx expo prebuild --clean
```

Building the package before prebuild is required for local/monorepo consumers: `expo prebuild` resolves
`@rnw-community/react-native-payments/app.plugin` through the package's `exports` map, which only points at
`dist` — run `yarn build` (or your workspace's build step) for this package before `expo prebuild` if you are
linking it locally rather than installing it from npm.

See [Platforms — Expo](../platforms/expo.md#plugin-options-reference) for every plugin option
(`merchantIdentifier`, `supportedNetworks`, `googlePayEnvironment`).
