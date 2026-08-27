# @rnw-community/react-native-collapsible-header

Generic slot-based collapsible header animation for React Native Reanimated with provider-based scroll wiring,
snap-to-endpoint, overlay mode, overscroll stretch, and React Compiler precompiled output.

## Package Commands

```bash
pnpm test && pnpm test:coverage && pnpm build && pnpm ts && pnpm ts:nodenext && pnpm lint
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
    collapsible-header-accessibility.spec.tsx — pointer-event and accessibility handoff across the cross-fade
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
    collapsible-header-scroll-worklets-config.interface.ts — internal scroll worklet factory input
    collapsible-header-snap-config.interface.ts — internal snap geometry shape
  provider/
    collapsible-header-provider/
      collapsible-header-provider.tsx — public provider owning scrollY, scroll handler, ref, snap registry
      collapsible-header-provider.spec.tsx
      collapsible-header-provider-reduced-motion.spec.tsx — animated/instant snap per system motion setting
      collapsible-header-provider-scrollables.spec.tsx — snap wiring across every supported scrollable shape
  type/
    collapsible-header-geometry.type.ts — normalized geometry validation input
    collapsible-header-mode.type.ts — public 'flow' | 'overlay' layout strategy
    collapsible-header-scroll-ref.type.ts — public animated scroll ref attachable to any scrollable
  util/
    create-collapsible-header-scroll-worklets/
      create-collapsible-header-scroll-worklets.ts — internal scroll/drag worklet factory; snap runs once the
                                                     released scroll holds still for three frames (a rAF watch on the
                                                     UI runtime), never from momentum events — Android only emits
                                                     those when a plain JS momentum prop sets `sendMomentumEvents`,
                                                     which a worklet-only `onScroll` handler never does
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
- **One provider per scrollable, mounted inside each screen — never once around a navigator.** A provider owns exactly
  one `scrollY`, scroll handler, scroll ref, and snap slot, so that is its unit of identity. Per-screen providers keep
  sibling screens independent (pinned by `collapsible-header-provider-isolation.spec.tsx` and by the example's two
  Maestro freeze flows); a provider shared across screens makes the last-scrolled screen drive every header. Several
  headers within one screen may share a provider — they animate from one offset by design.
- `snap` requires the provider **and** a mounted `CollapsibleHeader` — the provider owns the slot, the header fills it,
  so a provider whose snapping header is unmounted (tab switch, `freezeOnBlur`) simply stops snapping until it returns.
  Snapping drives the registered scrollable via `scrollTo`; headers register snap geometry
  into the provider's shared-value registry on mount and clear it on unmount, but only when the slot still
  holds the config that header wrote, so unmounting one header never disables a still-mounted one. Snapping is a
  property of the scrollable, not the header: `assertVacantCollapsibleHeaderSnapSlot` throws when a second snapping
  header claims the slot with different geometry, and `assertSnappableCollapsibleHeaderScroll` throws when `snap` is
  combined with a caller-owned `scrollY` prop (the two sources could disagree). A keyed registry with a min/max union
  policy is the escape hatch if multi-header snapping ever becomes a real requirement — deliberately not built.
- Snapping is animated only while the system allows motion: the provider reads `useReducedMotion()` and passes
  `snapAnimated` into the worklet factory, which forwards it as `scrollTo`'s `animated` argument. Not configurable —
  an animated snap is motion the user never initiated, so it follows the platform setting rather than a prop.
- `CollapsibleHeaderScrollRef` (the type of the provider's `scrollRef`) is `AnimatedRef<Component>` intersected with a
  `(instance: never) => void` call signature. `useAnimatedRef<Component>()` satisfies it with no cast (return-type-void
  assignability), and the extra signature makes it assignable to `React.Ref<T>` for every `T` through `RefCallback`'s
  bivariant parameter — instance refs (`Animated.FlatList`), `createAnimatedComponent` wrappers, and imperative handle
  refs (FlashList, LegendList) alike. A generic type parameter was rejected: Reanimated 3.17 constrains
  `AnimatedRef<T extends Component>`, which handle-shaped refs cannot satisfy. Plain `AnimatedRef<Component>` was
  rejected too: under `@types/react` 19 its call signature returns `ShadowNodeWrapper | HTMLElement`, which no
  `RefCallback` accepts. FlashList and LegendList stay out of `package.json` — the contract is structural, so support is
  type-level plus readme recipes, and specs use locally declared handle-shaped stubs.
- `collapseDistance` defaults to `expandedHeight - collapsedHeight`; `collapseStart` is optional, non-negative, and
  defaults to `0`.
- `motion` is additive and partial; missing fields resolve against `DefaultCollapsibleHeaderMotionConfig` (public)
  before validation, so omitted options preserve existing behavior. The one derived field is
  `pointerEventsSwitchProgress`: omitted, it resolves to `(collapsedOpacityStartProgress + expandedOpacityEndProgress) / 2`
  from the already-resolved thresholds, so pointer events and the accessibility tree never move to a layer that is
  still transparent. A fixed switch point cannot satisfy that for every threshold pair, and the exported preset keeps
  its literal `0.5` so spreading it stays byte-compatible.
- Worklet bodies use plain `=== null` checks — `@rnw-community/shared` guards are not workletized and must not be
  called on the UI runtime.
- `react`, `react-native`, and `react-native-reanimated` remain peer dependencies. Never bundle a second Reanimated copy.
- Every React and React Native devDependency is pinned to an exact version, identical across the whole monorepo (the
  `overrides:` block in the root `pnpm-workspace.yaml` repeats the core ones). pnpm resolves each version descriptor on
  its own and hard-links every resolved version into its own virtual-store directory, so one stray range gives this
  package its own `node_modules/react`; `react-compiler-runtime` then imports that second copy,
  whose dispatcher is null during the host render, and every compiled component throws
  `TypeError: Cannot read property 'useMemoCache' of null` at runtime while unit tests stay green.
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
