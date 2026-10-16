import type { Observable } from 'rxjs';

/**
 * Unwraps the value type of a `Promise` or `Observable` return type, leaving any other type unchanged.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/log-decorator/readme.md#getresulttypet
 */
export type GetResultType<T> = T extends Promise<infer U> ? U : T extends Observable<infer U> ? U : T;
