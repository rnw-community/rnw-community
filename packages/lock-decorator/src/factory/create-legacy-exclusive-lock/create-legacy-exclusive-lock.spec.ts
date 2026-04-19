import { describe, expect, it, jest } from '@jest/globals';

import { LockBusyError } from '../../error/lock-busy-error/lock-busy.error';
import { createInMemoryLockStore } from '../../store/create-in-memory-lock-store/create-in-memory-lock-store';

import { createLegacyExclusiveLock } from './create-legacy-exclusive-lock';

import type { LockStoreInterface } from '../../interface/lock-store.interface';

const store = createInMemoryLockStore();
const ExclusiveLock = createLegacyExclusiveLock({ store });

class PaymentService {
    @ExclusiveLock('capture-payment')
    async capturePayment(orderId: string, amount: number): Promise<{ readonly orderId: string; readonly captured: number }> {
        return { orderId, captured: amount };
    }

    @ExclusiveLock<readonly [string]>(args => `refund:${args[0]}`)
    async refundPayment(orderId: string): Promise<{ readonly orderId: string; readonly refunded: boolean }> {
        return { orderId, refunded: true };
    }

    @ExclusiveLock<readonly [string]>({ key: args => `status:${args[0]}` })
    async getPaymentStatus(orderId: string): Promise<string> {
        return `status:${orderId}`;
    }

    // @ts-expect-error — sync method intentionally violates the Promise-returning contract; runtime guard catches it
    @ExclusiveLock('validate-card')
    syncValidateCard(cardNumber: string): boolean {
        return cardNumber.length === 16;
    }
}

describe('createLegacyExclusiveLock', () => {
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
        const LocalExLock = createLegacyExclusiveLock({ store: localStore });

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

    it('rejects when the decorated method does not return a Promise', async () => {
        expect.hasAssertions();

        const service = new PaymentService();
        await expect((service.syncValidateCard as unknown as (card: string) => Promise<unknown>)('1234567890123456')).rejects.toThrow(
            'Locked method must return a Promise'
        );
    });

    it('throws LockBusyError when the lock is already held', async () => {
        expect.hasAssertions();

        const localStore = createInMemoryLockStore();
        const LocalExLock = createLegacyExclusiveLock({ store: localStore });

        let releaseHeld!: () => void;
        const holdUntilReleased = new Promise<void>(resolve => { releaseHeld = resolve; });

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
        const LocalExLock = createLegacyExclusiveLock({ store: localStore });

        class SettlementService {
            @LocalExLock<readonly [string]>(args => `settle:${args[0]}`)
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
        const LocalExLock = createLegacyExclusiveLock({ store: localStore });

        class AuthorizationService {
            @LocalExLock<readonly [string]>({ key: args => `auth:${args[0]}` })
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
        const LocalExLock = createLegacyExclusiveLock({ store: localStore });

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

        const LocalExLock = createLegacyExclusiveLock({ store: mockStore });

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
        const LocalExLock = createLegacyExclusiveLock({ store: localStore });

        const descriptor: PropertyDescriptor = { get: (): string => 'payment-value', configurable: true };
        const result = LocalExLock('payment-prop')({} as object, 'paymentProp', descriptor);

        expect(result).toBe(descriptor);
    });
});
