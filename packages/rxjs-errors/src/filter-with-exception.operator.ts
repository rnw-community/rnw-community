import { of, throwError } from 'rxjs';
import { concatMap } from 'rxjs/operators';

import { RxJSFilterError } from './rxjs-filter-error';

import type { OperatorFunction } from 'rxjs';

export type FilterWithErrorOperator = <TInput, TOutput extends TInput = TInput>(
    passingCondition: ((val: TInput) => boolean) | ((val: TInput) => val is TOutput),
    errorCodeOrMsgFn: string | ((val: TInput) => string),
    ErrCtor?: new (msg: string) => Error
) => OperatorFunction<TInput, TOutput>;

export const filterWithError: FilterWithErrorOperator =
    (passingCondition, errorCodeOrMsgFn, ErrCtor = RxJSFilterError) =>
    source$ =>
        source$.pipe(
            concatMap(val =>
                passingCondition(val)
                    ? of(val)
                    : throwError(
                          () => new ErrCtor(typeof errorCodeOrMsgFn === 'string' ? errorCodeOrMsgFn : errorCodeOrMsgFn(val))
                      )
            )
        );
