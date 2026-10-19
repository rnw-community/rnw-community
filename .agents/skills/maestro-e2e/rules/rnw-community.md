---
name: rnw-community
description: Packages under test, run scripts, fleet labels, and artifact locations for this repo
metadata:
    tags: rnw-community, react-native-payments, react-native-collapsible-header, ci, fleet
---

## Packages under test

Two private example packages follow the same shape — ONE package proving a library on two app targets that share a
single `src/` screen layer, with nested pnpm workspaces excluded from Lerna publishing (see each package's `AGENTS.md`):

- `packages/react-native-payments-example` proves `@rnw-community/react-native-payments`
  (`apps/bare` → `@rnw-community/react-native-payments-example-bare`, `apps/expo` →
  `@rnw-community/react-native-payments-example-expo`)
- `packages/react-native-collapsible-header-example` proves `@rnw-community/react-native-collapsible-header`
  (`apps/bare` → `@rnw-community/react-native-collapsible-header-example-bare`, `apps/expo` →
  `@rnw-community/react-native-collapsible-header-example-expo`); its `e2e/recording/demo_capture.yaml` is a
  non-assertion flow that records the library readme's demo GIF, and its assertion flows validate visibility through
  the accessibility tree (the library removes the hidden transition layer from accessibility)

## App identifiers (`appId` header)

| Package            | Target      | Platform    | appId                                                            |
| ------------------ | ----------- | ----------- | ---------------------------------------------------------------- |
| payments           | `apps/bare` | iOS         | `org.reactjs.native.example.ReactNativePaymentsExample`          |
| payments           | `apps/bare` | Android     | `com.reactnativepaymentsexample`                                 |
| payments           | `apps/expo` | iOS+Android | `com.reactnativepaymentsexpoexample`                             |
| collapsible-header | `apps/bare` | iOS         | `org.reactjs.native.example.ReactNativeCollapsibleHeaderExample` |
| collapsible-header | `apps/bare` | Android     | `com.reactnativecollapsibleheaderexample`                        |
| collapsible-header | `apps/expo` | iOS+Android | `com.reactnativecollapsibleheaderexpoexample`                    |

## Flow layout

Flows live at `packages/react-native-payments-example/e2e/`, written as shared YAML parameterized
per target/platform (an `${APP_ID}` env var rather than four near-duplicate files) — see #393 for
the concrete suite: app launch, `canMakePayments` true, sheet opens on `show()`, dismiss →
abort/reject state visible in the event log, shipping-change round-trip where observable, async
`updateWith` completion, and JS state transitions after each step. Demo-screen testIDs are
documented against that suite by #392; until then, follow the `snake_case`
`{screen}_{element}_{type}` convention in [../best-practices.md](../best-practices.md) and
[../platforms/react-native.md](../platforms/react-native.md).

Android flows assert graceful no-support/stub behavior where Google Pay is unavailable on the
emulator — do not assert a real Google Pay sheet on Android.

## Local run scripts

Each example package carries `e2e:<platform>:<target>` scripts that run its top-level `e2e/flows/*.yaml` against an
already installed app; they are also where CI reads each target's `APP_ID`:

```bash
pnpm --filter @rnw-community/react-native-payments-example e2e:ios:bare
pnpm --filter @rnw-community/react-native-payments-example e2e:android:expo
pnpm --filter @rnw-community/react-native-collapsible-header-example e2e:ios:expo
pnpm --filter @rnw-community/react-native-screen-chrome-example e2e:android:bare
```

## CI pipeline

`.github/workflows/ios-maestro.yml` and `android-maestro.yml` run every example's suite per `bare`/`expo` target. The
package/target matrix (scheme, app ids, build filter) comes from `.github/scripts/maestro-matrix.mjs`, fed by a detect
job that runs only the packages a pull request affects (turbo `--affected`) and nothing for a documentation-only pull
request (`*.md`, `llms*.txt`, `docs/**`). Both workflows compose `rnw-community/mobile-ci` actions pinned by commit SHA:

- iOS runs on `[self-hosted, macOS, ARM64, macos-maestro]`: `setup-xcode-pinned` asserts the pinned Xcode,
  `native-fingerprint` + `native-app-cache` restore the release `.app` when neither its native surface nor the
  JavaScript it embeds changed, `setup-ccache-ios` caches C/C++ compilation for a rebuild, and `run-maestro-ios`
  boots a stock (not slimmed) simulator, installs, warms the app and runs the flows.
- Android builds the release APK on GitHub-hosted `ubuntu-24.04` (same fingerprint cache) and tests on
  `[self-hosted, trf-linux-amd64-4x8]`, the KVM-enabled shape: `run-maestro-android` boots Google's
  `android-34;google_apis;x86_64` emulator with the `Galaxy Nexus` profile — 720x1280 @ 320dpi, no cutout, the
  360x640dp viewport the flows' swipe percentages are calibrated against — and the workflow asserts that geometry
  before the suite runs.

Every leg uploads a `maestro-<platform>-<package>-<target>` artifact: the final screenshot, logcat on Android, and the
Maestro debug output of any failing flow.
