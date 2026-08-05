import { describe, expect, it, jest } from '@jest/globals';

import { PaymentsErrorEnum } from '../../enum/payments-error.enum.js';
import { DOMException } from '../../error/dom.exception.js';

import { PaymentRequestUpdateEvent } from './payment-request-update-event.js';

import type { PaymentDetailsUpdate } from '../../@standard/w3c/payment-details-update.js';

const detailsUpdate: PaymentDetailsUpdate = {
    total: { label: 'Total', amount: { currency: 'USD', value: '15.00' } },
};

const createUpdateHandler = (): jest.Mock<(update: Promise<PaymentDetailsUpdate>) => void> =>
    jest.fn<(update: Promise<PaymentDetailsUpdate>) => void>();

describe('PaymentRequestUpdateEvent', () => {
    it('should expose the event type it was created for', () => {
        expect.hasAssertions();

        expect(new PaymentRequestUpdateEvent('shippingaddresschange', createUpdateHandler()).type).toBe(
            'shippingaddresschange'
        );
    });

    it('should hand the details passed to updateWith to the request as a promise', async () => {
        expect.hasAssertions();

        const onUpdateWith = createUpdateHandler();
        new PaymentRequestUpdateEvent('shippingaddresschange', onUpdateWith).updateWith(detailsUpdate);

        const [[update]] = onUpdateWith.mock.calls;

        await expect(update).resolves.toBe(detailsUpdate);
    });

    it('should hand the promise passed to updateWith to the request', async () => {
        expect.hasAssertions();

        const onUpdateWith = createUpdateHandler();
        new PaymentRequestUpdateEvent('shippingoptionchange', onUpdateWith).updateWith(Promise.resolve(detailsUpdate));

        const [[update]] = onUpdateWith.mock.calls;

        await expect(update).resolves.toBe(detailsUpdate);
    });

    it('should throw InvalidStateError when updateWith is called twice', () => {
        expect.hasAssertions();

        const event = new PaymentRequestUpdateEvent('shippingaddresschange', createUpdateHandler());
        event.updateWith(detailsUpdate);

        expect(() => {
            event.updateWith(detailsUpdate);
        }).toThrow(new DOMException(PaymentsErrorEnum.InvalidStateError));
    });

    it('should stay unanswered when the request refuses the update', () => {
        expect.hasAssertions();

        const event = new PaymentRequestUpdateEvent('couponcodechange', () => {
            throw new DOMException(PaymentsErrorEnum.InvalidStateError);
        });

        expect(() => {
            event.updateWith(detailsUpdate);
        }).toThrow(new DOMException(PaymentsErrorEnum.InvalidStateError));
        expect(event.isAnswered).toBe(false);
    });

    it('should report whether the event was already answered', () => {
        expect.hasAssertions();

        const event = new PaymentRequestUpdateEvent('shippingaddresschange', createUpdateHandler());

        expect(event.isAnswered).toBe(false);

        event.updateWith(detailsUpdate);

        expect(event.isAnswered).toBe(true);
    });
});
