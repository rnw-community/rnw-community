import { describe, expect, it, jest } from '@jest/globals';

import { wait } from '@rnw-community/shared';

import { LockAcquireTimeoutError } from '../../error/lock-acquire-timeout-error/lock-acquire-timeout.error';
import { createInMemoryLockStoreMock } from '../../store/create-in-memory-lock-store/create-in-memory-lock-store.mock';

import { createSequentialLockDecorator } from './create-sequential-lock-decorator';

import type { LockStoreInterface } from '../../interface/lock-store.interface';

const store = createInMemoryLockStoreMock();
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

        const localStore = createInMemoryLockStoreMock();
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

        const localStore = createInMemoryLockStoreMock();
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

        const localStore = createInMemoryLockStoreMock();
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

        const localStore = createInMemoryLockStoreMock();
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

        const localStore = createInMemoryLockStoreMock();
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

        const localStore = createInMemoryLockStoreMock();
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

        const localStore = createInMemoryLockStoreMock();
        const LocalSeqLock = createSequentialLockDecorator({ store: localStore });

        const descriptor: PropertyDescriptor = { get: (): string => 'catalog-value', configurable: true };
        const result = LocalSeqLock('catalog-prop')({} as object, 'catalogProp', descriptor);

        expect(result).toBe(descriptor);
    });

    it('second call times out while the first is running on the same key', async () => {
        expect.hasAssertions();

        const localStore = createInMemoryLockStoreMock();
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
