import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { IosPKPaymentMethodType } from '../../@standard/ios/enum/ios-pk-payment-method-type.enum.js';
import { PaymentComplete } from '../../enum/payment-complete.enum.js';
import { PaymentContactFieldEnum } from '../../enum/payment-contact-field.enum.js';
import { PaymentsErrorEnum } from '../../enum/payments-error.enum.js';
import { DOMException } from '../../error/dom.exception.js';
import { PaymentsError } from '../../error/payments.error.js';
import { NativePayments } from '../native-payments/native-payments.js';

import { PaymentResponse } from './payment-response.js';

import type { PaymentValidationErrors } from '../../@standard/w3c/payment-validation-errors.js';
import type { PaymentResponseDetailsInterface } from '../../interface/payment-response-details.interface.js';

jest.mock('../native-payments/native-payments', () => ({
    NativePayments: {
        complete: jest.fn(),
        retry: jest.fn(),
    },
}));

jest.mock('react-native', () => ({
    Platform: {
        OS: 'android',
    },
}));

const retryMock = jest.mocked(NativePayments.retry as NonNullable<typeof NativePayments.retry>);

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

    const mockDetailsWithPayerFields: PaymentResponseDetailsInterface = {
        ...mockDetails,
        payerEmail: 'payer@example.com',
        payerName: 'Payer Name',
        payerPhone: '+15550000000',
        shippingAddress: {
            address1: '123 Test St',
            address2: '',
            address3: '',
            administrativeArea: '',
            countryCode: 'US',
            locality: '',
            postalCode: '12345',
            sortingCode: '',
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('should correctly initialize properties', () => {
            expect.hasAssertions();

            const paymentResponse = new PaymentResponse('testRequestId', 'testMethodName', mockDetails);

            expect(paymentResponse.requestId).toBe('testRequestId');
            expect(paymentResponse.methodName).toBe('testMethodName');
            expect(paymentResponse.details).toBe(mockDetails);
            expect(paymentResponse.shippingOption).toBeNull();
        });

        it('should accept an explicit shippingOption', () => {
            expect.hasAssertions();

            const paymentResponse = new PaymentResponse('testRequestId', 'testMethodName', mockDetails, 'express');

            expect(paymentResponse.shippingOption).toBe('express');
        });
    });

    describe('complete', () => {
        it('should call NativePayments.complete with the correct result', async () => {
            expect.hasAssertions();

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

        it('should reject with an InvalidStateError DOMException if complete is called after retry', async () => {
            expect.hasAssertions();

            const paymentResponse = new PaymentResponse('testRequestId', 'testMethodName', mockDetails);

            retryMock.mockResolvedValueOnce(undefined);
            await paymentResponse.retry();

            await expect(paymentResponse.complete(PaymentComplete.SUCCESS)).rejects.toStrictEqual(
                new DOMException(PaymentsErrorEnum.InvalidStateError)
            );
            expect(NativePayments.complete).not.toHaveBeenCalled();
        });
    });

    describe('retry', () => {
        it('should resolve with undefined when NativePayments.retry resolves', async () => {
            expect.hasAssertions();

            const paymentResponse = new PaymentResponse('testRequestId', 'testMethodName', mockDetails);

            retryMock.mockResolvedValueOnce(undefined);

            await expect(paymentResponse.retry()).resolves.toBeUndefined();
        });

        it('should call NativePayments.retry with the requestId and an empty object when errorFields is omitted', async () => {
            expect.hasAssertions();

            const paymentResponse = new PaymentResponse('testRequestId', 'testMethodName', mockDetails);

            retryMock.mockResolvedValueOnce(undefined);
            await paymentResponse.retry();

            expect(retryMock).toHaveBeenCalledWith('testRequestId', {});
        });

        it('should forward the given errorFields to NativePayments.retry', async () => {
            expect.hasAssertions();

            const paymentResponse = new PaymentResponse('testRequestId', 'testMethodName', mockDetails);
            const errorFields: PaymentValidationErrors = {
                error: 'Please fix the highlighted fields',
                payer: { [PaymentContactFieldEnum.Email]: 'Invalid email' },
            };

            retryMock.mockResolvedValueOnce(undefined);
            await paymentResponse.retry(errorFields);

            expect(retryMock).toHaveBeenCalledWith('testRequestId', errorFields);
        });

        it('should reject with an InvalidStateError DOMException if retry is called after complete', async () => {
            expect.hasAssertions();

            const paymentResponse = new PaymentResponse('testRequestId', 'testMethodName', mockDetails);

            jest.mocked(NativePayments.complete).mockResolvedValueOnce(undefined);
            await paymentResponse.complete(PaymentComplete.SUCCESS);

            await expect(paymentResponse.retry()).rejects.toStrictEqual(new DOMException(PaymentsErrorEnum.InvalidStateError));
            expect(retryMock).not.toHaveBeenCalled();
        });

        it('should reject with an InvalidStateError DOMException if retry is called a second time', async () => {
            expect.hasAssertions();

            const paymentResponse = new PaymentResponse('testRequestId', 'testMethodName', mockDetails);

            retryMock.mockResolvedValueOnce(undefined);
            await paymentResponse.retry();

            await expect(paymentResponse.retry()).rejects.toStrictEqual(new DOMException(PaymentsErrorEnum.InvalidStateError));
            expect(retryMock).toHaveBeenCalledTimes(1);
        });

        it('should reject with a NotSupportedError DOMException when NativePayments.retry is unavailable', async () => {
            expect.hasAssertions();

            const nativePayments = NativePayments as { retry?: typeof NativePayments.retry };
            nativePayments.retry = void 0;

            const paymentResponse = new PaymentResponse('testRequestId', 'testMethodName', mockDetails);

            try {
                await expect(paymentResponse.retry()).rejects.toStrictEqual(
                    new DOMException(PaymentsErrorEnum.NotSupportedError)
                );
            } finally {
                nativePayments.retry = retryMock;
            }
        });

        it('should reject with a PaymentsError when NativePayments.retry rejects', async () => {
            expect.hasAssertions();

            const paymentResponse = new PaymentResponse('testRequestId', 'testMethodName', mockDetails);

            retryMock.mockRejectedValueOnce(new Error('native failure'));

            await expect(paymentResponse.retry()).rejects.toStrictEqual(new PaymentsError('Failed retrying PaymentRequest'));
        });
    });

    describe('toJSON', () => {
        it('should serialize requestId, methodName, details and shippingOption', () => {
            expect.hasAssertions();

            const paymentResponse = new PaymentResponse('testRequestId', 'testMethodName', mockDetails, 'express');

            expect(paymentResponse.toJSON()).toStrictEqual({
                requestId: 'testRequestId',
                methodName: 'testMethodName',
                details: mockDetails,
                shippingAddress: null,
                shippingOption: 'express',
                payerEmail: null,
                payerName: null,
                payerPhone: null,
            });
        });

        it('should surface payer and shipping fields present on details', () => {
            expect.hasAssertions();

            const paymentResponse = new PaymentResponse('testRequestId', 'testMethodName', mockDetailsWithPayerFields);

            expect(paymentResponse.toJSON()).toStrictEqual({
                requestId: 'testRequestId',
                methodName: 'testMethodName',
                details: mockDetailsWithPayerFields,
                shippingAddress: mockDetailsWithPayerFields.shippingAddress,
                shippingOption: null,
                payerEmail: 'payer@example.com',
                payerName: 'Payer Name',
                payerPhone: '+15550000000',
            });
        });

        it('should round-trip through JSON.stringify', () => {
            expect.hasAssertions();

            const paymentResponse = new PaymentResponse('testRequestId', 'testMethodName', mockDetailsWithPayerFields, 'express');

            expect(JSON.parse(JSON.stringify(paymentResponse))).toStrictEqual(paymentResponse.toJSON());
        });
    });
});
