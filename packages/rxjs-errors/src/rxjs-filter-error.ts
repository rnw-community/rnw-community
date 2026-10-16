/**
 * The default error raised by `filterWithException` and `rethrowException`, for telling their failures apart with `instanceof`.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/rxjs-errors/readme.md#rxjsfiltererror
 */
export class RxJSFilterError extends Error {}
