import { Inject } from '@nestjs/common';

import {
    LockBusyError,
    createLegacyExclusiveLock,
    createLegacySequentialLock,
} from '@rnw-community/lock-decorator';
import type { LockStoreInterface } from '@rnw-community/lock-decorator';

import { isDefined, isNotEmptyArray } from '@rnw-community/shared';
import type { AbstractConstructor, AnyFn, MethodDecoratorType } from '@rnw-community/shared';

import { RESOURCE_SEPARATOR, createLockServiceStore } from '../adapter/lock-service-store.adapter';

import type { LockServiceInterface } from '../interface/lock-service.interface';
import type { PreDecoratorFunction } from '../../../type/pre-decorator-function.type';

type LockModeType = 'sequential' | 'exclusive';

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
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const originalMethod = descriptor.value!;
            const effectiveDuration = duration ?? defaultDuration;

            // eslint-disable-next-line max-statements, func-names
            descriptor.value = async function (this: unknown, ...args: TArgs): Promise<unknown> {
                const self = this;
                const lockService = (self as Record<symbol, unknown>)[serviceSymbol] as LockServiceInterface | undefined;

                try {
                    if (lockService === undefined) {
                        throw new Error(
                            'LockService was not injected. Ensure the lock service provider is registered in the NestJS module.'
                        );
                    }

                    const resources = resolveResources(preLock, args);
                    const joinedKey = resources.join(RESOURCE_SEPARATOR);
                    const store: LockStoreInterface = createLockServiceStore(lockService, effectiveDuration);

                    // Wrap originalMethod so a non-Promise return fails loudly while still
                    // giving runWithLock's finally block a chance to release the lock.
                    const wrappedMethod = function (this: unknown, ...wrappedArgs: TArgs): Promise<unknown> {
                        const result = (originalMethod as unknown as (this: unknown, ...a: TArgs) => unknown).apply(
                            this,
                            wrappedArgs
                        );
                        if (result instanceof Promise) {
                            return result;
                        }
                        throw new Error(`Method ${methodName} does not return a promise`);
                    };

                    const factory = mode === 'sequential' ? createLegacySequentialLock({ store }) : createLegacyExclusiveLock({ store });
                    const lockDecorator = factory<TArgs>(joinedKey);
                    const lockedDescriptor = lockDecorator(
                        {} as object,
                        'locked',
                        { value: wrappedMethod as never, writable: true, configurable: true, enumerable: true } as never
                    );
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    const lockedFn = (lockedDescriptor as unknown as { value: (this: unknown, ...a: TArgs) => Promise<unknown> }).value!;

                    return await lockedFn.apply(self, args);
                } catch (error) {
                    let normalized: unknown = error;

                    if (error instanceof LockBusyError) {
                        // Upstream behaviour: exclusive lock already held + no catchErrorFn → return undefined
                        if (mode === 'exclusive' && !isDefined(catchErrorFn)) {
                            // eslint-disable-next-line no-undefined
                            return undefined;
                        }
                        const keys = error.key.split(RESOURCE_SEPARATOR).join(', ');
                        normalized = new Error(`Lock not acquired for keys: ${keys}`);
                    }

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
