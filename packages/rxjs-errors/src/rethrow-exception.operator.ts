import { catchError, throwError } from 'rxjs';

import { getErrorMessage } from '@rnw-community/shared';

import { RxJSFilterError } from './rxjs-filter-error';

import type { MonoTypeOperatorFunction, Observable } from 'rxjs';

export type RethrowExceptionWithLoggerOperator = <T>(
    errStringOrMessageFn: string | ((err: unknown) => string),
    logFn$: (logMsg: (err: unknown) => string) => MonoTypeOperatorFunction<T>,
    ErrorCtor?: new (msg: string) => Error
) => (source$: Observable<T>) => Observable<T>;

export const rethrowException: RethrowExceptionWithLoggerOperator = (
    errStringOrMessageFn,
    logFn$,
    ErrorCtor = RxJSFilterError
) => {
    const getErrorMessageString = (err: unknown): string =>
        typeof errStringOrMessageFn === 'string' ? errStringOrMessageFn : errStringOrMessageFn(err);

    return source$ =>
        source$.pipe(
            logFn$((err: unknown) => `${getErrorMessageString(err)}: ${getErrorMessage(err)}`),
            catchError((err: unknown) =>
                throwError(() => (err instanceof ErrorCtor ? err : new ErrorCtor(getErrorMessageString(err))))
            )
        );
};
