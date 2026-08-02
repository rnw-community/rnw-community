---
name: rnw-community
description: Package under test, run scripts, fleet labels, and artifact locations for this repo
metadata:
  tags: rnw-community, react-native-payments, ci, fleet
---

## Package under test

`packages/react-native-payments-example` is ONE private package proving
`@rnw-community/react-native-payments` on two app targets that share a single `src/` screen layer:

- `apps/bare` — React Native CLI target, package `@rnw-community/react-native-payments-example-bare`
- `apps/expo` — Expo target, package `@rnw-community/react-native-payments-example-expo`

Both targets are nested Yarn workspaces excluded from Lerna publishing (see the package's `AGENTS.md`).

## App identifiers (`appId` header)

| Target      | Platform | appId                                                    |
| ----------- | -------- | --------------------------------------------------------- |
| `apps/bare` | iOS      | `org.reactjs.native.example.ReactNativePaymentsExample`   |
| `apps/bare` | Android  | `com.reactnativepaymentsexample`                           |
| `apps/expo` | iOS      | `com.reactnativepaymentsexpoexample`                       |
| `apps/expo` | Android  | `com.reactnativepaymentsexpoexample`                       |

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

Issue #393 adds package-level scripts on `packages/react-native-payments-example/package.json`
following the existing `<action>:<target>` naming already used for `ios:bare` / `android:bare` /
`ios:expo` / `android:expo` (see the package's `AGENTS.md`):

```bash
yarn workspace @rnw-community/react-native-payments-example e2e:ios:bare
yarn workspace @rnw-community/react-native-payments-example e2e:ios:expo
yarn workspace @rnw-community/react-native-payments-example e2e:android:bare
yarn workspace @rnw-community/react-native-payments-example e2e:android:expo
```

These scripts do not exist yet on this branch — treat the names above as the documented interface
to implement, not a confirmed present-day command. Until #393 lands, drive Maestro directly against
a running simulator/emulator instead:

```bash
maestro test -e APP_ID=<appId> packages/react-native-payments-example/e2e/
```

## Fleet labels (CI, issue #395)

- iOS workflow (`ios-maestro.yml`): `runs-on: [self-hosted, macOS, ARM64, macos-maestro]`
- Android workflow (`android-maestro.yml`): `runs-on: [self-hosted, linux-tiered, linux-xl]`

Both workflows are planned to build the example app across the bare/expo matrix with derived-data
and Gradle/pod caching keyed on lockfiles + native dirs (mirroring the `ios-native-cache.yml`
pattern), triggered on paths touching `packages/react-native-payments`,
`packages/react-native-payments-example/**`, or the workflow files themselves, plus a nightly
schedule. Neither workflow exists on this branch yet, and issue #396 must register this repository
in the runner fleet before these labels can pick up any job.

## Artifacts on failure (issue #395)

On failure, upload screenshots, videos, and Maestro logs as CI artifacts — the `maestro_output/`
directory produced locally per [../screenshots.md](../screenshots.md) and
[../debugging.md](../debugging.md). On success, no artifacts are retained. This is the evidence bar
behind #395's "cold vs warm build time documented in the PR" requirement; until #395 lands there is
no CI artifact upload configured for this repository.
