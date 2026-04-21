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

            try {
                if (interceptor.onEnter !== void 0) {
                    swallow(() => void interceptor.onEnter?.(execContext));
                }
                const rawResult = (originalMethod as (this: unknown, ...methodArgs: unknown[]) => unknown).apply(this, [...args]);
                /* istanbul ignore next -- syncStrategy matches everything; ?? fallback defensive-only and unreachable with default strategies array */
                const strategy = strategies.find((item) => item.matches(rawResult)) ?? syncStrategy;

                return strategy.handle(rawResult, emitSuccess, emitError);
            } catch (methodErr) {
                emitError(methodErr);
                throw methodErr;
            } finally {
                if (isDefined(handle)) {
                    await safeRelease(handle);
                }
            }
        };

        return {
            ...descriptor,
            value: interceptedMethod as unknown as typeof descriptor.value,
        };
    };
};
