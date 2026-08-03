# @rnw-community/redux-loadable

Minimal Redux Toolkit-compatible loading-state pattern — an interface, an initial state, state-mutation utilities, and
a curried selector.

## Package Commands

```bash
yarn test && yarn test:coverage && yarn build && yarn ts && yarn lint:fix
```

## Architecture

```
src/
  interface/
    loading-state.interface.ts    — LoadingStateInterface { error: string; isLoading: boolean; isPristine: boolean } + initialLoadingState
  selectors/
    loading-state-slice-selector.type.ts   — LoadingStateSliceSelector<R>: <S>(slice: keyof S) => (state: S) => R
    loading-state.selector.ts               — loadingStateSelector: curried (slice) => (state) => [isLoading, isFailed, isPristine, error]
  utils/
    loading-started.util.ts    — loadingStarted(state): isLoading=true, isPristine=false, error reset
    loading-finished.util.ts   — loadingFinished(state): isLoading=false, isPristine=false, error reset
    loading-failed.util.ts     — loadingFailed(state, errorReason): isLoading=false, isPristine=false, error=errorReason
    loading-reset.util.ts      — loadingReset(state): all three fields back to initialLoadingState's values
  index.ts   — re-exports LoadingStateInterface, initialLoadingState, loadingStateSelector, and the 4 utils
```

### Key Patterns

- Every util is generic over `T extends LoadingStateInterface`, mutates the three fields on `state` directly, then
  returns `{ ...state }` — the mutate-then-spread shape matches Redux Toolkit's Immer-drafted `createSlice` reducers
- `isPristine` means "this slice has never finished a loading cycle" — it starts `true` in `initialLoadingState` and
  every one of `loadingStarted`/`loadingFinished`/`loadingFailed` sets it to `false`; only `loadingReset` can restore
  it to `true`
- There is no separate `isFailed` field stored on state. `loadingFailed` only sets `error` to the given reason;
  "failed" is derived downstream — `loadingStateSelector`'s tuple computes it inline as `state[slice].error !== ''`
- `loadingStateSelector` is curried: `LoadingStateSliceSelector<R> = <S>(slice: keyof S) => (state: S) => R`, called as
  `loadingStateSelector('mySlice')(state)`, returning the 4-tuple
  `[isLoading, isFailed, isPristine, errorText]` — `isFailed` at index 1 is the same `error !== ''` derivation, not
  reading a stored boolean
- No production `dependencies` in package.json — the utilities are framework-agnostic and only assume the
  `LoadingStateInterface` shape

### Coverage

Default monorepo threshold: 99.9% on all metrics.
