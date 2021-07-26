# Redux-Loadable - React native web community

Generic redux loading state, selectors and utils for sending requests and handling loading/error states.
Library supports redux-toolkit and other class redux approaches.

## Utils

### `loadingStarted(state: LoadingStateInterface)`

### `loadingFinished(state: LoadingStateInterface)`

### `loadingFailed(state: LoadingStateInterface, error: string)`

## LoadingStateInterface

-   `isPristine` - flag showing that slice is in initial state and no requests were made.
-   `isLoading` - flag showing that request is ongoing.
-   `error` - string, storing last request error message

## Examples

### Redux-toolkit example

### ts-action example
