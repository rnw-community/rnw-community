# react-native-collapsible-header-example — e2e

The CI end-to-end tests exercise `@rnw-community/react-native-collapsible-header` through the shared demo screen. They
live in the repo root [`e2e/`](../../../e2e) project, under
[`e2e/tests/collapsible-header/`](../../../e2e/tests/collapsible-header), one `<flow>.e2e.ts` per scenario, with the
shared steps (the former Maestro subflows) in
[`e2e/support/collapsible-header.ts`](../../../e2e/support/collapsible-header.ts). The iOS E2E and Android E2E workflows
run them on devices leased from the simlock farm; no CI host boots a simulator or emulator.

## Running

```bash
cd e2e && npm ci
# @mobile-ci/e2e-simlock ships in mobile-ci, not on npm: install it from the tag the workflows pin, after every npm ci.
curl -fsSL https://raw.githubusercontent.com/rnw-community/mobile-ci/v4.10.0/scripts/fetch-e2e-simlock.sh | bash -s v4.10.0 .
SIMLOCK_URL=https://simlock.vitaliiyehorov.dev SIMLOCK_TOKEN=<token> E2E_TARGET=collapsible-header-expo \
  E2E_APP_ID=<appId> E2E_APP_PATH=<built .app or .apk> npx e2e run --target ios   # or android
```

`E2E_TARGET` picks the suite: the CI target name minus its `-bare`/`-expo` suffix selects `e2e/tests/<suite>`. Build the
app first (`ios:expo`/`ios:bare`/`android:expo`/`android:bare`). A local run needs a simlock token for the farm.

| Target      | Platform | appId                                                            |
| ----------- | -------- | ---------------------------------------------------------------- |
| `apps/expo` | iOS      | `com.reactnativecollapsibleheaderexpoexample`                    |
| `apps/expo` | Android  | `com.reactnativecollapsibleheaderexpoexample`                    |
| `apps/bare` | iOS      | `org.reactjs.native.example.ReactNativeCollapsibleHeaderExample` |
| `apps/bare` | Android  | `com.reactnativecollapsibleheaderexample`                        |

## Tests

- `app_launch.e2e.ts` — expanded content, persistent action, and list are visible; collapsed content is absent from the
  accessibility tree (the package hides the invisible transition layer from screen readers, which is what the
  not-visible assertion observes).
- `collapse_on_scroll.e2e.ts` — scrolling collapses the header: collapsed content becomes visible/accessible, expanded
  content leaves the accessibility tree, the persistent action stays.
- `expand_on_scroll_back.e2e.ts` — scrolling back to the top restores the expanded state.
- `snap_to_nearest_endpoint.e2e.ts` — a partial drag past the midpoint settles at the collapsed endpoint via the
  provider-driven snap.
- `freeze_preserves_collapsed_state.e2e.ts` — the react-native-screens freeze case: collapse the header, push the
  Details screen (native stack, `freezeOnBlur` + `enableFreeze`), navigate back, and assert the header is still
  collapsed — the frozen screen must not resurrect the expanded state.
- `settings_header_collapses.e2e.ts` — the navigation-chrome case: the large settings title is visible on entry,
  collapses into the small centered title between the persistent icon buttons on scroll, and the back button exits.
- `settings_freeze_preserves_collapsed_state.e2e.ts` — the freeze case on the settings screen: collapse, open an item
  (Details), return, and assert the small title is still the visible one.

## Manual Maestro capture flows

This package's own `e2e/` keeps only manual Maestro tooling, never run in CI:

- `recording/demo_capture.yaml` and `recording/settings_capture.yaml` — not assertion flows; they drive the
  collapse/expand/overscroll gestures between `startRecording`/`stopRecording` to produce the readme demo videos
  (convert with ffmpeg to `packages/react-native-collapsible-header/docs/collapsible-header-demo.gif`).
- `subflows/launch_header_demo.yaml` (launch + first-frame wait) and `subflows/collapse_header.yaml` (drive a screen to
  the collapsed endpoint, parameterized by the `COLLAPSED_ID` the caller waits for) — included by the capture flows via
  `runFlow`, never run standalone.

## Waits are liveness bounds, not performance budgets

Every explicit wait is sized for the slowest host the suite runs on, not for the transition it waits on. The header
settles in well under a second; a cold release-build launch has been observed taking ~13s to its first frame, which
then leaves the JS thread busy for the first gesture after it. A tight timeout turns that contention into a red test
that names the header (`header-demo-collapsed-amount is visible`) while the header is not what broke. So the launch
allows 60s and post-gesture waits 15s: a generous ceiling costs nothing when the assertion holds, and only the test's
own failure message is worth reading when it does not.

## Visibility semantics

The suite deliberately asserts through the accessibility tree: the package removes the hidden transition layer from
accessibility (`accessibilityElementsHidden`/`importantForAccessibility`), so visible/not-visible assertions on the
expanded/collapsed testIDs validate both the crossfade and the accessibility contract at once. Android view-hierarchy
tooling that ignores accessibility flags may still see the opacity-0 layer — these tests are validated on iOS.
