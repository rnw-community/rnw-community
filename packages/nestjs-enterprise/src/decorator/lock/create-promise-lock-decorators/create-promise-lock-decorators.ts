import { Inject } from '@nestjs/common';

import {
    LockBusyError,
    createLegacyExclusiveLock,
    createLegacySequentialLock,
} from '@rnw-community/lock-decorator';
import type { LockStoreInterface } from '@rnw-community/lock-decorator';

import { isDefined, isNotEmptyArray, isPromise } from '@rnw-community/shared';
import type { AbstractConstructor, AnyFn, MethodDecoratorType } from '@rnw-community/shared';

import { RESOURCE_SEPARATOR, createLockServiceStore } from '../adapter/lock-service-store.adapter';

import type { LockServiceInterface } from '../interface/lock-service.interface';
import type { PreDecoratorFunction } from '../../../type/pre-decorator-function.type';

type LockModeType = 'sequential' | 'exclusive';

const LOCK_SERVICE_NOT_INJECTED_MESSAGE =
    'LockService was not injected. Ensure the lock service provider is registered in the NestJS module.';

const resolveResources = <TArgs extends unknown[]>(
    preLock: PreDecoratorFunction<TArgs, string[]> | string[],
    args: TArgs
): string[] => {
    const resources = Array.isArray(preLock) ? preLock : preLock(...args);
    if (!isNotEmptyArray(resources)) {
        throw new Error('Lock key is not defined');
    }
    return resources as string[];
};

const selectFactory = (mode: LockModeType) =>
    mode === 'sequential' ? createLegacySequentialLock : createLegacyExclusiveLock;

const buildLockedFn = <TArgs extends unknown[]>(
    mode: LockModeType,
    store: LockStoreInterface,
    joinedKey: string,
    methodName: string,
    originalMethod: (this: unknown, ...args: TArgs) => unknown
): ((this: unknown, ...args: TArgs) => Promise<unknown>) => {
    const wrappedMethod = function (this: unknown, ...wrappedArgs: TArgs): Promise<unknown> {
        const result = originalMethod.apply(this, wrappedArgs);
        if (isPromise(result)) {
            return result;
        }
        throw new Error(`Method ${methodName} does not return a promise`);
    };

    const lockDecorator = selectFactory(mode)({ store })<TArgs>(joinedKey);
    const lockedDescriptor = lockDecorator(
        {} as object,
        'locked',
        { value: wrappedMethod as never, writable: true, configurable: true, enumerable: true } as never
    );
    return (lockedDescriptor as unknown as { value: (this: unknown, ...args: TArgs) => Promise<unknown> }).value;
};

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
                const lockedFn = buildLockedFn<TArgs>(mode, store, joinedKey, methodName, originalMethod);

                try {
                    return await lockedFn.apply(self, args);
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
                }
            } as K;

            return descriptor;
        };

    return {
        SequentialLock: makeDecorator('sequential'),
        ExclusiveLock: makeDecorator('exclusive'),
    };
};
