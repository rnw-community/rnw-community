import { Observable, catchError, concatMap, defer, finalize, of, throwError } from 'rxjs';

import { type MethodDecoratorType, isDefined } from '@rnw-community/shared';

import { observableStrategy } from '../../strategy/observable-strategy/observable.strategy';
import { resolveFallbackClassName } from '../../util/resolve-fallback-class-name/resolve-fallback-class-name';
import { safeReleaseObservable } from '../../util/safe-release-observable/safe-release-observable';
import { swallow } from '../../util/swallow/swallow';
import { buildContext } from '../build-context/build-context';

import type { CreateObservableInterceptorOptionsInterface } from '../../interface/create-observable-interceptor-options.interface';
import type { ResourceHandleInterface } from '../../interface/resource-handle.interface';
import type { ResultStrategyInterface } from '../../interface/result-strategy.interface';

 
export const createObservableInterceptor = <
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- decorator generic must accept any-parameter method; Parameters<K> preserves inference
    K extends (...args: readonly any[]) => Observable<unknown>,
    TArgs extends Parameters<K> = Parameters<K>,
    TResult = unknown,
>(
    options: CreateObservableInterceptorOptionsInterface<TArgs, TResult>
): MethodDecoratorType<K> => {
    const strategies: readonly ResultStrategyInterface[] = [...(options.strategies ?? []), observableStrategy];
    const { interceptor, resource$ } = options;

    return (target, propertyKey, descriptor) => {
        const methodName = String(propertyKey);
        const fallbackClassName = resolveFallbackClassName(target);
        const originalMethod = descriptor.value;

        if (typeof originalMethod !== 'function') {
            return descriptor;
        }

        const interceptedMethod = function interceptedMethod(this: unknown, ...args: TArgs): Observable<unknown> {
            return new Observable<unknown>((subscriber) => {
                const start = performance.now();
                const execContext = buildContext(this, fallbackClassName, methodName, args);

                const emitSuccess = (resolved: unknown): void => {
                    if (interceptor.onSuccess !== void 0) {
                        swallow(() => void interceptor.onSuccess?.(execContext, resolved as Awaited<TResult>, performance.now() - start));
                    }
                };
                const emitError = (error: unknown): void => {
                    if (interceptor.onError !== void 0) {
                        swallow(() => void interceptor.onError?.(execContext, error, performance.now() - start));
                    }
                };

                const acquire$: Observable<ResourceHandleInterface | undefined> = isDefined(resource$)
                    ? resource$.acquire$(execContext).pipe(
                          catchError((acquireErr: unknown) => {
                              emitError(acquireErr);

                              return throwError(() => acquireErr);
                          })
                      )
                    : of(void 0);

                const inner = acquire$.pipe(
                    concatMap((handle) => {
                        const methodObservable$ = defer(() => {
                            if (interceptor.onEnter !== void 0) {
                                swallow(() => void interceptor.onEnter?.(execContext));
                            }
                            const rawResult = (originalMethod as (this: unknown, ...methodArgs: unknown[]) => unknown).apply(this, [...args]);

                            return rawResult as Observable<unknown>;
                        });
                        /* istanbul ignore next -- observableStrategy matches any Observable; ?? fallback defensive-only and unreachable with default strategies array */
                        const strategy = strategies.find((item) => item.matches(methodObservable$)) ?? observableStrategy;
                        const piped$ = strategy.handle(methodObservable$, emitSuccess, emitError);

                        return isDefined(handle) ? piped$.pipe(finalize(() => void safeReleaseObservable(handle))) : piped$;
                    })
                );

                return inner.subscribe(subscriber);
            });
        };

        return {
            ...descriptor,
            value: interceptedMethod as unknown as typeof descriptor.value,
        };
    };
};
