import type { ResultStrategyInterface } from '../type/result-strategy.interface';
import { isPromiseLike } from '../util/is-promise';

export const promiseStrategy: ResultStrategyInterface = {
    matches: isPromiseLike,
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
