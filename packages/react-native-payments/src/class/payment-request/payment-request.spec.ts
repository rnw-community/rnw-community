/* eslint-disable max-lines */
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Platform } from 'react-native';

import { IosPKPaymentMethodType } from '../../@standard/ios/enum/ios-pk-payment-method-type.enum';
import { EnvironmentEnum } from '../../enum/environment.enum';
import { PaymentMethodNameEnum } from '../../enum/payment-method-name.enum';
import { PaymentsErrorEnum } from '../../enum/payments-error.enum';
import { SupportedNetworkEnum } from '../../enum/supported-networks.enum';
import { ConstructorError } from '../../error/constructor.error';
import { DOMException } from '../../error/dom.exception';
import { PaymentsError } from '../../error/payments.error';
import { NativePayments } from '../native-payments/native-payments';

import { PaymentRequest } from './payment-request';

import type { AndroidPaymentMethodDataInterface } from '../../@standard/android/mapping/android-payment-method-data.interface';
import type { AndroidPaymentData } from '../../@standard/android/response/android-payment-data';
import type { IosPaymentMethodDataInterface } from '../../@standard/ios/mapping/ios-payment-method-data.interface';
import type { IosPKPayment } from '../../@standard/ios/response/ios-pk-payment';
import type { PaymentDetailsInit } from '../../@standard/w3c/payment-details-init';
import type { PaymentItem } from '../../@standard/w3c/payment-item';
import type { PaymentMethodData } from '../../@standard/w3c/payment-method-data';

jest.mock('../native-payments/native-payments', () => ({
    NativePayments: {
        canMakePayments: jest.fn(),
        show: jest.fn(),
        abort: jest.fn(),
    },
}));

jest.mock('react-native', () => ({
    Platform: {
        OS: 'android',
    },
}));

// eslint-disable-next-line max-lines-per-function
describe('PaymentRequest', () => {
    const paymentDetails = {
        total: {
            label: 'Total',
            amount: { currency: 'USD', value: '10.00' },
        },
    };

    // eslint-disable-next-line jest/no-hooks
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // eslint-disable-next-line max-lines-per-function
    describe('validation', () => {
        const methodData: AndroidPaymentMethodDataInterface = {
            supportedMethods: PaymentMethodNameEnum.AndroidPay,
            data: {
                currencyCode: 'USD',
                countryCode: 'US',
                supportedNetworks: [SupportedNetworkEnum.Visa, SupportedNetworkEnum.Mastercard],
                environment: EnvironmentEnum.TEST,
                gatewayConfig: {
                    gateway: 'exampleGateway',
                    gatewayMerchantId: 'exampleMerchantId',
                },
            },
        };

        it('should throw when not payment methods passed', () => {
            expect.assertions(2);

            expect(() => new PaymentRequest([], {} as unknown as PaymentDetailsInit)).toThrow(
                new PaymentsError(`Failed to construct 'PaymentRequest':  At least one payment method is required`)
            );

            expect(
                () => new PaymentRequest(undefined as unknown as PaymentMethodData[], {} as unknown as PaymentDetailsInit)
            ).toThrow(new PaymentsError(`Failed to construct 'PaymentRequest':  At least one payment method is required`));
        });

        describe(`payment details total`, () => {
            it('should throw when total is not defined', () => {
                expect.assertions(1);

                const invalidPaymentDetails = {} as unknown as PaymentDetailsInit;

                expect(() => new PaymentRequest([methodData], invalidPaymentDetails)).toThrow(
                    new PaymentsError(`Failed to construct 'PaymentRequest':  required member total is undefined.`)
                );
            });

            it('should throw when total.amount is not defined', () => {
                expect.assertions(1);

                const invalidPaymentDetails = {
                    total: {
                        label: 'Total',
                    },
                } as unknown as PaymentDetailsInit;

                expect(() => new PaymentRequest([methodData], invalidPaymentDetails)).toThrow(
                    new PaymentsError(`Failed to construct 'PaymentRequest':  Missing required member(s): amount, label.`)
                );
            });

            it('should throw when total.amount.value is not defined', () => {
                expect.assertions(1);

                const invalidPaymentDetails = {
                    total: {
                        label: 'Total',
                        amount: {},
                    },
                } as unknown as PaymentDetailsInit;

                expect(() => new PaymentRequest([methodData], invalidPaymentDetails)).toThrow(
                    new PaymentsError(`Failed to construct 'PaymentRequest':  Missing required member(s): amount, label.`)
                );
            });

            it('should throw when total.amount.value is not monetary', () => {
                expect.assertions(1);

                const invalidPaymentDetails = {
                    total: {
                        label: 'Total',
                        amount: {
                            currency: 'USD',
                            value: true,
                        },
                    },
                } as unknown as PaymentDetailsInit;

                expect(() => new PaymentRequest([methodData], invalidPaymentDetails)).toThrow(
                    new PaymentsError(`Failed to construct 'PaymentRequest':  'true' is not a valid amount format for total`)
                );
            });

            it('should throw when total.amount.value is negative', () => {
                expect.assertions(1);

                const invalidPaymentDetails = {
                    total: {
                        label: 'Total',
                        amount: {
                            currency: 'USD',
                            value: '-10.00',
                        },
                    },
                };

                expect(() => new PaymentRequest([methodData], invalidPaymentDetails)).toThrow(
                    new PaymentsError(`Failed to construct 'PaymentRequest':  Total amount value should be non-negative`)
                );
            });

            it('should throw when total.amount.value ends with dot', () => {
                expect.assertions(1);

                const invalidPaymentDetails = {
                    total: {
                        label: 'Total',
                        amount: {
                            currency: 'USD',
                            value: '10.00.',
                        },
                    },
                };

                expect(() => new PaymentRequest([methodData], invalidPaymentDetails)).toThrow(
                    new PaymentsError(
                        `Failed to construct 'PaymentRequest':  '10.00.' is not a valid amount format for total`
                    )
                );
            });
        });

        describe(`payment details displayItems`, () => {
            const paymentDetailsWithTotal: PaymentDetailsInit = {
                total: {
                    label: 'Total',
                    amount: {
                        currency: 'USD',
                        value: '10.00',
                    },
                },
            };

            it('should NOT throw when displayItems is not defined or empty', () => {
                expect.assertions(2);

                expect(() => new PaymentRequest([methodData], paymentDetailsWithTotal)).not.toThrow();
                expect(
                    () => new PaymentRequest([methodData], { ...paymentDetailsWithTotal, displayItems: [] })
                ).not.toThrow();
            });

            it('should throw when displayItems item has in proper shape', () => {
                expect.assertions(3);

                expect(
                    () =>
                        new PaymentRequest([methodData], {
                            ...paymentDetailsWithTotal,
                            displayItems: [undefined as unknown as PaymentItem],
                        })
                ).toThrow(new ConstructorError(`required member value is undefined.`));

                expect(
                    () =>
                        new PaymentRequest([methodData], {
                            ...paymentDetailsWithTotal,
                            displayItems: [{} as unknown as PaymentItem],
                        })
                ).toThrow(new ConstructorError(`required member value is undefined.`));

                expect(
                    () =>
                        new PaymentRequest([methodData], {
                            ...paymentDetailsWithTotal,
                            displayItems: [{ amount: {} } as unknown as PaymentItem],
                        })
                ).toThrow(new ConstructorError(`required member value is undefined.`));
            });

            it('should throw when displayItems item.amount.value is not monetary', () => {
                expect.assertions(1);

                expect(
                    () =>
                        new PaymentRequest([methodData], {
                            ...paymentDetailsWithTotal,
                            displayItems: [{ amount: { currency: 'USD', value: true } } as unknown as PaymentItem],
                        })
                ).toThrow(new ConstructorError(`'true' is not a valid amount format for display items`));
            });
        });
    });

    // eslint-disable-next-line max-lines-per-function,max-statements
    describe('PaymentRequest on Android', () => {
        const androidMethodData: AndroidPaymentMethodDataInterface = {
            supportedMethods: PaymentMethodNameEnum.AndroidPay,
            data: {
                currencyCode: 'USD',
                countryCode: 'US',
                supportedNetworks: [SupportedNetworkEnum.Visa, SupportedNetworkEnum.Mastercard],
                environment: EnvironmentEnum.TEST,
                gatewayConfig: {
                    gateway: 'exampleGateway',
                    gatewayMerchantId: 'exampleMerchantId',
                },
            },
        };

        // eslint-disable-next-line jest/no-hooks
        beforeEach(() => {
            Platform.OS = 'android';
        });

        it('should initialize with the correct id', () => {
            expect.assertions(2);

            const request = new PaymentRequest([androidMethodData], paymentDetails);

            expect(request.id).toBeDefined();
            expect(request.state).toBe('created');
        });

        it('should throw when `canMakePayment` is called in invalid state', async () => {
            expect.assertions(1);

            const request = new PaymentRequest([androidMethodData], paymentDetails);
            request.state = 'closed';

            await expect(request.canMakePayment()).rejects.toThrow(new DOMException(PaymentsErrorEnum.InvalidStateError));
        });

        it('should throw when NativePayments.show rejects', async () => {
            expect.assertions(2);

            const request = new PaymentRequest([androidMethodData], paymentDetails);
            request.state = 'created';
            jest.mocked(NativePayments.show).mockRejectedValue(new DOMException(PaymentsErrorEnum.NotAllowedError));

            await expect(request.show()).rejects.toThrow(new DOMException(PaymentsErrorEnum.NotAllowedError));
            expect(NativePayments.show).toHaveBeenCalledWith(expect.any(String), expect.any(Object));
        });

        it('should return true from `canMakePayment` when valid', async () => {
            expect.assertions(2);

            const request = new PaymentRequest([androidMethodData], paymentDetails);
            jest.mocked(NativePayments.canMakePayments).mockResolvedValue(true);

            const result = await request.canMakePayment();

            expect(NativePayments.canMakePayments).toHaveBeenCalledWith(expect.any(String));
            expect(result).toBe(true);
        });

        it('should throw when `show` is called in invalid state', async () => {
            expect.assertions(1);

            const request = new PaymentRequest([androidMethodData], paymentDetails);
            request.state = 'closed';

            await expect(request.show()).rejects.toThrow(new DOMException(PaymentsErrorEnum.InvalidStateError));
        });

        it(`should handle 'examplePaymentMethodToken' tokenization type`, async () => {
            expect.assertions(3);

            jest.mocked(NativePayments.show).mockResolvedValue(
                JSON.stringify({
                    apiVersion: 2,
                    apiVersionMinor: 0,
                    email: 'test@example.com',
                    paymentMethodData: {
                        info: {},
                        tokenizationData: {
                            type: 'PAYMENT_GATEWAY',
                            token: 'examplePaymentMethodToken',
                        },
                    },
                })
            );

            const request = new PaymentRequest([androidMethodData], paymentDetails);
            request.state = 'created';
            const result = await request.show();

            expect(NativePayments.show).toHaveBeenCalledWith(expect.any(String), expect.any(Object));
            expect(result).toBeDefined();
            expect(request.state).toBe('interactive');
        });

        it('should throw when `NativePayments.show` returns invalid data', async () => {
            expect.assertions(1);

            jest.mocked(NativePayments.show).mockResolvedValue(`...`);
            const expectedError = new PaymentsError(
                `Failed parsing PaymentRequest details: Unexpected token '.', "..." is not valid JSON`
            );

            const request = new PaymentRequest([androidMethodData], paymentDetails);
            request.state = 'created';

            await expect(request.show()).rejects.toThrow(expectedError);
        });

        it('should call NativePayments.show and resolve correctly', async () => {
            expect.assertions(3);

            const request = new PaymentRequest([androidMethodData], paymentDetails);
            request.state = 'created';
            jest.mocked(NativePayments.show).mockResolvedValue(
                JSON.stringify({
                    apiVersion: 2,
                    apiVersionMinor: 0,
                    email: 'test@example.com',
                    paymentMethodData: {
                        info: {
                            billingAddress: {
                                countryCode: 'US',
                                name: 'John Doe',
                                phoneNumber: '+1234567890',
                                postalCode: '12345',
                                address1: '123 Main St',
                                address2: 'Suite 1',
                                address3: 'Building B',
                                administrativeArea: 'CA',
                                locality: 'Mountain View',
                                sortingCode: '123',
                            },
                            cardDetails: '1234',
                            cardNetwork: 'VISA',
                            assuranceDetails: {
                                accountVerified: true,
                                cardHolderAuthenticated: true,
                            },
                        },
                        tokenizationData: {
                            type: 'PAYMENT_GATEWAY',
                            token: JSON.stringify({
                                protocolVersion: 'ECv2',
                                signature: 'testSignature',
                                signedMessage: JSON.stringify({
                                    encryptedMessage: 'testEncryptedMessage',
                                    ephemeralPublicKey: 'testEphemeralPublicKey',
                                    tag: 'testTag',
                                }),
                                intermediateSigningKey: {
                                    signatures: ['testSignature'],
                                    signedKey: JSON.stringify({
                                        keyExpiration: '2024-01-01T00:00:00.000Z',
                                        keyValue: 'testKeyValue',
                                    }),
                                },
                            }),
                        },
                    },
                    shippingAddress: {
                        countryCode: 'US',
                        name: 'Jane Doe',
                        phoneNumber: '+9876543210',
                        postalCode: '54321',
                        address1: '456 Elm St',
                        address2: 'Apt 2',
                        address3: '',
                        administrativeArea: 'NY',
                        locality: 'New York',
                        sortingCode: '',
                    },
                } as AndroidPaymentData)
            );

            const result = await request.show();

            expect(NativePayments.show).toHaveBeenCalledWith(expect.any(String), expect.any(Object));
            expect(result).toBeDefined();
            expect(request.state).toBe('interactive');
        });

        it('should throw when `abort` is called in invalid state', async () => {
            expect.assertions(1);

            const request = new PaymentRequest([androidMethodData], paymentDetails);

            await expect(request.abort()).rejects.toThrow(new DOMException(PaymentsErrorEnum.InvalidStateError));
        });

        it('should throw when `NativePayments.abort` rejects', async () => {
            expect.assertions(1);

            const expectedError = new PaymentsError(`Failed aborting PaymentRequest`);
            jest.mocked(NativePayments.abort).mockRejectedValue(expectedError);

            const request = new PaymentRequest([androidMethodData], paymentDetails);
            request.state = 'interactive';

            await expect(request.abort()).rejects.toThrow(expectedError);
        });

        it('should call NativePayments.abort and reject correctly when aborted', async () => {
            expect.assertions(2);

            const request = new PaymentRequest([androidMethodData], paymentDetails);
            request.state = 'interactive';
            jest.mocked(NativePayments.abort).mockResolvedValue(undefined);

            await request.abort();

            expect(NativePayments.abort).toHaveBeenCalledWith();
            expect(request.state).toBe('closed');
        });

        it('should throw NotSupportedError if platform payment method is not found', () => {
            expect.assertions(1);

            const invalidMethodData = [
                {
                    supportedMethods: 'unsupported-method',
                    data: {},
                },
            ] as unknown as PaymentMethodData[];

            expect(() => new PaymentRequest(invalidMethodData, paymentDetails)).toThrow(
                new DOMException(PaymentsErrorEnum.NotSupportedError)
            );
        });
    });

    // eslint-disable-next-line max-lines-per-function
    describe('PaymentRequest on iOS', () => {
        const iosMethodData: IosPaymentMethodDataInterface = {
            supportedMethods: PaymentMethodNameEnum.ApplePay,
            data: {
                requestBillingAddress: true,
                requestPayerEmail: true,
                requestPayerName: true,
                requestPayerPhone: true,
                requestShipping: true,
                currencyCode: 'USD',
                countryCode: 'US',
                merchantIdentifier: 'merchant.com.example',
                supportedNetworks: [SupportedNetworkEnum.Visa, SupportedNetworkEnum.Mastercard],
            },
        };

        // eslint-disable-next-line jest/no-hooks
        beforeEach(() => {
            Platform.OS = 'ios';
        });

        it('should initialize with the correct id', () => {
            expect.assertions(2);

            const request = new PaymentRequest([iosMethodData], paymentDetails);

            expect(request.id).toBeDefined();
            expect(request.state).toBe('created');
        });

        it('should throw when `canMakePayment` is called in invalid state', async () => {
            expect.assertions(1);

            const request = new PaymentRequest([iosMethodData], paymentDetails);
            request.state = 'closed';

            await expect(request.canMakePayment()).rejects.toThrow(new DOMException(PaymentsErrorEnum.InvalidStateError));
        });

        it('should return true from `canMakePayment` when valid', async () => {
            expect.assertions(2);

            const request = new PaymentRequest([iosMethodData], paymentDetails);
            jest.mocked(NativePayments.canMakePayments).mockResolvedValue(true);

            const result = await request.canMakePayment();

            expect(NativePayments.canMakePayments).toHaveBeenCalledWith(expect.any(String));
            expect(result).toBe(true);
        });

        it('should throw when `show` is called in invalid state', async () => {
            expect.assertions(1);

            const request = new PaymentRequest([iosMethodData], paymentDetails);
            request.state = 'closed';

            await expect(request.show()).rejects.toThrow(new DOMException(PaymentsErrorEnum.InvalidStateError));
        });

        it('should throw when NativePayments.show rejects', async () => {
            expect.assertions(2);

            const request = new PaymentRequest([iosMethodData], paymentDetails);
            request.state = 'created';
            jest.mocked(NativePayments.show).mockRejectedValue(new DOMException(PaymentsErrorEnum.NotAllowedError));

            await expect(request.show()).rejects.toThrow(new DOMException(PaymentsErrorEnum.NotAllowedError));
            expect(NativePayments.show).toHaveBeenCalledWith(expect.any(String), expect.any(Object));
        });

        it('should throw when `NativePayments.show` returns invalid data', async () => {
            expect.assertions(1);

            jest.mocked(NativePayments.show).mockResolvedValue(`...`);
            const expectedError = new PaymentsError(
                `Failed parsing PaymentRequest details: Unexpected token '.', "..." is not valid JSON`
            );

            const request = new PaymentRequest([iosMethodData], paymentDetails);
            request.state = 'created';

            await expect(request.show()).rejects.toThrow(expectedError);
        });

        it('should call NativePayments.show and resolve correctly', async () => {
            expect.assertions(3);

            const request = new PaymentRequest([iosMethodData], paymentDetails);
            request.state = 'created';
            jest.mocked(NativePayments.show).mockResolvedValue(
                JSON.stringify({
                    billingContact: {
                        postalAddress: {
                            street: '1 Infinite Loop',
                            city: 'Cupertino',
                            state: 'CA',
                            postalCode: '95014',
                            country: 'USA',
                            ISOCountryCode: 'US',
                            subAdministrativeArea: '',
                            subLocality: '',
                        },
                    },
                    shippingContact: {
                        name: {
                            givenName: 'John',
                            familyName: 'Doe',
                            middleName: '',
                            namePrefix: '',
                            nameSuffix: '',
                            nickname: '',
                        },
                        emailAddress: 'johndoe@example.com',
                        phoneNumber: { stringValue: '+1-555-555-5555' },
                        postalAddress: {
                            street: '1 Infinite Loop',
                            city: 'Cupertino',
                            state: 'CA',
                            postalCode: '95014',
                            country: 'USA',
                            ISOCountryCode: 'US',
                            subAdministrativeArea: '',
                            subLocality: '',
                        },
                    },
                    shippingMethod: {
                        identifier: 'standard',
                        detail: 'Standard Shipping (3-5 business days)',
                    },
                    token: {
                        paymentData: JSON.stringify({
                            version: 'EC_v1',
                            data: 'enHx9XCGOPE...',
                            signature: 'abcd1234...',
                            header: {
                                ephemeralPublicKey: 'AbCdEf...',
                                publicKeyHash: 'gHiJkL...',
                                transactionId: 'txn01',
                            },
                        }),
                        paymentMethod: {
                            displayName: 'Visa',
                            network: 'Visa',
                            type: IosPKPaymentMethodType.PKPaymentMethodTypeDebit,
                        },
                        transactionIdentifier: 'txn123456789',
                    },
                } as IosPKPayment)
            );

            const result = await request.show();

            expect(NativePayments.show).toHaveBeenCalledWith(expect.any(String), expect.any(Object));
            expect(result).toBeDefined();
            expect(request.state).toBe('interactive');
        });

        it('should throw when `abort` is called in invalid state', async () => {
            expect.assertions(1);

            const request = new PaymentRequest([iosMethodData], paymentDetails);

            await expect(request.abort()).rejects.toThrow(new DOMException(PaymentsErrorEnum.InvalidStateError));
        });

        it('should throw when `NativePayments.abort` rejects', async () => {
            expect.assertions(1);

            const expectedError = new PaymentsError(`Failed aborting PaymentRequest`);
            jest.mocked(NativePayments.abort).mockRejectedValue(expectedError);

            const request = new PaymentRequest([iosMethodData], paymentDetails);
            request.state = 'interactive';

            await expect(request.abort()).rejects.toThrow(expectedError);
        });

        it('should call NativePayments.abort and reject correctly when aborted', async () => {
            expect.assertions(2);

            const request = new PaymentRequest([iosMethodData], paymentDetails);
            request.state = 'interactive';
            jest.mocked(NativePayments.abort).mockResolvedValue(undefined);

            await request.abort();

            expect(NativePayments.abort).toHaveBeenCalledWith();
            expect(request.state).toBe('closed');
        });

        it('should throw NotSupportedError if platform payment method is not found', () => {
            expect.assertions(1);

            const invalidMethodData = [
                {
                    supportedMethods: 'unsupported-method',
                    data: {},
                },
            ] as unknown as PaymentMethodData[];

            expect(() => new PaymentRequest(invalidMethodData, paymentDetails)).toThrow(
                new DOMException(PaymentsErrorEnum.NotSupportedError)
            );
        });
    });
});
