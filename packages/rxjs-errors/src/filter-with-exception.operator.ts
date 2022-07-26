import { of, throwError } from 'rxjs';
import { concatMap } from 'rxjs/operators';

import { RxJSFilterError } from './rxjs-filter-error';

import type { OperatorFunction } from 'rxjs';

export type FilterWithExceptionOperator = <TInput, TOutput extends TInput = TInput>(
    passingCondition: ((val: TInput) => boolean) | ((val: TInput) => val is TOutput),
    errorStringOrMsgFn: string | ((val: TInput) => string),
    createError?: (msg: string) => Error
) => OperatorFunction<TInput, TOutput>;

export const filterWithException: FilterWithExceptionOperator =
    (passingCondition, errorCodeOrMsgFn, createError = (msg: string) => new RxJSFilterError(msg)) =>
    source$ =>
        source$.pipe(
            concatMap(val =>
                passingCondition(val)
                    ? of(val)
                    : throwError(() =>
                          createError(typeof errorCodeOrMsgFn === 'string' ? errorCodeOrMsgFn : errorCodeOrMsgFn(val))
                      )
            )
        );
