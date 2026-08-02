import { describe, expect, it, jest } from '@jest/globals';

import { AndroidPaymentMethodTokenizationType } from '../../@standard/android/enum/android-payment-method-tokenization-type.enum';
import { PaymentMethodNameEnum } from '../../enum/payment-method-name.enum';

import { AndroidPaymentResponse } from './android-payment-response';

import type { AndroidPaymentData } from '../../@standard/android/response/android-payment-data';

jest.mock('../native-payments/native-payments', () => ({
    NativePayments: {
        complete: jest.fn(),
    },
}));

jest.mock('react-native', () => ({
    Platform: {
        OS: 'android',
    },
}));

describe('AndroidPaymentResponse', () => {
    const paymentToken = JSON.stringify({
        protocolVersion: 'ECv2',
        signature: 'testSignature',
        signedMessage: JSON.stringify({
            encryptedMessage: 'testEncryptedMessage',
            ephemeralPublicKey: 'testEphemeralPublicKey',
            tag: 'testTag',
        }),
        intermediateSigningKey: {
            signatures: ['testSignature'],
            signedKey: JSON.stringify({ keyExpiration: '2024-01-01T00:00:00.000Z', keyValue: 'testKeyValue' }),
        },
    });

    const authorizedPayment: AndroidPaymentData = {
        apiVersion: 2,
        apiVersionMinor: 0,
        email: 'john.appleseed@example.com',
        paymentMethodData: {
            description: 'Visa 1234',
            type: 'CARD',
            info: {
                assuranceDetails: { accountVerified: true, cardHolderAuthenticated: true },
                cardDetails: '1234',
                cardNetwork: 'VISA',
                billingAddress: {
                    address1: '1 Infinite Loop',
                    address2: 'Suite 1',
                    address3: 'Building B',
                    administrativeArea: 'CA',
                    countryCode: 'US',
                    locality: 'Cupertino',
                    name: 'John Appleseed',
                    phoneNumber: '+1-555-555-5555',
                    postalCode: '95014',
                    sortingCode: '123',
                },
            },
            tokenizationData: { type: AndroidPaymentMethodTokenizationType.PAYMENT_GATEWAY, token: paymentToken },
        },
        shippingAddress: {
            address1: 'Invalidenstrasse 1',
            address2: 'Apt 2',
            address3: '',
            administrativeArea: 'BE',
            countryCode: 'DE',
            locality: 'Berlin',
            name: 'Jane Appleseed',
            phoneNumber: '+49-30-000000',
            postalCode: '10115',
            sortingCode: '',
        },
    };

    const createResponse = (payment: AndroidPaymentData): AndroidPaymentResponse =>
        new AndroidPaymentResponse('requestId', PaymentMethodNameEnum.AndroidPay, JSON.stringify(payment));

    it('should parse the billing address of the authorized payment', () => {
        expect.assertions(1);

        expect(createResponse(authorizedPayment).details.billingAddress).toStrictEqual({
            address1: '1 Infinite Loop',
            address2: 'Suite 1',
            address3: 'Building B',
            administrativeArea: 'CA',
            countryCode: 'US',
            locality: 'Cupertino',
            postalCode: '95014',
            sortingCode: '123',
        });
    });

    it('should parse the shipping address of the authorized payment', () => {
        expect.assertions(1);

        expect(createResponse(authorizedPayment).details.shippingAddress).toStrictEqual({
            address1: 'Invalidenstrasse 1',
            address2: 'Apt 2',
            address3: '',
            administrativeArea: 'BE',
            countryCode: 'DE',
            locality: 'Berlin',
            postalCode: '10115',
            sortingCode: '',
        });
    });

    it('should prefer the payer name and phone of the billing address', () => {
        expect.assertions(3);

        const { details } = createResponse(authorizedPayment);

        expect(details.payerName).toBe('John Appleseed');
        expect(details.payerPhone).toBe('+1-555-555-5555');
        expect(details.payerEmail).toBe('john.appleseed@example.com');
    });

    it('should take the payer name and phone from the shipping address without a billing address', () => {
        expect.assertions(3);

        const { info } = authorizedPayment.paymentMethodData;
        const { details } = createResponse({
            ...authorizedPayment,
            paymentMethodData: {
                ...authorizedPayment.paymentMethodData,
                info: { assuranceDetails: info.assuranceDetails, cardDetails: info.cardDetails, cardNetwork: 'VISA' },
            },
        });

        expect(details.payerName).toBe('Jane Appleseed');
        expect(details.payerPhone).toBe('+49-30-000000');
        expect(details.billingAddress?.countryCode).toBe('');
    });

    it('should parse the google pay token of the authorized payment', () => {
        expect.assertions(3);

        const { androidPayToken } = createResponse(authorizedPayment).details;

        expect(androidPayToken.protocolVersion).toBe('ECv2');
        expect(androidPayToken.signedMessage.tag).toBe('testTag');
        expect(androidPayToken.cardInfo.cardNetwork).toBe('VISA');
    });
});
