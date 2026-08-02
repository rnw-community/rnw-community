import { describe, expect, it, jest } from '@jest/globals';

import { AndroidPaymentMethodTokenizationType } from '../../@standard/android/enum/android-payment-method-tokenization-type.enum';
import { emptyAndroidIntermediateSigningKey } from '../../@standard/android/response/android-intermediate-signing-key';
import { PaymentMethodNameEnum } from '../../enum/payment-method-name.enum';
import { PaymentsError } from '../../error/payments.error';

import { AndroidPaymentResponse } from './android-payment-response';

import type { AndroidFullAddress } from '../../@standard/android/response/android-full-address';
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

    const billingAddress: AndroidFullAddress = {
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
    };

    const shippingAddress: AndroidFullAddress = {
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
    };

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
                billingAddress,
            },
            tokenizationData: { type: AndroidPaymentMethodTokenizationType.PAYMENT_GATEWAY, token: paymentToken },
        },
        shippingAddress,
    };

    const createResponse = (payment: AndroidPaymentData): AndroidPaymentResponse =>
        new AndroidPaymentResponse('requestId', PaymentMethodNameEnum.AndroidPay, JSON.stringify(payment));

    it('should parse the billing address of the authorized payment', () => {
        expect.hasAssertions();

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
        expect.hasAssertions();

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
        expect.hasAssertions();

        const { details } = createResponse(authorizedPayment);

        expect(details.payerName).toBe('John Appleseed');
        expect(details.payerPhone).toBe('+1-555-555-5555');
        expect(details.payerEmail).toBe('john.appleseed@example.com');
    });

    it('should take the payer name and phone from the shipping address without a billing address', () => {
        expect.hasAssertions();

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
        expect.hasAssertions();

        const { androidPayToken } = createResponse(authorizedPayment).details;

        expect(androidPayToken.protocolVersion).toBe('ECv2');
        expect(androidPayToken.signedMessage.tag).toBe('testTag');
        expect(androidPayToken.cardInfo.cardNetwork).toBe('VISA');
    });

    it('should default the shipping address payer phone to an empty string when omitted', () => {
        expect.hasAssertions();

        const { info } = authorizedPayment.paymentMethodData;
        const { phoneNumber, ...shippingAddressWithoutPhone } = shippingAddress;
        const { details } = createResponse({
            ...authorizedPayment,
            paymentMethodData: {
                ...authorizedPayment.paymentMethodData,
                info: { assuranceDetails: info.assuranceDetails, cardDetails: info.cardDetails, cardNetwork: 'VISA' },
            },
            shippingAddress: shippingAddressWithoutPhone,
        });

        expect(details.payerPhone).toBe('');
    });

    it('should default the billing address payer phone to an empty string when omitted', () => {
        expect.hasAssertions();

        const { phoneNumber, ...billingAddressWithoutPhone } = billingAddress;
        const { details } = createResponse({
            ...authorizedPayment,
            paymentMethodData: {
                ...authorizedPayment.paymentMethodData,
                info: { ...authorizedPayment.paymentMethodData.info, billingAddress: billingAddressWithoutPhone },
            },
        });

        expect(details.payerPhone).toBe('');
    });

    it('should throw a domain-specific error when the tokenization data is missing a token', () => {
        expect.hasAssertions();

        const paymentWithoutToken: AndroidPaymentData = {
            ...authorizedPayment,
            paymentMethodData: {
                ...authorizedPayment.paymentMethodData,
                tokenizationData: { type: AndroidPaymentMethodTokenizationType.PAYMENT_GATEWAY },
            },
        };

        const construct = (): AndroidPaymentResponse => createResponse(paymentWithoutToken);

        expect(construct).toThrow(PaymentsError);
        expect(construct).not.toThrow(SyntaxError);
        expect(construct).toThrow(`Failed parsing PaymentRequest details`);
    });

    it('should throw a domain-specific error when constructed with malformed JSON', () => {
        expect.hasAssertions();

        const construct = (): AndroidPaymentResponse =>
            new AndroidPaymentResponse('requestId', PaymentMethodNameEnum.AndroidPay, '...');

        expect(construct).toThrow(PaymentsError);
        expect(construct).not.toThrow(SyntaxError);
    });

    it('should default the intermediate signing key when the token does not carry one', () => {
        expect.hasAssertions();

        const tokenWithoutIntermediateSigningKey = JSON.stringify({
            protocolVersion: 'ECv2',
            signature: 'testSignature',
            signedMessage: JSON.stringify({
                encryptedMessage: 'testEncryptedMessage',
                ephemeralPublicKey: 'testEphemeralPublicKey',
                tag: 'testTag',
            }),
        });

        const { details } = createResponse({
            ...authorizedPayment,
            paymentMethodData: {
                ...authorizedPayment.paymentMethodData,
                tokenizationData: {
                    type: AndroidPaymentMethodTokenizationType.PAYMENT_GATEWAY,
                    token: tokenWithoutIntermediateSigningKey,
                },
            },
        });

        expect(details.androidPayToken.intermediateSigningKey).toStrictEqual(emptyAndroidIntermediateSigningKey);
    });
});
