# @rnw-community/react-native-collapsible-header

Generic slot-based collapsible header animation for React Native Reanimated with provider-based scroll wiring,
snap-to-endpoint, overlay mode, overscroll stretch, and React Compiler precompiled output.

## Package Commands

```bash
yarn test && yarn test:coverage && yarn build && yarn ts && yarn ts:nodenext && yarn lint
```

## Architecture

```text
src/
  assert/
    assert-collapsible-header-progress.assert.ts — normalized progress validation
    assert-finite-collapsible-header-motion-value.assert.ts — finite translation validation
    assert-valid-collapsible-header-config.assert.ts — geometry and motion validation orchestration
    assert-valid-collapsible-header-geometry.assert.ts — header geometry validation
    assert-valid-collapsible-header-motion-config.assert.ts — normalized motion validation
  collapsible-header/
    collapsible-header.tsx       — public component, layer composition, scroll-source resolution
    collapsible-header.spec.tsx  — rendering, a11y, mode, defaults, and validation coverage
    collapsible-header-motion.spec.tsx — animation, clamping, and interaction coverage
  config/
    default-collapsible-header-motion.config.ts — public original-compatible motion preset
    resolve-collapsible-header-motion.config.ts — partial motion override resolution
  context/
    collapsible-header-progress.context.ts — internal progress context provided by the header
    collapsible-header-scroll.context.ts — internal scroll wiring context provided by the provider
  hooks/
    use-collapsible-header-animated-layers/
      use-collapsible-header-animated-layers.hook.ts — internal progress-space animated style/props orchestration
      use-collapsible-header-animated-layers.spec.ts
    use-collapsible-header-snap-registration.hook.ts — internal snap geometry registration effect
    use-collapsible-header-progress/
      use-collapsible-header-progress.hook.ts — public slot-facing collapse progress hook
      use-collapsible-header-progress.spec.tsx
    use-collapsible-header-scroll/
      use-collapsible-header-scroll.hook.ts — public scrollable-facing wiring hook
      use-collapsible-header-scroll.spec.tsx
  interface/
    collapsible-header-animation-config.interface.ts — internal animation hook input
    collapsible-header-motion-config.interface.ts — public normalized motion contract
    collapsible-header-props.interface.ts — public slot, geometry, behavior, style, and ViewProps contract
    collapsible-header-scroll.interface.ts — public scroll wiring contract returned by the scroll hook
    collapsible-header-scroll-context-value.interface.ts — internal context value (adds snap registry)
    collapsible-header-snap-config.interface.ts — internal snap geometry shape
  provider/
    collapsible-header-provider/
      collapsible-header-provider.tsx — public provider owning scrollY, scroll handler, ref, snap registry
      collapsible-header-provider.spec.tsx
  type/
    collapsible-header-geometry.type.ts — normalized geometry validation input
    collapsible-header-mode.type.ts — public 'flow' | 'overlay' layout strategy
  util/
    create-collapsible-header-scroll-worklets/
      create-collapsible-header-scroll-worklets.ts — internal scroll/end-drag/momentum worklet factory
      create-collapsible-header-scroll-worklets.spec.ts
    get-collapsible-header-content-inset-style/
      get-collapsible-header-content-inset-style.ts — public overlay-mode content inset helper
      get-collapsible-header-content-inset-style.spec.ts
    get-collapsible-header-snap-offset/
      get-collapsible-header-snap-offset.ts — pure worklet computing the nearest snap endpoint
      get-collapsible-header-snap-offset.spec.ts
  index.ts                       — public exports
```

## Invariants

- The consumer owns both content slots, safe-area handling, typography, colors, and product behavior. Scroll is owned
  either by the consumer (`scrollY` prop) or by `CollapsibleHeaderProvider`; the prop wins when both exist.
- The package owns header height, background opacity, expanded opacity/translation/scale, collapsed opacity/translation,
  clamping, persistent layer placement, visible-layer pointer events, and visible-layer accessibility focus (the hidden
  transition layer is removed from the accessibility tree).
- All layer animations are expressed in normalized progress space via one `useDerivedValue`; the same progress shared
  value is provided to slot content through `useCollapsibleHeaderProgress`.
- `snap` requires the provider (snapping drives the registered scrollable via `scrollTo`); headers register snap
  geometry into the provider's shared-value registry on mount and clear it on unmount.
- `collapseDistance` defaults to `expandedHeight - collapsedHeight`; `collapseStart` is optional, non-negative, and
  defaults to `0`.
- `motion` is additive and partial; missing fields resolve against `DefaultCollapsibleHeaderMotionConfig` (public)
  before validation, so omitted options preserve existing behavior.
- Worklet bodies use plain `=== null` checks — `@rnw-community/shared` guards are not workletized and must not be
  called on the UI runtime.
- `react`, `react-native`, and `react-native-reanimated` remain peer dependencies. Never bundle a second Reanimated copy.
- Runtime animation code uses APIs shared by Reanimated 3.17.2 and 4.x, and only the compiler-safe `.get()`/`.set()`
  shared-value accessors.
- Modern-React posture: the React Compiler owns memoization (no manual `useMemo`/`useCallback`/`React.memo`), state is
  derived during render (worklets are pure functions of `scrollY`), and the only `useEffect` syncs the snap registry —
  an external store, the sanctioned effect use. React 19-only syntax (`use()`, `<Context>` as provider, ref-callback
  cleanups) is deliberately absent while the peer floor is `react >=18`; React 19 consumers still get the precompiled
  memoized output.
- Public exports carry the repository-standard one-sentence TSDoc and canonical readme `@see` link; exported interface
  members carry one-line TSDoc with `@defaultValue` where a default applies.
- Tests must retain at least 99.9% statements, branches, functions, and lines coverage, and the whole Jest suite runs
  through `babel-plugin-react-compiler` with `panicThreshold: 'all_errors'` — a Rules-of-React violation anywhere in
  src (specs included) fails the suite.

## Publication pipeline (react-native-builder-bob)

The package builds with `react-native-builder-bob` — the React Native library standard — configured in
`package.json` under `react-native-builder-bob`:

- targets: `["module", { esm: true }]` → `dist/module` (real ESM: bob rewrites relative specifiers with `.js`
  extensions and writes the `{"type":"module"}` marker), `["commonjs", { esm: true }]` → `dist/commonjs` (with the
  `{"type":"commonjs"}` marker), and `typescript` → `dist/typescript/module` + `dist/typescript/commonjs` declaration
  trees (from `tsconfig.build.json`, which excludes specs).
- React Compiler ships in both dist trees via `babel.config.bob.js` (bob's babel preset plus
  `babel-plugin-react-compiler` with `panicThreshold: 'all_errors'` and `target: '18'`); `react-compiler-runtime`
  is a runtime dependency. Every module — components and hooks — is memoized, and
  `scripts/assert-react-compiler-output.mjs` fails the build if either tree lacks compiler output.
- `'worklet'` directives pass through untouched (bob never minifies); the consumer app's worklets plugin compiles
  them, exactly as with hand-written Reanimated libraries.
- `scripts/assert-esm-extensions.mjs` still enforces the extension invariant on `dist/module`, and the `build`
  script starts with `rm -rf ./dist` so a failed pass never leaves a stale tree behind.

`exports` points `import` at `dist/module` (+ `dist/typescript/module` types) and `require` at `dist/commonjs`
(+ `dist/typescript/commonjs` types), types-first in each condition. The NodeNext check must pass before publishing.
`llms.txt` ships in the npm package (`files` array) as the agent-facing summary.

## Example app and E2E

`packages/react-native-collapsible-header-example` (private, mirrors `react-native-payments-example`) carries the
runnable demo — provider wiring, snap, overscroll stretch, progress-driven slot animation, persistent actions — on
Expo and bare React Native targets, plus the Maestro suite (`e2e/flows`) and the recording flow
(`e2e/recording/demo_capture.yaml`) that produces `docs/collapsible-header-demo.gif` embedded in this package's
readme. The `maestro-e2e` agent skill (`.claude/skills/maestro-e2e`) documents how to drive and extend the suite.
