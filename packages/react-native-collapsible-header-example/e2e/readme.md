# Collapsible header example — Maestro E2E

Flows exercise `@rnw-community/react-native-collapsible-header` through the shared demo screen on a booted
simulator/emulator with the app already installed (`ios:expo`/`ios:bare`/`android:expo`/`android:bare` first).

## Running

```bash
yarn workspace @rnw-community/react-native-collapsible-header-example e2e:ios:expo
```

Or directly: `maestro test -e APP_ID=<appId> e2e/flows`.

| Target      | Platform | appId                                                            |
| ----------- | -------- | ---------------------------------------------------------------- |
| `apps/expo` | iOS      | `com.reactnativecollapsibleheaderexpoexample`                    |
| `apps/expo` | Android  | `com.reactnativecollapsibleheaderexpoexample`                    |
| `apps/bare` | iOS      | `org.reactjs.native.example.ReactNativeCollapsibleHeaderExample` |
| `apps/bare` | Android  | `com.reactnativecollapsibleheaderexample`                        |

## Flows

- `flows/app_launch.yaml` — expanded content, persistent action, and list are visible; collapsed content is absent
  from the accessibility tree (the package hides the invisible transition layer from screen readers, which is what
  `assertNotVisible` observes).
- `flows/collapse_on_scroll.yaml` — scrolling collapses the header: collapsed content becomes visible/accessible,
  expanded content leaves the accessibility tree, the persistent action stays.
- `flows/expand_on_scroll_back.yaml` — scrolling back to the top restores the expanded state.
- `flows/snap_to_nearest_endpoint.yaml` — a partial drag past the midpoint settles at the collapsed endpoint via the
  provider-driven snap.
- `flows/freeze_preserves_collapsed_state.yaml` — the react-native-screens freeze case: collapse the header, push the
  Details screen (native stack, `freezeOnBlur` + `enableFreeze`), navigate back, and assert the header is still
  collapsed — the frozen screen must not resurrect the expanded state.
- `flows/settings_header_collapses.yaml` — the navigation-chrome case: the large settings title is visible on entry,
  collapses into the small centered title between the persistent icon buttons on scroll, and the back button exits.
- `flows/settings_freeze_preserves_collapsed_state.yaml` — the freeze case on the settings screen: collapse, open an
  item (Details), return, and assert the small title is still the visible one.
- `subflows/launch_header_demo.yaml` — shared launch + first-frame wait, included via `runFlow`, never run standalone.
- `subflows/collapse_header.yaml` — shared "drive this screen to the collapsed endpoint", parameterized by the
  `COLLAPSED_ID` the caller waits for, so both the amount header and the settings header reuse one gesture.
- `recording/demo_capture.yaml` — not an assertion flow; drives the collapse/expand/overscroll gestures between
  `startRecording`/`stopRecording` to produce the readme demo video (convert with ffmpeg to
  `packages/react-native-collapsible-header/docs/collapsible-header-demo.gif`).

## Waits are liveness bounds, not performance budgets

Every `extendedWaitUntil` is sized for the slowest host the suite runs on, not for the transition it waits on. The
header settles in well under a second; on the shared self-hosted fleet a cold release-build launch has been observed
taking ~13s to its first frame, which then leaves the JS thread busy for the first gesture after it. A tight timeout
turns that contention into a red flow that names the header (`header-demo-collapsed-amount is visible`) while the
header is not what broke. So the launch subflow allows 60s and post-gesture waits 15s: a generous ceiling costs nothing
when the assertion holds, and only the flow's own failure message is worth reading when it does not.

## Visibility semantics

The suite deliberately asserts through the accessibility tree: the package removes the hidden transition layer from
accessibility (`accessibilityElementsHidden`/`importantForAccessibility`), so `assertVisible`/`assertNotVisible` on the
expanded/collapsed testIDs validates both the crossfade and the accessibility contract at once. Android view-hierarchy
tooling that ignores accessibility flags may still see the opacity-0 layer — these flows are validated on iOS.
