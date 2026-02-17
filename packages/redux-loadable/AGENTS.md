# @rnw-community/redux-loadable

Minimal Redux Toolkit-compatible loading state pattern — interface, initial state, state-mutation utilities, and curried selector.

## Package Commands

```bash
yarn test && yarn test:coverage && yarn build && yarn ts && yarn lint:fix
```

## Architecture

```
src/
  interface/  — LoadingStateInterface { error, isLoading, isPristine } + initialLoadingState
  selectors/  — loadingStateSelector (curried: (slice) => (state) => [isLoading, isFailed, isPristine, error])
  utils/      — loadingStarted, loadingFinished, loadingFailed, loadingReset
```

### Key Patterns

- State utils mutate then return `{ ...state }` — designed for RTK createSlice (Immer)
- `isPristine` tracks "never loaded yet" — changes only once on first `loadingStarted`
- `isFailed` derived as `error !== ''` (no separate boolean stored)
- Curried selector: `loadingStateSelector('mySlice')(state)` returns 4-element tuple
- Zero dependencies — framework-agnostic state helpers

### Coverage

Default: **99.9%** all metrics.
```
