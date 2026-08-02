import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

import { emptyFn, wait } from '@rnw-community/shared';

import { changeEventTimeoutMs } from '../../constant/change-event-timeout-ms';
import { PaymentsErrorEnum } from '../../enum/payments-error.enum';
import { DOMException } from '../../error/dom.exception';
import { PaymentMethodChangeEvent } from '../payment-method-change-event/payment-method-change-event';

import { ChangeEventDispatcher } from './change-event-dispatcher';

import type { PaymentDetailsUpdate } from '../../@standard/w3c/payment-details-update';
import type { PaymentRequestEventListener } from '../../type/payment-request-event-listener.type';
import type { PaymentRequestUpdateEvent } from '../payment-request-update-event/payment-request-update-event';

const detailsUpdate: PaymentDetailsUpdate = {
    total: { label: 'Total', amount: { currency: 'USD', value: '15.00' } },
};

const alwaysActive = (): boolean => true;

describe('ChangeEventDispatcher', () => {
    const warnMock = jest.spyOn(console, 'warn').mockImplementation(emptyFn);

    beforeEach(() => {
        jest.useFakeTimers();
        warnMock.mockClear();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should resolve to the details the listener answered with', async () => {
        expect.hasAssertions();

        const dispatcher = new ChangeEventDispatcher('shippingaddresschange', { requestId: 'id' }, alwaysActive);

        await expect(
            dispatcher.dispatch([
                event => {
                    event.updateWith(detailsUpdate);
                },
            ])
        ).resolves.toBe(detailsUpdate);
    });

    it('should resolve to null when no listener answered', async () => {
        expect.hasAssertions();

        const dispatcher = new ChangeEventDispatcher('couponcodechange', { requestId: 'id' }, alwaysActive);

        await expect(dispatcher.dispatch([emptyFn])).resolves.toBeNull();
    });

    it('should build a PaymentMethodChangeEvent for the paymentmethodchange type', async () => {
        expect.hasAssertions();

        const listener = jest.fn<(event: PaymentRequestUpdateEvent) => void>();
        const dispatcher = new ChangeEventDispatcher(
            'paymentmethodchange',
            { requestId: 'id', methodName: 'apple-pay', methodDetails: { network: 'Visa' } },
            alwaysActive
        );

        await dispatcher.dispatch([listener]);

        const [[event]] = listener.mock.calls;

        expect(event).toBeInstanceOf(PaymentMethodChangeEvent);
        expect((event as PaymentMethodChangeEvent).methodName).toBe('apple-pay');
    });

    it('should skip a listener removed while an earlier listener was awaited', async () => {
        expect.hasAssertions();

        const removedListener = jest.fn<(event: PaymentRequestUpdateEvent) => void>();
        const listeners: PaymentRequestEventListener[] = [
            async () => {
                listeners.splice(listeners.indexOf(removedListener), 1);

                await Promise.resolve();
            },
            removedListener,
        ];
        const dispatcher = new ChangeEventDispatcher('shippingoptionchange', { requestId: 'id' }, alwaysActive);

        await dispatcher.dispatch(listeners);

        expect(removedListener).not.toHaveBeenCalled();
    });

    it('should refuse an answer once the request is no longer active', async () => {
        expect.hasAssertions();

        let lateCallError: unknown = null;
        const dispatcher = new ChangeEventDispatcher('shippingaddresschange', { requestId: 'id' }, () => false);

        await dispatcher.dispatch([
            event => {
                try {
                    event.updateWith(detailsUpdate);
                } catch (error) {
                    lateCallError = error;
                }
            },
        ]);

        expect(lateCallError).toStrictEqual(new DOMException(PaymentsErrorEnum.InvalidStateError));
    });

    it('should answer with no change when the listener never settles its update', async () => {
        expect.hasAssertions();

        const dispatcher = new ChangeEventDispatcher('shippingaddresschange', { requestId: 'id' }, alwaysActive);
        const dispatched = dispatcher.dispatch([
            event => {
                event.updateWith(new Promise<PaymentDetailsUpdate>(emptyFn));
            },
        ]);

        await jest.advanceTimersByTimeAsync(changeEventTimeoutMs);

        await expect(dispatched).resolves.toBeNull();
    });

    it('should answer with no change when the listener itself never settles', async () => {
        expect.hasAssertions();

        const dispatcher = new ChangeEventDispatcher('shippingoptionchange', { requestId: 'id' }, alwaysActive);
        const dispatched = dispatcher.dispatch([
            async () => {
                await new Promise<void>(emptyFn);
            },
        ]);

        await jest.advanceTimersByTimeAsync(changeEventTimeoutMs);

        await expect(dispatched).resolves.toBeNull();
    });

    it('should share one timeout budget between the listener and its update', async () => {
        expect.hasAssertions();

        const dispatcher = new ChangeEventDispatcher('shippingaddresschange', { requestId: 'id' }, alwaysActive);
        const dispatched = dispatcher.dispatch([
            async event => {
                await wait(changeEventTimeoutMs / 2);

                event.updateWith(new Promise<PaymentDetailsUpdate>(emptyFn));
            },
        ]);

        await jest.advanceTimersByTimeAsync(changeEventTimeoutMs);

        await expect(dispatched).resolves.toBeNull();
    });

    it('should answer with no change as soon as a never settling listener is abandoned', async () => {
        expect.hasAssertions();

        const dispatcher = new ChangeEventDispatcher('couponcodechange', { requestId: 'id' }, alwaysActive);
        const dispatched = dispatcher.dispatch([
            async () => {
                await new Promise<void>(emptyFn);
            },
        ]);

        await jest.advanceTimersByTimeAsync(0);
        dispatcher.abandon();

        await expect(dispatched).resolves.toBeNull();
    });

    it('should answer with no change as soon as the dispatch is abandoned', async () => {
        expect.hasAssertions();

        const dispatcher = new ChangeEventDispatcher('shippingaddresschange', { requestId: 'id' }, alwaysActive);
        const dispatched = dispatcher.dispatch([
            event => {
                event.updateWith(new Promise<PaymentDetailsUpdate>(emptyFn));
            },
        ]);

        await jest.advanceTimersByTimeAsync(0);
        dispatcher.abandon();

        await expect(dispatched).resolves.toBeNull();
    });

    it('should reject when the answered update rejects', async () => {
        expect.hasAssertions();

        const dispatcher = new ChangeEventDispatcher('shippingaddresschange', { requestId: 'id' }, alwaysActive);

        await expect(
            dispatcher.dispatch([
                event => {
                    event.updateWith(Promise.reject(new Error('Rate lookup failed')));
                },
            ])
        ).rejects.toThrow(new Error('Rate lookup failed'));
    });
});
