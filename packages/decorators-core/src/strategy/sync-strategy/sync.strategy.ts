import type { ResultStrategyInterface } from '../../interface/result-strategy.interface';

export const syncStrategy: ResultStrategyInterface = {
    matches: () => true,
    handle: <TResult>(value: TResult, onSuccess: (resolved: unknown) => void): TResult => {
        onSuccess(value);

        return value;
    },
};
