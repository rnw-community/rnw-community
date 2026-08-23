# @rnw-community/react-native-screen-chrome example

Private. Single example package for the screen chrome library: one shared demo layer (`src/`) mounted by two app
targets (`apps/bare` React Native CLI with committed native projects, `apps/expo` prebuilt by Expo). Mirrors
`react-native-collapsible-header-example`.

## Demos

- **Collapsible header** — compound slot grammar, provider-owned scroll wiring, snap, per-layer `motion` override,
  top edge fade.
- **Static header** — fixed header row plus the `useScreenChromeHeaderMetrics` API driving `contentInsetTop`.
- **Header and footer** — static header with a sticky footer band recipe (absolute container + bottom `EdgeFade` +
  safe-area padding), `contentInsetBottom` reserving space for the bar.

Each screen mounts its own `ScreenChromeProvider`; the navigator mounts none.

## Commands

```bash
yarn start:bare            # metro for the bare shell
yarn start:expo            # expo dev server
yarn ios:bare / android:bare
yarn ios:expo / android:expo
yarn e2e:ios:bare          # maestro suite against a booted simulator (app installed)
yarn e2e:android:expo      # ... etc, one script per platform × target
```

See `e2e/readme.md` for the flow inventory, appId table, and what each demo documents.
