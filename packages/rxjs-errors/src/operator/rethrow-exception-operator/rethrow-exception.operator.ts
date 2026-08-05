import { catchError, throwError } from 'rxjs';

import { getErrorMessage } from '@rnw-community/shared';

import { RxJSFilterError } from '../../rxjs-filter-error.js';
import { defaultCreateError } from '../../type/create-error-fn.type.js';

import type { CreateErrorFn } from '../../type/create-error-fn.type.js';
import type { ErrorCodeOrMsgFn } from '../../type/error-code-or-msg-fn.type.js';
import type { ErrorCtor } from '../../type/error-ctor.type.js';
import type { MonoTypeOperatorFunction } from 'rxjs';

type LogFn = (msg: string) => void;

export const rethrowException =
    <T>(
        errStringOrMessageFn: ErrorCodeOrMsgFn<unknown>,
        logFn: LogFn,
        ErrorCtor: ErrorCtor = RxJSFilterError,
        createError: CreateErrorFn = defaultCreateError(ErrorCtor)
    ): MonoTypeOperatorFunction<T> =>
    source$ =>
        source$.pipe(
            catchError((err: unknown) => {
                const message = typeof errStringOrMessageFn === 'string' ? errStringOrMessageFn : errStringOrMessageFn(err);

                logFn(`${message}: ${getErrorMessage(err)}`);

                return throwError(() => (err instanceof ErrorCtor ? err : createError(message)));
            })
        );
