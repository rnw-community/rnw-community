import { Inject } from '@nestjs/common';

import { LockBusyError } from '@rnw-community/lock-decorator';
import { isDefined, isPromise } from '@rnw-community/shared';

import { createLockServiceStore } from '../create-lock-service-store';
import { LOCK_SERVICE_NOT_INJECTED_MESSAGE } from '../lock-service-not-injected-message.const';
import { resolveResources } from '../resolve-resources';
import { RESOURCE_SEPARATOR } from '../resource-separator.const';

import type { PreDecoratorFunction } from '../../../pre-decorator-function.type';
import type { LockServiceInterface } from '../interface/lock-service.interface';
import type { LockHandleInterface } from '@rnw-community/lock-decorator';
import type { AbstractConstructor, MethodDecoratorType } from '@rnw-community/shared';

type LockModeType = 'sequential' | 'exclusive';

const safeRelease = async (handle: LockHandleInterface | undefined): Promise<void> => {
    if (!isDefined(handle)) {
        return;
    }
    try {
        await handle.release();
    } catch {
        /* release errors are silently swallowed */
    }
};

const handleLockError = <TResult>(
    error: unknown,
    mode: LockModeType,
    catchErrorFn: ((error: unknown) => TResult) | undefined
): TResult | undefined => {
    const isExclusiveBusy = error instanceof LockBusyError && mode === 'exclusive' && !isDefined(catchErrorFn);
    const normalized =
        error instanceof LockBusyError
            ? new Error(`Lock not acquired for keys: ${error.key.split(RESOURCE_SEPARATOR).join(', ')}`)
            : error;
    if (isExclusiveBusy) {
        return void 0;
    }
    if (isDefined(catchErrorFn)) {
        return catchErrorFn(normalized);
    }
    throw normalized;
};

export const createPromiseLockDecorators = (
    serviceToken: AbstractConstructor<LockServiceInterface>,
    defaultDuration: number
) => {
    const serviceSymbol = Symbol('LockService');

    const makeDecorator =
        (mode: LockModeType) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <K extends (...args: any[]) => Promise<any>, TResult extends ReturnType<K>, TArgs extends Parameters<K>>(
            preLock: PreDecoratorFunction<TArgs, string[]> | string[],
            catchErrorFn?: (error: unknown) => TResult,
            duration?: number
        ): MethodDecoratorType<K> =>
        (target, propertyKey, descriptor) => {
            Inject(serviceToken)(target, serviceSymbol);

            const methodName = `${target.constructor.name}::${String(propertyKey)}`;
            const originalMethod = descriptor.value as unknown as (this: unknown, ...args: TArgs) => unknown;
            const effectiveDuration = duration ?? defaultDuration;

            // eslint-disable-next-line max-statements
            descriptor.value = async function promiseLockDecorator(this: unknown, ...args: TArgs): Promise<unknown> {
                const lockService = (this as Record<symbol, unknown>)[serviceSymbol] as LockServiceInterface | undefined;
                if (!isDefined(lockService)) {
                    throw new Error(LOCK_SERVICE_NOT_INJECTED_MESSAGE);
                }
                const resources = resolveResources(preLock, args);
                const joinedKey = resources.join(RESOURCE_SEPARATOR);
                const store = createLockServiceStore(lockService, effectiveDuration);

                let handle: LockHandleInterface | undefined;
                try {
                    handle = await store.acquire(joinedKey, mode);
                    const result = originalMethod.apply(this, args);
                    if (!isPromise(result)) {
                        throw new Error(`Method ${methodName} does not return a promise`);
                    }

                    return await result;
                } catch (error) {
                    return await Promise.resolve(handleLockError(error, mode, catchErrorFn));
                } finally {
                    await safeRelease(handle);
                }
            } as K;

            return descriptor;
        };

    return {
        SequentialLock: makeDecorator('sequential'),
        ExclusiveLock: makeDecorator('exclusive'),
    };
};
