import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { IosPKPaymentMethodType } from '../../@standard/ios/enum/ios-pk-payment-method-type.enum';
import { PaymentComplete } from '../../enum/payment-complete.enum';
import { PaymentsErrorEnum } from '../../enum/payments-error.enum';
import { DOMException } from '../../error/dom.exception';
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

        it('should reject with an InvalidStateError DOMException if complete is called more than once', async () => {
            expect.hasAssertions();

            const paymentResponse = new PaymentResponse('testRequestId', 'testMethodName', mockDetails);

            jest.mocked(NativePayments.complete).mockResolvedValueOnce(undefined);
            await paymentResponse.complete(PaymentComplete.SUCCESS);

            await expect(paymentResponse.complete(PaymentComplete.SUCCESS)).rejects.toStrictEqual(
                new DOMException(PaymentsErrorEnum.InvalidStateError)
            );
            await expect(paymentResponse.complete(PaymentComplete.SUCCESS)).rejects.toBeInstanceOf(DOMException);
            await expect(paymentResponse.complete(PaymentComplete.SUCCESS)).rejects.toHaveProperty(
                'name',
                'InvalidStateError'
            );
        });
    });

    describe('retry', () => {
        it('should resolve with undefined when called', async () => {
            expect.assertions(1);

            const paymentResponse = new PaymentResponse('testRequestId', 'testMethodName', mockDetails);

            await expect(paymentResponse.retry()).resolves.toBeUndefined();
        });

        it('should reject with an InvalidStateError DOMException if retry is called after complete', async () => {
            expect.hasAssertions();

            const paymentResponse = new PaymentResponse('testRequestId', 'testMethodName', mockDetails);

            jest.mocked(NativePayments.complete).mockResolvedValueOnce(undefined);
            await paymentResponse.complete(PaymentComplete.SUCCESS);

            await expect(paymentResponse.retry()).rejects.toStrictEqual(new DOMException(PaymentsErrorEnum.InvalidStateError));
        });
    });
});
