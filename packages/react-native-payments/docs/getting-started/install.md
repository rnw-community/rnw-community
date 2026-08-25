# Install

Install the package with your package manager, e.g.:

```bash
npm install @rnw-community/react-native-payments
```

Autolinking picks up the TurboModule on both architectures — no manual `react-native link` step.

Before writing any code, complete the one-time platform setup for every platform you target:

- [iOS quickstart](./quickstart-ios.md) — Apple developer account, merchant ID, `PassKit` import in `AppDelegate`.
- [Android quickstart](./quickstart-android.md) — Google developer account, `play-services-wallet` dependency, test-card allowlist.
- [Expo quickstart](./quickstart-expo.md) — the `app.plugin` entry plus `expo prebuild --clean`.

Then ship a payment sheet by following the [readme quickstart](../../readme.md#quickstart) or the full
[`PaymentRequest` API reference](../api/payment-request.md).
