import { describe, expect, it, jest } from '@jest/globals';

import { IosPKPaymentMethodType } from '../../@standard/ios/enum/ios-pk-payment-method-type.enum';
import { PaymentMethodNameEnum } from '../../enum/payment-method-name.enum';
import { PaymentsError } from '../../error/payments.error';

import { IosPaymentResponse } from './ios-payment-response';

import type { IosPKPayment } from '../../@standard/ios/response/ios-pk-payment';

jest.mock('../native-payments/native-payments', () => ({
    NativePayments: {
        complete: jest.fn(),
    },
}));

jest.mock('react-native', () => ({
    Platform: {
        OS: 'ios',
    },
}));

describe('IosPaymentResponse', () => {
    const authorizedPayment: IosPKPayment = {
        billingContact: {
            name: {
                familyName: 'Appleseed',
                givenName: 'John',
                middleName: 'Q',
                namePrefix: '',
                nameSuffix: '',
                nickname: '',
            },
            postalAddress: {
                ISOCountryCode: 'US',
                city: 'Cupertino',
                country: 'United States',
                postalCode: '95014',
                state: 'CA',
                street: '1 Infinite Loop',
                subAdministrativeArea: 'Santa Clara',
                subLocality: 'Rancho Rinconada',
            },
        },
        shippingContact: {
            emailAddress: 'john.appleseed@example.com',
            name: {
                familyName: 'Appleseed',
                givenName: 'Jane',
                middleName: '',
                namePrefix: '',
                nameSuffix: '',
                nickname: '',
            },
            phoneNumber: { stringValue: '+1-555-555-5555' },
            postalAddress: {
                ISOCountryCode: 'DE',
                city: 'Berlin',
                country: 'Germany',
                postalCode: '10115',
                state: 'BE',
                street: 'Invalidenstrasse 1',
                subAdministrativeArea: 'Mitte',
                subLocality: 'Scheunenviertel',
            },
        },
        token: {
            paymentData: JSON.stringify({
                version: 'EC_v1',
                data: 'enHx9XCGOPE',
                signature: 'abcd1234',
                header: { ephemeralPublicKey: 'AbCdEf', publicKeyHash: 'gHiJkL', transactionId: 'txn01' },
            }),
            paymentMethod: {
                displayName: 'Visa 1234',
                network: 'Visa',
                type: IosPKPaymentMethodType.PKPaymentMethodTypeCredit,
            },
            transactionIdentifier: 'txn123456789',
        },
    };

    const createResponse = (payment: IosPKPayment): IosPaymentResponse =>
        new IosPaymentResponse('requestId', PaymentMethodNameEnum.ApplePay, JSON.stringify(payment));

    it('should parse the billing address of the authorized payment', () => {
        expect.hasAssertions();

        expect(createResponse(authorizedPayment).details.billingAddress).toStrictEqual({
            address1: '1 Infinite Loop',
            address2: 'Cupertino',
            address3: 'CA',
            administrativeArea: 'Santa Clara',
            countryCode: 'US',
            locality: 'Rancho Rinconada',
            postalCode: '95014',
            sortingCode: '',
        });
    });

    it('should parse the shipping address of the authorized payment', () => {
        expect.hasAssertions();

        expect(createResponse(authorizedPayment).details.shippingAddress).toStrictEqual({
            address1: 'Invalidenstrasse 1',
            address2: 'Berlin',
            address3: 'BE',
            administrativeArea: 'Mitte',
            countryCode: 'DE',
            locality: 'Scheunenviertel',
            postalCode: '10115',
            sortingCode: '',
        });
    });

    it('should parse the payer name, email and phone of the shipping contact', () => {
        expect.hasAssertions();

        const { details } = createResponse(authorizedPayment);

        expect(details.payerName).toBe('Appleseed,Jane');
        expect(details.payerEmail).toBe('john.appleseed@example.com');
        expect(details.payerPhone).toBe('+1-555-555-5555');
    });

    it('should parse the apple pay token of the authorized payment', () => {
        expect.hasAssertions();

        const { applePayToken } = createResponse(authorizedPayment).details;

        expect(applePayToken.transactionIdentifier).toBe('txn123456789');
        expect(applePayToken.paymentData.header.transactionId).toBe('txn01');
    });

    it('should fall back to empty values when no contact was requested', () => {
        expect.hasAssertions();

        const { details } = createResponse({ token: authorizedPayment.token });

        expect(details.billingAddress?.countryCode).toBe('');
        expect(details.shippingAddress?.countryCode).toBe('');
        expect(details.payerName).toBe('');
        expect(details.payerPhone).toBe('');
    });

    it('should throw a domain-specific error when constructed with malformed JSON', () => {
        expect.hasAssertions();

        const construct = (): IosPaymentResponse =>
            new IosPaymentResponse('requestId', PaymentMethodNameEnum.ApplePay, '...');

        expect(construct).toThrow(PaymentsError);
        expect(construct).not.toThrow(SyntaxError);
    });

    it('should throw a domain-specific error when the token payment data is not valid JSON', () => {
        expect.hasAssertions();

        const construct = (): IosPaymentResponse =>
            createResponse({
                token: { ...authorizedPayment.token, paymentData: '...' },
            });

        expect(construct).toThrow(PaymentsError);
        expect(construct).not.toThrow(SyntaxError);
    });
});
