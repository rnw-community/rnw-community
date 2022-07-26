import { catchError, throwError } from 'rxjs';

import { getErrorMessage, isDefined } from '@rnw-community/shared';

import { RxJSFilterError } from './rxjs-filter-error';

import type { Observable } from 'rxjs';

export type RethrowExceptionOperator = <T>(
    errStringOrMessageFn: string | ((err: unknown) => string),
    logFn?: (msg: string) => void,
    ErrorCtor?: new (msg: string) => Error,
    createError?: (msg: string) => Error
) => (source$: Observable<T>) => Observable<T>;

const defaultErrorCreator =
    (ErrorCtor: new (msg: string) => Error) =>
    (msg: string): Error =>
        new ErrorCtor(msg);

export const rethrowException: RethrowExceptionOperator = (
    errStringOrMessageFn,
    logFn,
    ErrorCtor = RxJSFilterError,
    createError = defaultErrorCreator(ErrorCtor)
) => {
    const getErrorMessageString = (err: unknown): string =>
        typeof errStringOrMessageFn === 'string' ? errStringOrMessageFn : errStringOrMessageFn(err);

    return source$ =>
        source$.pipe(
            catchError((err: unknown) => {
                if (isDefined(logFn)) logFn(`${getErrorMessageString(err)}: ${getErrorMessage(err)}`);

                return throwError(() => (err instanceof ErrorCtor ? err : createError(getErrorMessageString(err))));
            })
        );
};
