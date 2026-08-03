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

## Utils

Helper reducer functions that will change loading state.

### `loadingStarted(state: LoadingStateInterface)`

### `loadingFinished(state: LoadingStateInterface)`

### `loadingFailed(state: LoadingStateInterface, error: string)`

### `loadingReset(state: LoadingStateInterface)`

## LoadingStateInterface

-   `isPristine` - flag showing that slice is in initial state and no requests were made.
-   `isLoading` - flag showing that request is ongoing.
-   `error` - string, storing last request error message

## Examples

### Redux-toolkit example

### ts-action example

## License

This library is licensed under The [MIT License](./LICENSE.md).
