# Redux-Loadable - React native web community

Generic redux loading state, selectors and utils for sending requests and handling loading/error states.
Library supports redux-toolkit and other class redux approaches.

Supported loading states:

-   `pristine` - nothing has happened to the state slice
-   `loading` - loading started
-   `failed` - loading failed
-   `success` - loading was successful

## Utils

Helper reducer functions that will change loading state.

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
