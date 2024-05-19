import type { Observable } from 'rxjs';

export type DecoratedMethodType<TResult, TArgs extends unknown[]> = (
    ...args: TArgs
) => Observable<TResult> | Promise<TResult> | TResult;
