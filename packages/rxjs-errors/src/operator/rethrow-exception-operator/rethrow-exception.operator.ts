import { catchError, throwError } from 'rxjs';

import { getErrorMessage } from '@rnw-community/shared';

import { RxJSFilterError } from '../../rxjs-filter-error';
import { defaultCreateError } from '../../type/create-error-fn.type';

import type { CreateErrorFn } from '../../type/create-error-fn.type';
import type { ErrorCodeOrMsgFn } from '../../type/error-code-or-msg-fn.type';
import type { ErrorCtor } from '../../type/error-ctor.type';
import type { MonoTypeOperatorFunction } from 'rxjs';

type LogFn = (msg: string) => void;

export const rethrowException =
    <T>(
        errStringOrMessageFn: ErrorCodeOrMsgFn<unknown>,
        logFn: LogFn,
        // eslint-disable-next-line @typescript-eslint/naming-convention
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
