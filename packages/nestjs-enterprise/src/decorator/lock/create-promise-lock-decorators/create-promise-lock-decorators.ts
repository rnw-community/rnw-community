import { Inject } from '@nestjs/common';

import { LockBusyError } from '@rnw-community/lock-decorator';
import type { LockHandleInterface } from '@rnw-community/lock-decorator';

import { isDefined, isPromise } from '@rnw-community/shared';
import type { AbstractConstructor, AnyFn, MethodDecoratorType } from '@rnw-community/shared';

import {
    LOCK_SERVICE_NOT_INJECTED_MESSAGE,
    RESOURCE_SEPARATOR,
    createLockServiceStore,
    resolveResources,
} from '../adapter/lock-service-store.adapter';

import type { LockServiceInterface } from '../interface/lock-service.interface';
import type { PreDecoratorFunction } from '../../../type/pre-decorator-function.type';

type LockModeType = 'sequential' | 'exclusive';

export const createPromiseLockDecorators = (
    serviceToken: AbstractConstructor<LockServiceInterface>,
    defaultDuration: number
) => {
    const serviceSymbol = Symbol('LockService');

    const makeDecorator =
        (mode: LockModeType) =>
        <K extends AnyFn, TResult extends ReturnType<K>, TArgs extends Parameters<K>>(
            preLock: PreDecoratorFunction<TArgs, string[]> | string[],
            catchErrorFn?: (error: unknown) => TResult,
            duration?: number
            // eslint-disable-next-line @typescript-eslint/max-params
        ): MethodDecoratorType<K> =>
        (target, propertyKey, descriptor) => {
            Inject(serviceToken)(target, serviceSymbol);

            const methodName = `${target.constructor.name}::${String(propertyKey)}`;
            const originalMethod = descriptor.value as unknown as (this: unknown, ...a: TArgs) => unknown;
            const effectiveDuration = duration ?? defaultDuration;

            descriptor.value = async function (this: unknown, ...args: TArgs): Promise<unknown> {
                const self = this;
                const lockService = (self as Record<symbol, unknown>)[serviceSymbol] as LockServiceInterface | undefined;
                if (!isDefined(lockService)) {
                    throw new Error(LOCK_SERVICE_NOT_INJECTED_MESSAGE);
                }
                const resources = resolveResources(preLock, args);
                const joinedKey = resources.join(RESOURCE_SEPARATOR);
                const store = createLockServiceStore(lockService, effectiveDuration);

                let handle: LockHandleInterface | undefined;
                try {
                    handle = await store.acquire(joinedKey, mode);
                    const result = originalMethod.apply(self, args);
                    if (!isPromise(result)) {
                        throw new Error(`Method ${methodName} does not return a promise`);
                    }
                    return await result;
                } catch (error) {
                    if (error instanceof LockBusyError && mode === 'exclusive' && !isDefined(catchErrorFn)) {
                        // eslint-disable-next-line no-undefined
                        return undefined;
                    }
                    const normalized =
                        error instanceof LockBusyError
                            ? new Error(`Lock not acquired for keys: ${error.key.split(RESOURCE_SEPARATOR).join(', ')}`)
                            : error;
                    if (isDefined(catchErrorFn)) {
                        return catchErrorFn(normalized);
                    }
                    throw normalized;
                } finally {
                    if (isDefined(handle)) {
                        try {
                            await handle.release();
                        } catch {
                            // release errors are silently swallowed
                        }
                    }
                }
            } as K;

            return descriptor;
        };

    return {
        SequentialLock: makeDecorator('sequential'),
        ExclusiveLock: makeDecorator('exclusive'),
    };
};
