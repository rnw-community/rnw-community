# Screen chrome example — Maestro E2E

Flows exercise `@rnw-community/react-native-screen-chrome` through the shared demo screens on a booted
simulator/emulator with the app already installed (`ios:expo`/`ios:bare`/`android:expo`/`android:bare` first).

## Running

```bash
pnpm --filter @rnw-community/react-native-screen-chrome-example e2e:ios:expo
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
- `flows/snap_off_header_scrolls_freely.yaml` — with `snapToCollapse: false` the header still collapses under a page
  of scrolling and expands again at the top.
- `flows/bottom_fade_follows_scroll.yaml` — the scroll-driven bottom fade stays mounted while the list scrolls under
  the static header.
- `flows/tab_bar_switches_tabs.yaml` — the floating tab bar's tap targets select their tab before and after scrolling.
- `flows/keyboard_footer_stays_above_keyboard.yaml` — Send is tapped with the keyboard open, which only lands when the
  composer footer rides above the keyboard.
- `flows/theme_switches_scheme.yaml` — the header toggle flips the provider color scheme to dark and back.
- `harness/edge_fade_harness.yaml` — the edge-fade regression harness: captures every scheme × background × state of
  the edge-fade screen for `harness/edge-fade-metrics.mjs`, including an independent wash-free blur-only control.
- `harness/edge_fade_temporal_harness.yaml` — records six bounded programmatic ScrollView traversals, one per scheme ×
  background. It prepares the real ScrollView at offset 200 before recording, then scrolls 200→400 while a visible
  content witness moves. CI preserves every decoded MP4 frame, records the clip duration, and checks edge, luminance,
  contrast, frame-count, duration, and measured-scroll gates. On temporal top-edge background profiles, samples inside
  the measured top safe area come from the two clear side strips so a device cutout rendered in video but omitted from
  still screenshots cannot look like a fade reversal. Physical-edge color and variance still use the full width, and
  profile samples below the safe area still use the full width.
- `subflows/launch_home.yaml` — shared launch + first-frame wait on the demo picker.
- `subflows/launch_collapsible_demo.yaml` — opens the collapsible-header screen and waits for its first frame.
- `subflows/collapse_then_expand.yaml` — collapses a demo collapsible header and scrolls back until it expands,
  parameterized by the `HEADER` testID prefix (`collapsible-demo`, `snap-off-demo`).
- `recording/` — capture-only flows for the readme demo GIFs, one per demo (`collapsible_capture`,
  `static_header_capture`, `footer_capture`, `snap_off_capture`, `bottom_fade_capture`, `tab_bar_capture`,
  `keyboard_capture`, `theme_capture`); not part of the assertion suite. Each opens its screen, then drives the
  gestures between `startRecording`/`stopRecording`, mirroring the collapsible-header example.

The static gate also measures the width of the 20–80% stripe-contrast transition (square root of normalized
Laplacian energy). It must span at least 35% of the ruler's ramp. The adjacent-row energy check alone allowed a
visibly compressed transition, because squared contrast and its one-point smoothing kept each rise below 0.165.
The width check runs on both the washed capture and the blur-only control; existing thresholds are unchanged.

## Recording the readme GIFs

With the app installed on a booted emulator or simulator, run one capture flow at a time:

```bash
maestro test -e APP_ID=<appId> e2e/recording/static_header_capture.yaml
```

Maestro writes the clip under its test output directory (`<output>/<flow>/startRecording/<name>.mp4`). Convert it
with `ffmpeg -i <name>.mp4 -vf "fps=12,scale=320:-2:flags=lanczos,split[a][b];[a]palettegen[p];[b][p]paletteuse"
<name>.gif` and commit the result to `packages/react-native-screen-chrome/docs/`. A launch that misses the 60s
first-frame wait is retried rather than recorded.

## What the demos document

- **Collapsible header** — compound slot grammar (`CollapsibleHeaderSlot` ×2 + `CollapsibleHeaderTitleSlot`),
  provider-owned scroll wiring through `ScreenChromeScrollView`, snap via config, a per-layer `motion` override
  (background fades in earlier than default), and an `EdgeFade position="top"` band.
- **Static header** — `ScreenChromeHeader` with safe-area padding, and the `useScreenChromeHeaderMetrics` metrics API
  driving the scroll view's `contentInsetTop` instead of re-merging the default config.
- **Header and footer** — both bands at once: static header up top, sticky footer recipe (absolute container +
  `EdgeFade position="bottom"` + safe-area padding) below, with `contentInsetBottom` reserving space so no content is
  permanently hidden behind the bar.
- **Snap off** — the collapsible header with `snapToCollapse: false`: the header follows the scroll offset and rests
  wherever the drag ends. Reduced motion has no switch of its own: with the system reduce-motion setting on, the
  provider snaps the snap-enabled collapsible demo instantly instead of animating.
- **Scroll-driven bottom fade** — `EdgeFade position="bottom"` with `scrollAnimation` ramping opacity and blur in over
  the first 160 points of scroll.
- **Floating tab bar** — a pill-shaped tab row inside `ScreenChromeFooter`; the list clears it through
  `useBottomChromeInset().chromeHeight`.
- **Keyboard-sticky footer** — the readme recipe: `ScreenChromeFooter` inside `react-native-keyboard-controller`'s
  `KeyboardStickyView` (the app root mounts `KeyboardProvider`), with a `TextInput` composer.
- **Light and dark** — `ScreenChromeProvider colorScheme` driven by app state; the fades and list repaint on toggle.

Each screen mounts its own `ScreenChromeProvider`; the navigator mounts none (one provider per scrollable).
