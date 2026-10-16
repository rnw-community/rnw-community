import { describe, expect, it } from '@jest/globals';

import { defaultAndroidPaymentDataRequest } from '../../@standard/android/request/android-payment-data-request';

import { getAndroidCallbackPaymentDataRequest } from './get-android-callback-payment-data-request.util';

import type { AndroidPaymentDataRequest } from '../../@standard/android/request/android-payment-data-request';
import type { PaymentItem } from '../../@standard/w3c/payment-item';
import type { PaymentShippingOption } from '../../@standard/w3c/payment-shipping-option';

const shippingRequest: AndroidPaymentDataRequest = {
    ...defaultAndroidPaymentDataRequest,
    shippingAddressRequired: true,
    transactionInfo: {
        currencyCode: 'USD',
        countryCode: 'US',
        totalPrice: '10.00',
        totalPriceLabel: 'Total',
        totalPriceStatus: 'FINAL',
    },
};

const displayItems: PaymentItem[] = [
    { label: 'Order', amount: { currency: 'USD', value: '10.00' } },
    { label: 'Tax', amount: { currency: 'USD', value: '0.80' }, pending: true },
];

const standardOption: PaymentShippingOption = {
    id: 'standard',
    label: 'Standard',
    amount: { currency: 'USD', value: '0.00' },
};
const expressOption: PaymentShippingOption = {
    id: 'express',
    label: 'Express',
    detail: 'Next business day',
    amount: { currency: 'USD', value: '5.00' },
};

describe('getAndroidCallbackPaymentDataRequest', () => {
    it('should keep the request untouched when the shipping address is not required', () => {
        expect.hasAssertions();

        const request = { ...shippingRequest, shippingAddressRequired: false };

        expect(
            getAndroidCallbackPaymentDataRequest(request, ['shippingaddresschange'], displayItems, [standardOption])
        ).toBe(request);
    });

    it('should keep the request untouched when no shipping listener is active', () => {
        expect.hasAssertions();

        expect(
            getAndroidCallbackPaymentDataRequest(
                shippingRequest,
                ['paymentmethodchange', 'couponcodechange'],
                displayItems,
                [standardOption]
            )
        ).toBe(shippingRequest);
    });

    it('should keep the request untouched when only the option listener is active without shipping options', () => {
        expect.hasAssertions();

        expect(getAndroidCallbackPaymentDataRequest(shippingRequest, ['shippingoptionchange'], displayItems, [])).toBe(
            shippingRequest
        );
    });

    it('should add the shipping address intent together with the mandatory authorization intent', () => {
        expect.hasAssertions();

        const request = getAndroidCallbackPaymentDataRequest(shippingRequest, ['shippingaddresschange'], displayItems, [
            standardOption,
        ]);

        expect(request.callbackIntents).toStrictEqual(['PAYMENT_AUTHORIZATION', 'SHIPPING_ADDRESS']);
        expect(request).not.toHaveProperty('shippingOptionRequired');
        expect(request).not.toHaveProperty('shippingOptionParameters');
        expect(request.transactionInfo?.displayItems).toStrictEqual([
            { label: 'Order', price: '10.00', status: 'FINAL', type: 'LINE_ITEM' },
            { label: 'Tax', price: '0.80', status: 'PENDING', type: 'LINE_ITEM' },
        ]);
        expect(request.transactionInfo?.totalPrice).toBe('10.00');
    });

    it('should add the shipping option intent and parameters selecting the last selected option', () => {
        expect.hasAssertions();

        const request = getAndroidCallbackPaymentDataRequest(
            shippingRequest,
            ['shippingaddresschange', 'shippingoptionchange'],
            [],
            [
                { ...standardOption, selected: true },
                { ...expressOption, selected: true },
            ]
        );

        expect(request.callbackIntents).toStrictEqual(['PAYMENT_AUTHORIZATION', 'SHIPPING_ADDRESS', 'SHIPPING_OPTION']);
        expect(request.shippingOptionRequired).toBe(true);
        expect(request.shippingOptionParameters).toStrictEqual({
            defaultSelectedOptionId: 'express',
            shippingOptions: [
                { id: 'standard', label: 'Standard' },
                { id: 'express', label: 'Express', description: 'Next business day' },
            ],
        });
        expect(request.transactionInfo).not.toHaveProperty('displayItems');
    });

    it('should leave a merchant-initiated request without transaction info while adding the callback intents', () => {
        expect.hasAssertions();

        const recurringRequest: AndroidPaymentDataRequest = {
            ...defaultAndroidPaymentDataRequest,
            shippingAddressRequired: true,
            recurringTransactionInfo: {
                currencyCode: 'USD',
                immediateTotalPrice: '10.00',
                recurrenceItems: [
                    {
                        label: 'Monthly',
                        price: '10.00',
                        priceStatus: 'FINAL',
                        recurrencePeriod: 'MONTH',
                        recurrencePeriodCount: 1,
                    },
                ],
            },
        };

        const request = getAndroidCallbackPaymentDataRequest(recurringRequest, ['shippingaddresschange'], displayItems, [
            standardOption,
        ]);

        expect(request.callbackIntents).toStrictEqual(['PAYMENT_AUTHORIZATION', 'SHIPPING_ADDRESS']);
        expect(request).not.toHaveProperty('transactionInfo');
        expect(request.recurringTransactionInfo).toStrictEqual(recurringRequest.recurringTransactionInfo);
    });

    it('should default to the first shipping option when none is selected', () => {
        expect.hasAssertions();

        const request = getAndroidCallbackPaymentDataRequest(shippingRequest, ['shippingoptionchange'], displayItems, [
            standardOption,
            expressOption,
        ]);

        expect(request.callbackIntents).toStrictEqual(['PAYMENT_AUTHORIZATION', 'SHIPPING_OPTION']);
        expect(request.shippingOptionParameters?.defaultSelectedOptionId).toBe('standard');
    });
});
