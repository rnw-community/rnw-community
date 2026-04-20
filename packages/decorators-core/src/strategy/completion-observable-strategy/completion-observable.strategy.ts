import { type Observable, catchError, isObservable, tap, throwError } from 'rxjs';

import type { ResultStrategyInterface } from '../../interface/result-strategy.interface';

export const completionObservableStrategy: ResultStrategyInterface = {
    matches: isObservable,
    handle: <TResult>(value: TResult, onSuccess: (resolved: unknown) => void, onError: (error: unknown) => void): TResult => {
        let lastValue: unknown;

        return (value as unknown as Observable<unknown>).pipe(
            tap({
                next: (emitted: unknown) => {
                    lastValue = emitted;
                },
                complete: () => { onSuccess(lastValue); },
            }),
            catchError((error: unknown) => {
                onError(error);

                return throwError(() => error);
            })
        ) as unknown as TResult;
    },
};
