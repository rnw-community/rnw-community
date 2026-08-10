import { describe, expect, it, jest } from '@jest/globals';

import { PaymentRequestUpdateEvent } from '../payment-request-update-event/payment-request-update-event';

import { PaymentMethodChangeEvent } from './payment-method-change-event';

import type { PaymentDetailsUpdate } from '../../@standard/w3c/payment-details-update';

describe('PaymentMethodChangeEvent', () => {
    it('should expose the changed method name and details', () => {
        expect.hasAssertions();

        const event = new PaymentMethodChangeEvent('https://apple.com/apple-pay', { network: 'Visa' }, jest.fn());

        expect(event.methodName).toBe('https://apple.com/apple-pay');
        expect(event.methodDetails).toStrictEqual({ network: 'Visa' });
        expect(event.type).toBe('paymentmethodchange');
    });

    it('should inherit the updateWith contract', async () => {
        expect.hasAssertions();

        const onUpdateWith = jest.fn<(update: Promise<PaymentDetailsUpdate>) => void>();
        const event = new PaymentMethodChangeEvent('https://apple.com/apple-pay', null, onUpdateWith);
        event.updateWith({ error: 'Card is not supported' });

        const [[update]] = onUpdateWith.mock.calls;

        expect(event).toBeInstanceOf(PaymentRequestUpdateEvent);
        await expect(update).resolves.toStrictEqual({ error: 'Card is not supported' });
    });
});
