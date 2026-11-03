# React Native Collapsible Header Example

Private example package for
[`@rnw-community/react-native-collapsible-header`](https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-collapsible-header)
with one shared demo screen and two app targets:

- `apps/expo` — Expo target (`pnpm --filter @rnw-community/react-native-collapsible-header-example ios:expo`)
- `apps/bare` — React Native CLI target (`pnpm --filter @rnw-community/react-native-collapsible-header-example ios:bare`)

The demo exercises provider-based scroll wiring, snap-to-endpoint, overscroll stretch, the slot-facing progress hook,
and persistent header actions. The CI e2e tests for this app live in the repo root
[`e2e/tests/collapsible-header`](../../e2e/tests/collapsible-header); this package's `e2e/` directory carries the
manual Maestro readme demo-GIF recording flows — see [e2e/readme.md](./e2e/readme.md).
