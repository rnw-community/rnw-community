import { concatMap } from 'rxjs';

import type { MonoTypeOperatorFunction, Observable } from 'rxjs';

export const rxjsOperator =
    <T>(handlerFn: () => void): MonoTypeOperatorFunction<T> =>
    (source$: Observable<T>): Observable<T> =>
        source$.pipe(
            concatMap(input => {
                handlerFn();

                return [input];
            })
        );
