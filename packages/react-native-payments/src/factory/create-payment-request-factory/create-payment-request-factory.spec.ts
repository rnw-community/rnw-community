import { describe, expect, it, jest } from '@jest/globals';

import { PaymentRequest } from '../../class/payment-request/payment-request';
import { ConstructorError } from '../../error/constructor.error';
import { createGooglePayMethodData } from '../create-google-pay-method-data/create-google-pay-method-data';

import { createPaymentRequestFactory } from './create-payment-request-factory';

import type { PaymentRequestFactoryConfig } from '../../interface/payment-request-factory-config.interface';

jest.mock('../../class/native-payments/native-payments', () => ({
    NativePayments: {},
}));

jest.mock('react-native', () => ({
    Platform: {
        OS: 'android',
    },
}));

describe('createPaymentRequestFactory', () => {
    const methodData = [
        createGooglePayMethodData({
            countryCode: 'US',
            currencyCode: 'USD',
            gatewayConfig: { gateway: 'example', gatewayMerchantId: 'exampleGatewayMerchantId' },
        }),
    ];
    const baseItem = { label: 'Subscription', amount: { currency: 'USD', value: '10.00' } };
    const checkoutItem = { label: 'Gift card', amount: { currency: 'USD', value: '5.00' } };
    const shippingOption = { id: 'standard', label: 'Standard', amount: { currency: 'USD', value: '0.00' }, selected: true };
    const total = { label: 'Total', amount: { currency: 'USD', value: '15.00' } };
    const config: PaymentRequestFactoryConfig = {
        methodData,
        details: { displayItems: [baseItem], shippingOptions: [shippingOption] },
    };

    it('should build a PaymentRequest from the shared method data and the base details merged with the checkout details', () => {
        expect.hasAssertions();

        const request = createPaymentRequestFactory(config)({ total });

        expect(request).toBeInstanceOf(PaymentRequest);
        expect(request.methodData).toStrictEqual(methodData);
        expect(request.details).toStrictEqual({
            displayItems: [baseItem],
            shippingOptions: [shippingOption],
            total,
            id: request.id,
        });
    });

    it('should replace a base details key with the checkout value instead of merging it', () => {
        expect.hasAssertions();

        const request = createPaymentRequestFactory(config)({ total, displayItems: [checkoutItem] });

        expect(request.details.displayItems).toStrictEqual([checkoutItem]);
        expect(request.details.shippingOptions).toStrictEqual([shippingOption]);
    });

    it('should clear a base details key the checkout details set to undefined', () => {
        expect.hasAssertions();

        const request = createPaymentRequestFactory(config)({ total, shippingOptions: undefined });

        expect(request.details.shippingOptions).toBeUndefined();
    });

    it('should build a fresh request with its own id and method data array on every call', () => {
        expect.hasAssertions();

        const createRequest = createPaymentRequestFactory(config);
        const firstRequest = createRequest({ total });
        const secondRequest = createRequest({ total });

        expect(secondRequest).not.toBe(firstRequest);
        expect(secondRequest.id).not.toBe(firstRequest.id);
        expect(secondRequest.methodData).not.toBe(methodData);
        expect(config.details).not.toHaveProperty('id');
    });

    it('should build a request without base details', () => {
        expect.hasAssertions();

        const request = createPaymentRequestFactory({ methodData })({ total, id: 'checkout-1' });

        expect(request.details).toStrictEqual({ total, id: 'checkout-1' });
    });

    it('should validate every built request like the PaymentRequest constructor', () => {
        expect.hasAssertions();

        const createRequest = createPaymentRequestFactory(config);

        expect(() => createRequest({ total: { label: 'Total', amount: { currency: 'USD', value: '-1.00' } } })).toThrow(
            ConstructorError
        );
    });
});
