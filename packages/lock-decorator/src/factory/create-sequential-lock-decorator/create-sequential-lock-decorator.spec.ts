import { describe, expect, it, jest } from '@jest/globals';

import { type EmptyFn, emptyFn, isDefined, wait } from '@rnw-community/shared';

import { LockAcquireTimeoutError } from '../../error/lock-acquire-timeout-error/lock-acquire-timeout.error';
import { LockBusyError } from '../../error/lock-busy-error/lock-busy.error';
import { assertValidTimeoutMs } from '../../util/assert-valid-timeout-ms/assert-valid-timeout-ms';

import { createSequentialLockDecorator } from './create-sequential-lock-decorator';

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
const SequentialLock = createSequentialLockDecorator({ store });

class OrderService {
    readonly inventory = new Map<string, number>([['sku-1', 10]]);

    @SequentialLock('order-create')
    async createOrder(
        productId: string,
        qty: number
    ): Promise<{ readonly id: string; readonly productId: string; readonly qty: number }> {
        const stock = this.inventory.get(productId) ?? 0;
        if (stock < qty) {
            throw new Error(`out of stock: ${productId}`);
        }
        this.inventory.set(productId, stock - qty);

        return { id: `order-${productId}-${qty.toString()}`, productId, qty };
    }

    @SequentialLock(args => `update:${args[0]}`)
    async updateOrder(productId: string): Promise<{ readonly productId: string; readonly stock: number }> {
        return { productId, stock: this.inventory.get(productId) ?? 0 };
    }

    @SequentialLock('order-read')
    async getInventory(productId: string): Promise<number> {
        return this.inventory.get(productId) ?? 0;
    }

    // @ts-expect-error — sync method intentionally violates the Promise-returning contract; runtime guard catches it
    @SequentialLock('validate-sku')
    syncValidateSku(sku: string): boolean {
        return this.inventory.has(sku);
    }
}

describe('createSequentialLockDecorator', () => {
    it('executes the decorated method and returns its result', async () => {
        expect.hasAssertions();

        const service = new OrderService();
        const result = await service.createOrder('sku-1', 3);

        expect(result).toStrictEqual({ id: 'order-sku-1-3', productId: 'sku-1', qty: 3 });
    });

    it('releases the lock after the method succeeds', async () => {
        expect.hasAssertions();

        const localStore = createInMemoryLockStore();
        const spy = jest.spyOn(localStore, 'acquire');
        const LocalSeqLock = createSequentialLockDecorator({ store: localStore });

        class InvoiceService {
            @LocalSeqLock('invoice-gen')
            async generateInvoice(orderId: string): Promise<string> {
                return `invoice-${orderId}`;
            }
        }

        const svc = new InvoiceService();
        await svc.generateInvoice('order-42');

        expect(spy).toHaveBeenCalledWith('invoice-gen', 'sequential', expect.anything());
        const handle = await localStore.acquire('invoice-gen', 'sequential');
        expect(handle.key).toBe('invoice-gen');
        void handle.release();
    });

    it('releases the lock after the method throws', async () => {
        expect.hasAssertions();

        const localStore = createInMemoryLockStore();
        const LocalSeqLock = createSequentialLockDecorator({ store: localStore });

        class FulfillmentService {
            @LocalSeqLock('fulfill')
            async fulfill(orderId: string): Promise<void> {
                throw new Error(`cannot fulfill ${orderId}`);
            }
        }

        const svc = new FulfillmentService();
        await expect(svc.fulfill('order-99')).rejects.toThrow('cannot fulfill order-99');

        const handle = await localStore.acquire('fulfill', 'sequential');
        expect(handle.key).toBe('fulfill');
        void handle.release();
    });

    it('builds the lock key from a function key form using method arguments', async () => {
        expect.hasAssertions();

        const localStore = createInMemoryLockStore();
        const spy = jest.spyOn(localStore, 'acquire');
        const LocalSeqLock = createSequentialLockDecorator({ store: localStore });

        class CatalogService {
            @LocalSeqLock(args => `price:${args[0]}`)
            async updatePrice(sku: string): Promise<string> {
                return `updated:${sku}`;
            }
        }

        const svc = new CatalogService();
        await svc.updatePrice('sku-1');

        expect(spy).toHaveBeenCalledWith('price:sku-1', 'sequential', expect.anything());
    });

    it('passes timeoutMs to the store acquire via object key form', async () => {
        expect.hasAssertions();

        const localStore = createInMemoryLockStore();
        const spy = jest.spyOn(localStore, 'acquire');
        const LocalSeqLock = createSequentialLockDecorator({ store: localStore });

        class ShippingService {
            @LocalSeqLock({ key: 'ship-schedule', timeoutMs: 250 })
            async scheduleShipment(orderId: string): Promise<string> {
                return `shipment-${orderId}`;
            }
        }

        const svc = new ShippingService();
        await svc.scheduleShipment('order-7');

        expect(spy).toHaveBeenCalledWith('ship-schedule', 'sequential', { timeoutMs: 250, signal: undefined });
    });

    it('queues concurrent calls on the same key in FIFO order', async () => {
        expect.hasAssertions();

        const localStore = createInMemoryLockStore();
        const LocalSeqLock = createSequentialLockDecorator({ store: localStore });
        const processedOrder: number[] = [];

        class OrderQueue {
            @LocalSeqLock('order-queue')
            async processSlot1(): Promise<void> {
                processedOrder.push(1);
            }

            @LocalSeqLock('order-queue')
            async processSlot2(): Promise<void> {
                processedOrder.push(2);
            }

            @LocalSeqLock('order-queue')
            async processSlot3(): Promise<void> {
                processedOrder.push(3);
            }
        }

        const queue = new OrderQueue();
        await Promise.all([queue.processSlot1(), queue.processSlot2(), queue.processSlot3()]);

        expect(processedOrder).toStrictEqual([1, 2, 3]);
    });

    it('rejects with LockAcquireTimeoutError when the timeout elapses before the lock is free', async () => {
        expect.hasAssertions();

        const localStore = createInMemoryLockStore();
        const held = await localStore.acquire('payment-timeout', 'sequential');
        const LocalSeqLock = createSequentialLockDecorator({ store: localStore });

        class PaymentGateway {
            @LocalSeqLock({ key: 'payment-timeout', timeoutMs: 10 })
            async authorizePayment(amount: number): Promise<string> {
                return `authorized:${amount.toString()}`;
            }
        }

        const gateway = new PaymentGateway();
        await expect(gateway.authorizePayment(50)).rejects.toBeInstanceOf(LockAcquireTimeoutError);
        void held.release();
    });

    it('swallows errors thrown during lock release', async () => {
        expect.hasAssertions();

        const failingHandle = {
            key: 'order-release',
            mode: 'sequential' as const,
            release: jest.fn<() => Promise<void>>().mockRejectedValue(new Error('release failure')),
        };
        const mockStore = {
            acquire: jest.fn<() => Promise<typeof failingHandle>>().mockResolvedValue(failingHandle),
        } as unknown as LockStoreInterface;

        const LocalSeqLock = createSequentialLockDecorator({ store: mockStore });

        class InventoryService {
            @LocalSeqLock('order-release')
            async adjustStock(_sku: string, delta: number): Promise<number> {
                return delta;
            }
        }

        const svc = new InventoryService();
        await expect(svc.adjustStock('sku-1', 5)).resolves.toBe(5);
    });

    it('returns the original descriptor unchanged when applied to a non-function property', () => {
        expect.hasAssertions();

        const localStore = createInMemoryLockStore();
        const LocalSeqLock = createSequentialLockDecorator({ store: localStore });

        const descriptor: PropertyDescriptor = { get: (): string => 'catalog-value', configurable: true };
        const result = LocalSeqLock('catalog-prop')({} as object, 'catalogProp', descriptor);

        expect(result).toBe(descriptor);
    });

    it('second call times out while the first is running on the same key', async () => {
        expect.hasAssertions();

        const localStore = createInMemoryLockStore();
        const LocalSeqLock = createSequentialLockDecorator({ store: localStore });

        class WarehouseService {
            @LocalSeqLock('warehouse-dispatch')
            async dispatch(orderId: string): Promise<string> {
                await wait(50);

                return `dispatched:${orderId}`;
            }

            @LocalSeqLock({ key: 'warehouse-dispatch', timeoutMs: 10 })
            async dispatchFast(orderId: string): Promise<string> {
                return `fast:${orderId}`;
            }
        }

        const svc = new WarehouseService();
        const slowDispatch = svc.dispatch('order-A');
        await expect(svc.dispatchFast('order-B')).rejects.toBeInstanceOf(LockAcquireTimeoutError);
        await expect(slowDispatch).resolves.toBe('dispatched:order-A');
    });
});
