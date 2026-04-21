import { type MethodDecoratorType, isDefined } from '@rnw-community/shared';

import { promiseStrategy } from '../../strategy/promise-strategy/promise.strategy';
import { syncStrategy } from '../../strategy/sync-strategy/sync.strategy';
import { resolveFallbackClassName } from '../../util/resolve-fallback-class-name/resolve-fallback-class-name';
import { safeRelease } from '../../util/safe-release/safe-release';
import { swallow } from '../../util/swallow/swallow';
import { buildContext } from '../build-context/build-context';

import type { CreatePromiseInterceptorOptionsInterface } from '../../interface/create-promise-interceptor-options.interface';
import type { ResourceHandleInterface } from '../../interface/resource-handle.interface';
import type { ResultStrategyInterface } from '../../interface/result-strategy.interface';

 
 
export const createPromiseInterceptor = <
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- decorator generic must accept any-parameter method; Parameters<K> preserves inference
    K extends (...args: readonly any[]) => Promise<unknown>,
    TArgs extends Parameters<K> = Parameters<K>,
    TResult = Awaited<ReturnType<K>>,
>(
    options: CreatePromiseInterceptorOptionsInterface<TArgs, TResult>
): MethodDecoratorType<K> => {
    const strategies: readonly ResultStrategyInterface[] = [
        ...(options.strategies ?? []),
        promiseStrategy,
        syncStrategy,
    ];
    const { interceptor, resource } = options;

    return (target, propertyKey, descriptor) => {
        const methodName = String(propertyKey);
        const fallbackClassName = resolveFallbackClassName(target);
        const originalMethod = descriptor.value;

        if (typeof originalMethod !== 'function') {
            return descriptor;
        }

        // eslint-disable-next-line max-statements -- see parent eslint-disable rationale
        const interceptedMethod = async function interceptedMethod(this: unknown, ...args: TArgs): Promise<unknown> {
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

            let handle: ResourceHandleInterface | undefined;
            if (isDefined(resource)) {
                try {
                    handle = await resource.acquire(execContext);
                } catch (acquireErr) {
                    emitError(acquireErr);
                    throw acquireErr;
                }
            }

            if (interceptor.onEnter !== void 0) {
                swallow(() => void interceptor.onEnter?.(execContext));
            }

            let rawResult: unknown;
            try {
                rawResult = (originalMethod as (this: unknown, ...methodArgs: unknown[]) => unknown).apply(this, [...args]);
            } catch (syncErr) {
                emitError(syncErr);
                if (isDefined(handle)) {
                    await safeRelease(handle);
                }
                throw syncErr;
            }

            /* istanbul ignore next -- syncStrategy matches everything; ?? fallback defensive-only and unreachable with default strategies array */
            const strategy = strategies.find((item) => item.matches(rawResult)) ?? syncStrategy;
            const handled = strategy.handle(rawResult, emitSuccess, emitError);

            // Tie release to the settled value of the strategy's Promise so `finally`-style
            // cleanup does not run before the method completes. The strategy's own .catch
            // (e.g. promiseStrategy) already called emitError on rejection; we MUST NOT
            // re-catch here or onError would double-fire.
            if (isDefined(handle)) {
                const releasingHandle = handle;

                return await Promise.resolve(handled).finally(() => safeRelease(releasingHandle));
            }

            return await Promise.resolve(handled);
        };

        return {
            ...descriptor,
            value: interceptedMethod as unknown as typeof descriptor.value,
        };
    };
};
