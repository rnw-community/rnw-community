import { of, throwError } from 'rxjs';
import { concatMap } from 'rxjs/operators';

import { RxJSFilterError } from '../../rxjs-filter-error';
import { defaultCreateError } from '../../type/create-error-fn.type';

import type { CreateErrorFn } from '../../type/create-error-fn.type';
import type { ErrorCodeOrMsgFn } from '../../type/error-code-or-msg-fn.type';
import type { OperatorFunction } from 'rxjs';

type PassingConditionFn<TInput, TOutput extends TInput> = ((val: TInput) => boolean) | ((val: TInput) => val is TOutput);

export const filterWithException =
    <TInput, TOutput extends TInput = TInput>(
        passingCondition: PassingConditionFn<TInput, TOutput>,
        errorCodeOrMsgFn: ErrorCodeOrMsgFn<TInput>,
        createError: CreateErrorFn = defaultCreateError(RxJSFilterError)
    ): OperatorFunction<TInput, TOutput> =>
    source$ =>
        source$.pipe(
            concatMap(val =>
                passingCondition(val)
                    ? of(val as TOutput)
                    : throwError(() =>
                          createError(typeof errorCodeOrMsgFn === 'string' ? errorCodeOrMsgFn : errorCodeOrMsgFn(val))
                      )
            )
        );
