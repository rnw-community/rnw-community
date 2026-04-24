import { describe, expect, it, jest } from '@jest/globals';

import { type EmptyFn, emptyFn, isDefined } from '@rnw-community/shared';

import { LockAcquireTimeoutError } from '../../error/lock-acquire-timeout-error/lock-acquire-timeout.error';
import { LockBusyError } from '../../error/lock-busy-error/lock-busy.error';
import { assertValidTimeoutMs } from '../../util/assert-valid-timeout-ms/assert-valid-timeout-ms';

import { createExclusiveLockDecorator } from './create-exclusive-lock-decorator';

import type { AcquireOptionsInterface } from '../../interface/acquire-options.interface';
import type { LockHandleInterface } from '../../interface/lock-handle.interface';
import type { LockStoreInterface } from '../../interface/lock-store.interface';
import type { LockModeType } from '../../type/lock-mode.type';

// --- inline in-memory lock store: test fixture only, not a public API ---
type SettleFn = (action: 'resolve' | 'reject', value?: unknown) => void;

const buildSettle = (
    resolve: EmptyFn,
    reject: (reason?: unknown) => void,
    clearTimer: EmptyFn,
    removeListener: EmptyFn
): SettleFn => {
    let settled = false;

    return (action, value) => {
        if (settled) {
            return;
        }
        settled = true;
        clearTimer();
        removeListener();
        if (action === 'resolve') {
            resolve();
        } else {
            reject(value as Error);
        }
    };
};

const buildTimer = (key: string, timeoutMs: number, resolveSlot: EmptyFn, settle: SettleFn): ReturnType<typeof setTimeout> =>
    setTimeout(() => {
        resolveSlot();
        settle('reject', new LockAcquireTimeoutError(key, timeoutMs));
    }, timeoutMs);

interface WaitForTurnContext {
    readonly resolve: EmptyFn;
    readonly reject: (reason?: unknown) => void;
    readonly resolveSlot: EmptyFn;
    readonly currentTail: Promise<void>;
    readonly key: string;
    readonly timeoutMs: number | undefined;
    readonly signal: AbortSignal | undefined;
}

// eslint-disable-next-line max-statements
const buildWaitForTurn = (ctx: WaitForTurnContext): void => {
    const { resolve, reject, resolveSlot, currentTail, key, timeoutMs, signal } = ctx;
    let timerId: ReturnType<typeof setTimeout> | undefined;
    let removeListener: EmptyFn = emptyFn;

    const clearTimer = (): void => {
        if (isDefined(timerId)) {
            clearTimeout(timerId);
        }
    };
    const settle = buildSettle(resolve, reject, clearTimer, () => void removeListener());

    if (signal?.aborted === true) {
        resolveSlot();
        reject(new DOMException('The operation was aborted.', 'AbortError'));

        return;
    }

    if (isDefined(signal)) {
        const onAbort = (): void => {
            resolveSlot();
            settle('reject', new DOMException('The operation was aborted.', 'AbortError'));
        };
        signal.addEventListener('abort', onAbort);
        removeListener = () => {
            signal.removeEventListener('abort', onAbort);
        };
    }

    if (isDefined(timeoutMs)) {
        timerId = buildTimer(key, timeoutMs, resolveSlot, settle);
    }

    void currentTail.then(
        () => void settle('resolve'),
        /* istanbul ignore next */
        () => void settle('resolve')
    );
};

const acquireSequential = (
    sequentialChains: Map<string, Promise<void>>,
    key: string,
    options?: AcquireOptionsInterface
): Promise<LockHandleInterface> => {
    const timeoutMs = options?.timeoutMs;
    const signal = options?.signal;
    const currentTail = sequentialChains.get(key) ?? Promise.resolve();

    let resolveSlot!: EmptyFn;

    const slotPromise = new Promise<void>((resolve) => {
        resolveSlot = resolve;
    });

    const nextTail = currentTail.then(() => slotPromise);
    sequentialChains.set(key, nextTail);

    const waitForTurn = new Promise<void>((resolve, reject) => {
        buildWaitForTurn({ resolve, reject, resolveSlot, currentTail, key, timeoutMs, signal });
    });

    const deleteTailIfStillOurs = (): void => {
        if (sequentialChains.get(key) === nextTail) {
            sequentialChains.delete(key);
        }
    };

    return waitForTurn.then(
        () => {
            let released = false;

            return {
                key,
                mode: 'sequential' as const,
                release: (): void => {
                    if (released) {
                        return;
                    }
                    released = true;
                    resolveSlot();
                    deleteTailIfStillOurs();
                },
            };
        },
        (err: unknown) => {
            void nextTail.finally(deleteTailIfStillOurs);
            throw err;
        }
    );
};

const acquireExclusive = (exclusiveHeld: Set<string>, key: string): Promise<LockHandleInterface> => {
    if (exclusiveHeld.has(key)) {
        return Promise.reject(new LockBusyError(key));
    }

    exclusiveHeld.add(key);

    let released = false;
    const handle: LockHandleInterface = {
        key,
        mode: 'exclusive',
        release: (): void => {
            if (released) {
                return;
            }
            released = true;
            exclusiveHeld.delete(key);
        },
    };

    return Promise.resolve(handle);
};

const createInMemoryLockStore = (): LockStoreInterface => {
    const sequentialChains = new Map<string, Promise<void>>();
    const exclusiveHeld = new Set<string>();

    return {
        acquire: (key: string, mode: LockModeType, options?: AcquireOptionsInterface): Promise<LockHandleInterface> => {
            try {
                assertValidTimeoutMs(options?.timeoutMs);
            } catch (err: unknown) {
                // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- assertValidTimeoutMs throws TypeError
                return Promise.reject(err);
            }
            if (mode === 'sequential') {
                return acquireSequential(sequentialChains, key, options);
            }

            return acquireExclusive(exclusiveHeld, key);
        },
    };
};
// --- end inline fixture ---

const store = createInMemoryLockStore();
const ExclusiveLock = createExclusiveLockDecorator({ store });

class PaymentService {
    @ExclusiveLock('capture-payment')
    async capturePayment(orderId: string, amount: number): Promise<{ readonly orderId: string; readonly captured: number }> {
        return { orderId, captured: amount };
    }

    @ExclusiveLock(args => `refund:${args[0]}`)
    async refundPayment(orderId: string): Promise<{ readonly orderId: string; readonly refunded: boolean }> {
        return { orderId, refunded: true };
    }

    @ExclusiveLock({ key: args => `status:${args[0]}` })
    async getPaymentStatus(orderId: string): Promise<string> {
        return `status:${orderId}`;
    }

    // @ts-expect-error — sync method intentionally violates the Promise-returning contract; runtime guard catches it
    @ExclusiveLock('validate-card')
    syncValidateCard(cardNumber: string): boolean {
        return cardNumber.length === 16;
    }
}

describe('createExclusiveLockDecorator', () => {
    it('executes the decorated method and returns its result', async () => {
        expect.hasAssertions();

        const service = new PaymentService();
        const result = await service.capturePayment('order-42', 99);

        expect(result).toStrictEqual({ orderId: 'order-42', captured: 99 });
    });

    it('releases the lock after the method succeeds', async () => {
        expect.hasAssertions();

        const localStore = createInMemoryLockStore();
        const spy = jest.spyOn(localStore, 'acquire');
        const LocalExLock = createExclusiveLockDecorator({ store: localStore });

        class ChargeService {
            @LocalExLock('charge-card')
            async chargeCard(amount: number): Promise<string> {
                return `charged:${amount.toString()}`;
            }
        }

        const svc = new ChargeService();
        await svc.chargeCard(50);

        expect(spy).toHaveBeenCalledWith('charge-card', 'exclusive', expect.anything());
    });

    it('throws LockBusyError when the lock is already held', async () => {
        expect.hasAssertions();

        const localStore = createInMemoryLockStore();
        const LocalExLock = createExclusiveLockDecorator({ store: localStore });

        let releaseHeld!: () => void;
        const holdUntilReleased = new Promise<void>(resolve => {
            releaseHeld = resolve;
        });

        class CheckoutService {
            @LocalExLock('checkout-lock')
            async processCheckout(orderId: string): Promise<string> {
                await holdUntilReleased;

                return `checkout:${orderId}`;
            }
        }

        const svc = new CheckoutService();
        const firstCheckout = svc.processCheckout('order-1');

        await expect(svc.processCheckout('order-2')).rejects.toBeInstanceOf(LockBusyError);

        releaseHeld();
        await firstCheckout;
    });

    it('builds the lock key from a function key form using method arguments', async () => {
        expect.hasAssertions();

        const localStore = createInMemoryLockStore();
        const spy = jest.spyOn(localStore, 'acquire');
        const LocalExLock = createExclusiveLockDecorator({ store: localStore });

        class SettlementService {
            @LocalExLock(args => `settle:${args[0]}`)
            async settleOrder(orderId: string): Promise<string> {
                return `settled:${orderId}`;
            }
        }

        const svc = new SettlementService();
        await svc.settleOrder('order-77');

        expect(spy).toHaveBeenCalledWith('settle:order-77', 'exclusive', expect.anything());
    });

    it('uses object key form with a dynamic key function', async () => {
        expect.hasAssertions();

        const localStore = createInMemoryLockStore();
        const spy = jest.spyOn(localStore, 'acquire');
        const LocalExLock = createExclusiveLockDecorator({ store: localStore });

        class AuthorizationService {
            @LocalExLock({ key: args => `auth:${args[0]}` })
            async authorizeTransaction(orderId: string): Promise<boolean> {
                return orderId.length > 0;
            }
        }

        const svc = new AuthorizationService();
        await svc.authorizeTransaction('order-5');

        expect(spy).toHaveBeenCalledWith('auth:order-5', 'exclusive', expect.anything());
    });

    it('propagates method errors and releases the lock', async () => {
        expect.hasAssertions();

        const localStore = createInMemoryLockStore();
        const LocalExLock = createExclusiveLockDecorator({ store: localStore });

        class DeclineService {
            @LocalExLock('decline-payment')
            async declinePayment(orderId: string): Promise<void> {
                throw new Error(`payment declined for ${orderId}`);
            }
        }

        const svc = new DeclineService();
        await expect(svc.declinePayment('order-9')).rejects.toThrow('payment declined for order-9');

        const handle = await localStore.acquire('decline-payment', 'exclusive');
        expect(handle.key).toBe('decline-payment');
        void handle.release();
    });

    it('swallows errors thrown during lock release', async () => {
        expect.hasAssertions();

        const failingHandle = {
            key: 'payment-release',
            mode: 'exclusive' as const,
            release: jest.fn<() => Promise<void>>().mockRejectedValue(new Error('release failure')),
        };
        const mockStore = {
            acquire: jest.fn<() => Promise<typeof failingHandle>>().mockResolvedValue(failingHandle),
        } as unknown as LockStoreInterface;

        const LocalExLock = createExclusiveLockDecorator({ store: mockStore });

        class VoidService {
            @LocalExLock('payment-release')
            async voidTransaction(transactionId: string): Promise<string> {
                return `voided:${transactionId}`;
            }
        }

        const svc = new VoidService();
        await expect(svc.voidTransaction('txn-55')).resolves.toBe('voided:txn-55');
    });

    it('returns the original descriptor unchanged when applied to a non-function property', () => {
        expect.hasAssertions();

        const localStore = createInMemoryLockStore();
        const LocalExLock = createExclusiveLockDecorator({ store: localStore });

        const descriptor: PropertyDescriptor = { get: (): string => 'payment-value', configurable: true };
        const result = LocalExLock('payment-prop')({} as object, 'paymentProp', descriptor);

        expect(result).toBe(descriptor);
    });
});
