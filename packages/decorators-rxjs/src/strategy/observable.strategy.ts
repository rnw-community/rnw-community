import type { ResultStrategyInterface } from '@rnw-community/decorators-core';
import { catchError, isObservable, tap, throwError } from 'rxjs';

export const observableStrategy: ResultStrategyInterface = {
    matches: isObservable,
    handle: <TResult>(value: TResult, onSuccess: (resolved: unknown) => void, onError: (error: unknown) => void): TResult => {
        const obs$ = value as unknown as import('rxjs').Observable<unknown>;

        return obs$.pipe(
            tap(onSuccess),
            catchError((error: unknown) => {
                onError(error);

                return throwError(() => error);
            })
        ) as unknown as TResult;
    },
};
