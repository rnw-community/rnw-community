# Setup doctor

`rnw-payments doctor` checks a bare React Native app's native projects against its
[`payments.config`](../api/payments-config.md) and `--fix` patches them. It applies the Expo config plugin's own
mutations to the files on disk, so a bare app and an `expo prebuild` app end up with the same native setup.

```bash
npx rnw-payments doctor        # report, exit code 1 when a file does not match
npx rnw-payments doctor --fix  # report, then write the files
```

Run it from the app root, next to `payments.config.ts|js|json` and the `ios/` / `android/` folders (a missing platform
folder is skipped). Exit code `0` means every file matches, so it can gate a CI pipeline.

| Platform | File                                                                  | What it must contain                                                                                                                                 |
| -------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| iOS      | the entitlements file of `CODE_SIGN_ENTITLEMENTS`                     | every merchant identifier in `com.apple.developer.in-app-payments`                                                                                   |
| Android  | `android/app/src/main/AndroidManifest.xml`                            | the `com.google.android.gms.wallet.api.enabled`, `…wallet.api.environment` and `com.rnw-community.react-native-payments.supported-networks` meta-data |

Every mismatch prints the file and the lines to remove (`-`) and add (`+`):

```text
android/app/src/main/AndroidManifest.xml
  + <meta-data android:name="com.google.android.gms.wallet.api.environment" android:value="TEST"/>
```

`--fix` behaves like `expo prebuild`: when the iOS target has no entitlements file yet, it creates
`ios/<Project>/<Product>.entitlements` and points `CODE_SIGN_ENTITLEMENTS` at it, and it rewrites a mismatching
`AndroidManifest.xml` in Expo's formatting. Review the diff and commit it. The merchant ID still has to be registered
for your team in the Apple developer portal (see [Platforms — iOS](../platforms/ios.md)).

Loading a `payments.config.ts` needs Node 22.18+ (built-in type stripping); use `.js` or `.json` on older Node.
