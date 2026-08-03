# Redux-Loadable - React native web community

Generic redux loading state, selectors and utils for sending requests and handling loading/error states.
Library supports redux-toolkit and other class redux approaches.

[![npm version](https://badge.fury.io/js/%40rnw-community%2Fredux-loadable.svg)](https://badge.fury.io/js/%40rnw-community%2Fredux-loadable)
[![coverage](https://img.shields.io/codecov/c/github/rnw-community/rnw-community?flag=redux-loadable&label=coverage)](https://app.codecov.io/gh/rnw-community/rnw-community)
[![npm downloads](https://img.shields.io/npm/dm/%40rnw-community%2Fredux-loadable.svg)](https://www.npmjs.com/package/%40rnw-community%2Fredux-loadable)

Supported loading states:

-   `pristine` - nothing has happened to the state slice
-   `loading` - loading started
-   `failed` - loading failed
-   `success` - loading was successful

## Exports

### `LoadingStateInterface`

-   `isPristine` - flag showing that slice is in initial state and no requests were made.
-   `isLoading` - flag showing that request is ongoing.
-   `error` - string, storing last request error message (empty string when there is no error)

```ts
import type { LoadingStateInterface } from '@rnw-community/redux-loadable';

interface UserState extends LoadingStateInterface {
    name: string;
}
```

### `initialLoadingState`

`{ isPristine: true, isLoading: false, error: '' }` — the starting value for any state slice implementing `LoadingStateInterface`.

```ts
import { initialLoadingState } from '@rnw-community/redux-loadable';

const initialState: UserState = { ...initialLoadingState, name: '' };
```

## Utils

Helper reducer functions that mutate then return `{ ...state }` — designed to be called from inside a Redux Toolkit `createSlice` reducer (Immer draft in, plain object out).

### `loadingStarted(state)`

Sets `isLoading: true`, clears `error`, and flips `isPristine` to `false`.

```ts
import { loadingStarted } from '@rnw-community/redux-loadable';

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        fetchUser: state => loadingStarted(state),
    },
});
```

### `loadingFinished(state)`

Sets `isLoading: false` and clears `error` on a successful load.

```ts
import { loadingFinished } from '@rnw-community/redux-loadable';

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        fetchUserSuccess: (state, action: PayloadAction<string>) => {
            state.name = action.payload;

            return loadingFinished(state);
        },
    },
});
```

### `loadingFailed(state, errorReason)`

Sets `isLoading: false` and stores `errorReason` in `error`.

```ts
import { loadingFailed } from '@rnw-community/redux-loadable';

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        fetchUserFailure: (state, action: PayloadAction<string>) => loadingFailed(state, action.payload),
    },
});
```

### `loadingReset(state)`

Resets the slice back to `initialLoadingState`'s values.

```ts
import { loadingReset } from '@rnw-community/redux-loadable';

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        resetUser: state => loadingReset(state),
    },
});
```

### `loadingStateSelector(slice)`

Curried selector: `loadingStateSelector(sliceName)(state)` returns an `[isLoading, isFailed, isPristine, error]` tuple for that slice.

```ts
import { loadingStateSelector } from '@rnw-community/redux-loadable';

interface RootState {
    user: UserState;
}

const [isLoading, isFailed, isPristine, error] = loadingStateSelector<RootState>('user')(state);
```

## License

This library is licensed under The [MIT License](./LICENSE.md).
