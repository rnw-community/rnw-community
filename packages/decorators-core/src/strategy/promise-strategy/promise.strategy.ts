import { isPromise } from '@rnw-community/shared';

import type { ResultStrategyInterface } from '../../interface/result-strategy.interface';

export const promiseStrategy: ResultStrategyInterface = {
    matches: isPromise,
    handle: <TResult>(value: TResult, onSuccess: (resolved: unknown) => void, onError: (error: unknown) => void): TResult =>
        (value as unknown as PromiseLike<unknown>).then(
            (resolved: unknown) => {
                onSuccess(resolved);

                return resolved;
            },
            (error: unknown) => {
                onError(error);
                throw error;
            }
        ) as TResult,
};
