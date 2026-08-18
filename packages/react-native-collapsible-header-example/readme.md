# React Native Collapsible Header Example

Private example package for
[`@rnw-community/react-native-collapsible-header`](https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-collapsible-header)
with one shared demo screen and two app targets:

- `apps/expo` — Expo target (`yarn workspace @rnw-community/react-native-collapsible-header-example ios:expo`)
- `apps/bare` — React Native CLI target (`yarn workspace @rnw-community/react-native-collapsible-header-example ios:bare`)

The demo exercises provider-based scroll wiring, snap-to-endpoint, overscroll stretch, the slot-facing progress hook,
and persistent header actions. The `e2e/` directory carries the Maestro suite and the readme demo-GIF recording flow —
see [e2e/readme.md](./e2e/readme.md).
