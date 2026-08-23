# Screen chrome example — Maestro E2E

Flows exercise `@rnw-community/react-native-screen-chrome` through the shared demo screens on a booted
simulator/emulator with the app already installed (`ios:expo`/`ios:bare`/`android:expo`/`android:bare` first).

## Running

```bash
yarn workspace @rnw-community/react-native-screen-chrome-example e2e:ios:expo
```

Or directly: `maestro test -e APP_ID=<appId> e2e/flows`.

| Target      | Platform | appId                                                       |
| ----------- | -------- | ----------------------------------------------------------- |
| `apps/expo` | iOS      | `com.reactnativescreenchromeexpoexample`                    |
| `apps/expo` | Android  | `com.reactnativescreenchromeexpoexample`                    |
| `apps/bare` | iOS      | `org.reactjs.native.example.ReactNativeScreenChromeExample` |
| `apps/bare` | Android  | `com.reactnativescreenchromeexample`                        |

## Flows

- `flows/collapsible_header_snaps.yaml` — a partial drag past the title cross-fade window settles on the collapsed
  endpoint via the provider-driven snap; the small title replaces the expanded one.
- `flows/collapsible_header_expands_on_scroll_back.yaml` — two slow drags reach the collapsed endpoint, and scrolling
  back to the top restores the expanded title.
- `flows/static_header_stays_fixed.yaml` — a full page of scrolling never moves the static header row, and the top
  fade band stays mounted above the content.
- `flows/footer_band_stays_visible.yaml` — the sticky footer band, its bottom fade, and the static header all stay
  visible while the list scrolls underneath.
- `subflows/launch_home.yaml` — shared launch + first-frame wait on the demo picker.
- `subflows/launch_collapsible_demo.yaml` — opens the collapsible-header screen and waits for its first frame.
- `recording/` — capture-only flows for the readme demo GIFs (`collapsible_capture.yaml`, `footer_capture.yaml`);
  not part of the assertion suite.

## What the demos document

- **Collapsible header** — compound slot grammar (`CollapsibleHeaderSlot` ×2 + `CollapsibleHeaderTitleSlot`),
  provider-owned scroll wiring through `ScreenChromeScrollView`, snap via config, a per-layer `motion` override
  (background fades in earlier than default), and an `EdgeFade position="top"` band.
- **Static header** — `ScreenChromeHeader` with safe-area padding, and the `useScreenChromeHeaderMetrics` metrics API
  driving the scroll view's `contentInsetTop` instead of re-merging the default config.
- **Header and footer** — both bands at once: static header up top, sticky footer recipe (absolute container +
  `EdgeFade position="bottom"` + safe-area padding) below, with `contentInsetBottom` reserving space so no content is
  permanently hidden behind the bar.

Each screen mounts its own `ScreenChromeProvider`; the navigator mounts none (one provider per scrollable).
