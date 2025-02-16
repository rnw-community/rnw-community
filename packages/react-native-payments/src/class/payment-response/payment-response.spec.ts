import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { IosPKPaymentMethodType } from '../../@standard/ios/enum/ios-pk-payment-method-type.enum';
import { PaymentComplete } from '../../enum/payment-complete.enum';
import { NativePayments } from '../native-payments/native-payments';

import { PaymentResponse } from './payment-response';

import type { PaymentResponseDetailsInterface } from '../../interface/payment-response-details.interface';

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

// eslint-disable-next-line max-lines-per-function
describe('PaymentResponse', () => {
    const mockDetails: PaymentResponseDetailsInterface = {
        androidPayToken: {
            cardInfo: {
                assuranceDetails: {
                    accountVerified: true,
                    cardHolderAuthenticated: false,
                },
                cardDetails: '****1234',
                cardNetwork: 'VISA',
                billingAddress: {
                    address1: '123 Test St',
                    locality: 'Test City',
                    administrativeArea: 'CA',
                    sortingCode: '123',
                    countryCode: 'US',
                    name: 'Test Name',
                    postalCode: '12345',
                },
            },
            intermediateSigningKey: {
                signedKey: {
                    keyExpiration: '',
                    keyValue: 'mockSignedKeyValue',
                },
                signatures: 'mockSignature1',
            },
            protocolVersion: 'EC_v1',
            rawToken: 'mockRawToken',
            signature: 'mockSignature',
            signedMessage: {
                encryptedMessage: 'mockEncryptedMessage',
                ephemeralPublicKey: 'mockEphemeralKey',
                tag: 'mockTag',
            },
        },
        applePayToken: {
            paymentData: {
                version: 'EC_v1',
                data: 'mockData',
                signature: 'mockSignature',
                header: {
                    ephemeralPublicKey: 'mockEphemeralPublicKey',
                    publicKeyHash: 'mockPublicKeyHash',
                    transactionId: 'mockTransactionId',
                    wrappedKey: 'mockWrappedKey',
                },
            },
            paymentMethod: {
                displayName: 'Test Card',
                network: 'Visa',
                type: IosPKPaymentMethodType.PKPaymentMethodTypeCredit,
            },
            transactionIdentifier: 'testTransactionId',
        },
    };

    // eslint-disable-next-line jest/no-hooks
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('should correctly initialize properties', () => {
            expect.assertions(3);

            const paymentResponse = new PaymentResponse('testRequestId', 'testMethodName', mockDetails);

            expect(paymentResponse.requestId).toBe('testRequestId');
            expect(paymentResponse.methodName).toBe('testMethodName');
            expect(paymentResponse.details).toBe(mockDetails);
        });
    });

    describe('complete', () => {
        it('should call NativePayments.complete with the correct result', async () => {
            expect.assertions(1);

            const paymentResponse = new PaymentResponse('testRequestId', 'testMethodName', mockDetails);

            jest.mocked(NativePayments.complete).mockResolvedValueOnce(undefined);
            await paymentResponse.complete(PaymentComplete.SUCCESS);

            expect(NativePayments.complete).toHaveBeenCalledWith(PaymentComplete.SUCCESS);
        });

        it('should throw an error if complete is called more than once', async () => {
            expect.assertions(1);

            const paymentResponse = new PaymentResponse('testRequestId', 'testMethodName', mockDetails);

            jest.mocked(NativePayments.complete).mockResolvedValueOnce(undefined);
            await paymentResponse.complete(PaymentComplete.SUCCESS);

            await expect(paymentResponse.complete(PaymentComplete.SUCCESS)).rejects.toThrow(new Error('InvalidStateError'));
        });
    });

    describe('retry', () => {
        it('should resolve with undefined when called', async () => {
            expect.assertions(1);

            const paymentResponse = new PaymentResponse('testRequestId', 'testMethodName', mockDetails);

            await expect(paymentResponse.retry()).resolves.toBeUndefined();
        });

        it('should throw an error if retry is called after complete', async () => {
            expect.assertions(1);

            const paymentResponse = new PaymentResponse('testRequestId', 'testMethodName', mockDetails);

            jest.mocked(NativePayments.complete).mockResolvedValueOnce(undefined);
            await paymentResponse.complete(PaymentComplete.SUCCESS);

            await expect(paymentResponse.retry()).rejects.toThrow('InvalidStateError');
        });
    });
});
