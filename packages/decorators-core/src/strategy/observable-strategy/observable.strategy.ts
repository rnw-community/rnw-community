import { type Observable, catchError, isObservable, tap, throwError } from 'rxjs';

import type { ResultStrategyInterface } from '../../interface/result-strategy.interface';

export const observableStrategy: ResultStrategyInterface = {
    matches: isObservable,
    handle: <TResult>(value: TResult, onSuccess: (resolved: unknown) => void, onError: (error: unknown) => void): TResult =>
        (value as unknown as Observable<unknown>).pipe(
            tap(onSuccess),
            catchError((error: unknown) => {
                onError(error);

                return throwError(() => error);
            })
        ) as unknown as TResult,
};
