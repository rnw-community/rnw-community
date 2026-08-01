import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Platform } from 'react-native';

import { emptyFn } from '@rnw-community/shared';

import { IosPKPaymentMethodType } from '../../@standard/ios/enum/ios-pk-payment-method-type.enum';
import { changeEventTimeoutMs } from '../../constant/change-event-timeout-ms';
import { EnvironmentEnum } from '../../enum/environment.enum';
import { PaymentAddressFieldEnum } from '../../enum/payment-address-field.enum';
import { PaymentContactFieldEnum } from '../../enum/payment-contact-field.enum';
import { PaymentMethodNameEnum } from '../../enum/payment-method-name.enum';
import { PaymentUpdateErrorTypeEnum } from '../../enum/payment-update-error-type.enum';
import { PaymentsErrorEnum } from '../../enum/payments-error.enum';
import { SupportedNetworkEnum } from '../../enum/supported-networks.enum';
import { ConstructorError } from '../../error/constructor.error';
import { DOMException } from '../../error/dom.exception';
import { PaymentsError } from '../../error/payments.error';
import { getNativePaymentsEventEmitter } from '../../util/get-native-payments-event-emitter/get-native-payments-event-emitter.util';
import { NativePayments } from '../native-payments/native-payments';
import { PaymentMethodChangeEvent } from '../payment-method-change-event/payment-method-change-event';
import { IosPaymentResponse } from '../payment-response/ios-payment-response';

import { PaymentRequest } from './payment-request';

import type { AndroidPaymentMethodDataInterface } from '../../@standard/android/mapping/android-payment-method-data.interface';
import type { AndroidPaymentDataRequest } from '../../@standard/android/request/android-payment-data-request';
import type { AndroidTransactionInfo } from '../../@standard/android/request/android-transaction-info';
import type { AndroidPaymentData } from '../../@standard/android/response/android-payment-data';
import type { IosPaymentMethodDataInterface } from '../../@standard/ios/mapping/ios-payment-method-data.interface';
import type { IosPaymentDataRequest } from '../../@standard/ios/request/ios-payment-data-request';
import type { IosPKPayment } from '../../@standard/ios/response/ios-pk-payment';
import type { PaymentDetailsInit } from '../../@standard/w3c/payment-details-init';
import type { PaymentDetailsUpdate } from '../../@standard/w3c/payment-details-update';
import type { PaymentItem } from '../../@standard/w3c/payment-item';
import type { PaymentMethodData } from '../../@standard/w3c/payment-method-data';
import type { PaymentShippingOption } from '../../@standard/w3c/payment-shipping-option';
import type { PaymentRequestEventPayloadInterface } from '../../interface/payment-request-event-payload.interface';
import type { PaymentResponseAddressInterface } from '../../interface/payment-response-address.interface';
import type { PaymentRequestEventType } from '../../type/payment-request-event.type';
import type { PaymentRequestUpdateEvent } from '../payment-request-update-event/payment-request-update-event';
import type { Maybe } from '@rnw-community/shared';
import type { NativeEventEmitter } from 'react-native';

jest.mock('../native-payments/native-payments', () => ({
    NativePayments: {
        canMakePayments: jest.fn(),
        show: jest.fn(),
        abort: jest.fn(),
        setActiveEvents: jest.fn(),
        updatePaymentDetails: jest.fn(),
    },
}));

jest.mock('../../util/get-native-payments-event-emitter/get-native-payments-event-emitter.util', () => ({
    getNativePaymentsEventEmitter: jest.fn(),
}));

jest.mock('react-native', () => ({
    Platform: {
        OS: 'android',
    },
}));

const setActiveEventsMock = jest.mocked(
    NativePayments.setActiveEvents as NonNullable<typeof NativePayments.setActiveEvents>
);
const updatePaymentDetailsMock = jest.mocked(
    NativePayments.updatePaymentDetails as NonNullable<typeof NativePayments.updatePaymentDetails>
);

describe('PaymentRequest', () => {
    const paymentDetails = {
        total: {
            label: 'Total',
            amount: { currency: 'USD', value: '10.00' },
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();

        setActiveEventsMock.mockResolvedValue(undefined);
        updatePaymentDetailsMock.mockResolvedValue(undefined);
    });

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

        it('should throw when payment methods not passed', () => {
            expect.assertions(2);

            expect(() => new PaymentRequest([], {} as unknown as PaymentDetailsInit)).toThrow(
                new PaymentsError(`Failed to construct 'PaymentRequest':  At least one payment method is required`)
            );

            expect(() => new PaymentRequest(undefined as unknown as PaymentMethodData[], paymentDetails)).toThrow(
                new PaymentsError(`Failed to construct 'PaymentRequest':  At least one payment method is required`)
            );
        });

        it('should throw when payment methods supportedMethods not passed', () => {
            expect.assertions(2);

            expect(
                () => new PaymentRequest([{ supportedMethods: undefined } as unknown as PaymentMethodData], paymentDetails)
            ).toThrow(
                new PaymentsError(`Failed to construct 'PaymentRequest':  required member supportedMethods is undefined.`)
            );

            expect(() => new PaymentRequest([{} as unknown as PaymentMethodData], paymentDetails)).toThrow(
                new PaymentsError(`Failed to construct 'PaymentRequest':  required member supportedMethods is undefined.`)
            );
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

            it('should NOT throw when total.amount.value is zero', () => {
                expect.assertions(2);

                const zeroTotal = { label: 'Total', amount: { currency: 'USD', value: '0.00' } };

                expect(() => new PaymentRequest([methodData], { total: zeroTotal })).not.toThrow();
                expect(
                    () =>
                        new PaymentRequest([methodData], {
                            total: { ...zeroTotal, amount: { currency: 'USD', value: '0' } },
                        })
                ).not.toThrow();
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

        describe(`payment details shippingOptions`, () => {
            const paymentDetailsWithTotal: PaymentDetailsInit = {
                total: { label: 'Total', amount: { currency: 'USD', value: '10.00' } },
            };

            const constructWithShippingOptions = (shippingOptions: unknown[]): PaymentRequest =>
                new PaymentRequest([methodData], {
                    ...paymentDetailsWithTotal,
                    shippingOptions: shippingOptions as PaymentShippingOption[],
                });

            it('should NOT throw when shippingOptions is not defined or empty', () => {
                expect.assertions(3);

                expect(() => new PaymentRequest([methodData], paymentDetailsWithTotal)).not.toThrow();
                expect(() => constructWithShippingOptions([])).not.toThrow();
                expect(() =>
                    constructWithShippingOptions([
                        { id: 'express', label: 'Express', amount: { currency: 'USD', value: '5.00' } },
                    ])
                ).not.toThrow();
            });

            it('should throw when a shipping option has no id or no label', () => {
                expect.assertions(3);

                const expectedError = new ConstructorError(`Missing required member(s): id, label.`);
                const amount = { currency: 'USD', value: '5.00' };

                expect(() => constructWithShippingOptions([undefined])).toThrow(expectedError);
                expect(() => constructWithShippingOptions([{ label: 'Express', amount }])).toThrow(expectedError);
                expect(() => constructWithShippingOptions([{ id: 'express', label: '', amount }])).toThrow(expectedError);
            });

            it('should throw when a shipping option has no amount value', () => {
                expect.assertions(2);

                const expectedError = new ConstructorError(`required member value is undefined.`);

                expect(() => constructWithShippingOptions([{ id: 'express', label: 'Express' }])).toThrow(expectedError);
                expect(() => constructWithShippingOptions([{ id: 'express', label: 'Express', amount: {} }])).toThrow(
                    expectedError
                );
            });

            it('should throw when a shipping option amount value is not monetary', () => {
                expect.assertions(1);

                expect(() =>
                    constructWithShippingOptions([
                        { id: 'express', label: 'Express', amount: { currency: 'USD', value: '5.00.' } },
                    ])
                ).toThrow(new ConstructorError(`'5.00.' is not a valid amount format for shipping options`));
            });
        });
    });

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
            expect(request.state).toBe('closed');
        });

        it('should throw when `NativePayments.show` returns invalid data', async () => {
            expect.assertions(1);

            jest.mocked(NativePayments.show).mockResolvedValue(`...`);
            const expectedError = new PaymentsError(`Failed parsing PaymentRequest details`);

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
            expect(request.state).toBe('closed');
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

        describe('transactionInfo serialization', () => {
            const getSerializedTransactionInfo = async (
                requestMethodData: AndroidPaymentMethodDataInterface,
                details: PaymentDetailsInit = paymentDetails
            ): Promise<AndroidTransactionInfo> => {
                jest.mocked(NativePayments.canMakePayments).mockResolvedValue(true);

                await new PaymentRequest([requestMethodData], details).canMakePayment();

                const [[serializedMethodData]] = jest.mocked(NativePayments.canMakePayments).mock.calls;

                return (JSON.parse(serializedMethodData) as AndroidPaymentDataRequest).transactionInfo;
            };

            it('should serialize FINAL totalPriceStatus and no optional fields by default', async () => {
                expect.assertions(3);

                const transactionInfo = await getSerializedTransactionInfo(androidMethodData);

                expect(transactionInfo.totalPriceStatus).toBe('FINAL');
                expect(transactionInfo).not.toHaveProperty('checkoutOption');
                expect(transactionInfo).not.toHaveProperty('transactionId');
            });

            it('should serialize provided totalPriceStatus and transactionId with zero total', async () => {
                expect.assertions(3);

                const transactionInfo = await getSerializedTransactionInfo(
                    {
                        ...androidMethodData,
                        data: { ...androidMethodData.data, totalPriceStatus: 'NOT_CURRENTLY_KNOWN', transactionId: 'txn-1' },
                    },
                    { total: { label: 'Total', amount: { currency: 'USD', value: '0.00' } } }
                );

                expect(transactionInfo.totalPriceStatus).toBe('NOT_CURRENTLY_KNOWN');
                expect(transactionInfo.transactionId).toBe('txn-1');
                expect(transactionInfo.totalPrice).toBe('0.00');
            });

            it('should serialize checkoutOption with default FINAL totalPriceStatus', async () => {
                expect.assertions(2);

                const transactionInfo = await getSerializedTransactionInfo({
                    ...androidMethodData,
                    data: { ...androidMethodData.data, checkoutOption: 'COMPLETE_IMMEDIATE_PURCHASE' },
                });

                expect(transactionInfo.checkoutOption).toBe('COMPLETE_IMMEDIATE_PURCHASE');
                expect(transactionInfo.totalPriceStatus).toBe('FINAL');
            });

            it('should throw when checkoutOption COMPLETE_IMMEDIATE_PURCHASE is combined with non-FINAL totalPriceStatus', () => {
                expect.assertions(1);

                const invalidMethodData: AndroidPaymentMethodDataInterface = {
                    ...androidMethodData,
                    data: {
                        ...androidMethodData.data,
                        checkoutOption: 'COMPLETE_IMMEDIATE_PURCHASE',
                        totalPriceStatus: 'ESTIMATED',
                    },
                };

                expect(() => new PaymentRequest([invalidMethodData], paymentDetails)).toThrow(
                    new ConstructorError(`checkoutOption 'COMPLETE_IMMEDIATE_PURCHASE' requires totalPriceStatus 'FINAL'`)
                );
            });
        });
    });

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
            const expectedError = new PaymentsError(`Failed parsing PaymentRequest details`);

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
            expect(request.state).toBe('closed');
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

        it('should throw when Android methodData combines checkoutOption COMPLETE_IMMEDIATE_PURCHASE with non-FINAL totalPriceStatus', () => {
            expect.assertions(1);

            const invalidAndroidMethodData: AndroidPaymentMethodDataInterface = {
                supportedMethods: PaymentMethodNameEnum.AndroidPay,
                data: {
                    currencyCode: 'USD',
                    countryCode: 'US',
                    supportedNetworks: [SupportedNetworkEnum.Visa],
                    environment: EnvironmentEnum.TEST,
                    gatewayConfig: {
                        gateway: 'exampleGateway',
                        gatewayMerchantId: 'exampleMerchantId',
                    },
                    checkoutOption: 'COMPLETE_IMMEDIATE_PURCHASE',
                    totalPriceStatus: 'ESTIMATED',
                },
            };

            expect(() => new PaymentRequest([iosMethodData, invalidAndroidMethodData], paymentDetails)).toThrow(
                new ConstructorError(`checkoutOption 'COMPLETE_IMMEDIATE_PURCHASE' requires totalPriceStatus 'FINAL'`)
            );
        });
        describe('couponCode serialization', () => {
            const getSerializedIosMethodData = async (
                requestMethodData: IosPaymentMethodDataInterface
            ): Promise<IosPaymentDataRequest> => {
                jest.mocked(NativePayments.canMakePayments).mockResolvedValue(true);

                await new PaymentRequest([requestMethodData], paymentDetails).canMakePayment();

                const [[serializedMethodData]] = jest.mocked(NativePayments.canMakePayments).mock.calls;

                return JSON.parse(serializedMethodData) as IosPaymentDataRequest;
            };

            it('should serialize the prefilled coupon code', async () => {
                expect.assertions(1);

                const methodDataRequest = await getSerializedIosMethodData({
                    ...iosMethodData,
                    data: { ...iosMethodData.data, couponCode: 'SALE10' },
                });

                expect(methodDataRequest.couponCode).toBe('SALE10');
            });

            it('should not serialize a missing or empty coupon code', async () => {
                expect.assertions(2);

                const withoutCouponCode = await getSerializedIosMethodData(iosMethodData);
                const withEmptyCouponCode = await getSerializedIosMethodData({
                    ...iosMethodData,
                    data: { ...iosMethodData.data, couponCode: '' },
                });

                expect(withoutCouponCode).not.toHaveProperty('couponCode');
                expect(withEmptyCouponCode).not.toHaveProperty('couponCode');
            });
        });

        it('should reject `show` with a PaymentsError when native rejects with a non-error reason', async () => {
            expect.hasAssertions();

            jest.mocked(NativePayments.show).mockRejectedValue('sheet dismissed');

            const request = new PaymentRequest([iosMethodData], { ...paymentDetails });

            await expect(request.show()).rejects.toThrow(new PaymentsError(`Failed showing PaymentRequest`));
        });
    });

    describe('payment change events', () => {
        interface FakeSubscriptionInterface {
            handler: (payload: PaymentRequestEventPayloadInterface) => void;
            removed: boolean;
            type: string;
        }

        const eventsMethodData: IosPaymentMethodDataInterface = {
            supportedMethods: PaymentMethodNameEnum.ApplePay,
            data: {
                requestShipping: true,
                currencyCode: 'USD',
                countryCode: 'US',
                merchantIdentifier: 'merchant.com.example',
                supportedNetworks: [SupportedNetworkEnum.Visa],
            },
        };
        const initialTotal: PaymentItem = { label: 'Total', amount: { currency: 'USD', value: '10.00' } };
        const updatedTotal: PaymentItem = { label: 'Total', amount: { currency: 'USD', value: '25.00' } };
        const displayItem: PaymentItem = { label: 'Shipping', amount: { currency: 'USD', value: '5.00' } };
        const shippingOption: PaymentShippingOption = {
            id: 'express',
            label: 'Express',
            amount: { currency: 'USD', value: '5.00' },
            selected: true,
        };
        const address: PaymentResponseAddressInterface = {
            address1: '1 Infinite Loop',
            address2: 'Cupertino',
            address3: 'CA',
            administrativeArea: '',
            countryCode: 'US',
            locality: '',
            postalCode: '95014',
            sortingCode: '',
        };
        const acceptedPayment = JSON.stringify({ token: {} });

        const warnMock = jest.spyOn(console, 'warn').mockImplementation(emptyFn);
        const optionalNativePayments = NativePayments as {
            setActiveEvents?: unknown;
            updatePaymentDetails?: unknown;
        };

        let subscriptions: FakeSubscriptionInterface[] = [];
        let resolveNativeUpdate: () => void = emptyFn;
        let nativeUpdate = Promise.resolve();

        const armNativeUpdate = (): void => {
            nativeUpdate = new Promise<void>(resolve => {
                resolveNativeUpdate = resolve;
            });
        };

        const createRequest = (): PaymentRequest => new PaymentRequest([eventsMethodData], { total: initialTotal });

        const createInteractiveRequest = (): PaymentRequest => {
            const request = createRequest();
            request.state = 'interactive';

            return request;
        };

        const emitNativeEvent = (type: PaymentRequestEventType, payload: PaymentRequestEventPayloadInterface): void => {
            subscriptions
                .filter(subscription => subscription.type === type && !subscription.removed)
                .forEach(subscription => {
                    subscription.handler(payload);
                });
        };

        const emitNativeEventRacingRemoval = (
            type: PaymentRequestEventType,
            payload: PaymentRequestEventPayloadInterface
        ): void => {
            subscriptions
                .filter(subscription => subscription.type === type)
                .forEach(subscription => {
                    subscription.handler(payload);
                });
        };

        const flushEventLoop = async (): Promise<void> => {
            await jest.advanceTimersByTimeAsync(0);
        };

        beforeEach(() => {
            jest.useFakeTimers();
            Platform.OS = 'ios';
            subscriptions = [];
            armNativeUpdate();
            warnMock.mockClear();

            jest.mocked(getNativePaymentsEventEmitter).mockReturnValue({
                addListener: (type: string, handler: (payload: PaymentRequestEventPayloadInterface) => void) => {
                    const subscription: FakeSubscriptionInterface = { handler, removed: false, type };
                    subscriptions.push(subscription);

                    return {
                        remove: () => {
                            subscription.removed = true;
                        },
                    };
                },
            } as unknown as NativeEventEmitter);

            updatePaymentDetailsMock.mockImplementation(async () => {
                resolveNativeUpdate();
            });
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('should subscribe to the native event and declare the active event types for the request', () => {
            expect.hasAssertions();

            const request = createInteractiveRequest();
            request.addEventListener('shippingaddresschange', emptyFn);

            expect(subscriptions).toHaveLength(1);
            expect(setActiveEventsMock).toHaveBeenCalledWith(request.id, ['shippingaddresschange']);
        });

        it('should echo the event id of the answered event back to native', async () => {
            expect.hasAssertions();

            const request = createInteractiveRequest();

            request.addEventListener('shippingaddresschange', event => {
                event.updateWith({ total: updatedTotal });
            });

            emitNativeEvent('shippingaddresschange', { requestId: request.id, eventId: 7, shippingAddress: address });
            await nativeUpdate;
            await flushEventLoop();

            expect(updatePaymentDetailsMock).toHaveBeenCalledWith(
                { error: '', eventId: 7, eventName: 'shippingaddresschange', requestId: request.id, total: updatedTotal },
                [],
                []
            );
        });

        it('should echo the event id of an event arriving while another one is processed', async () => {
            expect.hasAssertions();

            const request = createInteractiveRequest();

            request.addEventListener('shippingaddresschange', emptyFn);
            request.updating = true;

            emitNativeEvent('shippingaddresschange', { requestId: request.id, eventId: 9, shippingAddress: address });
            await nativeUpdate;
            await flushEventLoop();

            expect(updatePaymentDetailsMock).toHaveBeenCalledWith(
                { error: '', eventId: 9, eventName: 'shippingaddresschange', requestId: request.id, total: initialTotal },
                [],
                []
            );
        });

        it('should apply the details passed to updateWith and send them to native', async () => {
            expect.hasAssertions();

            const request = createInteractiveRequest();

            request.addEventListener('shippingaddresschange', event => {
                event.updateWith({ total: updatedTotal, displayItems: [displayItem], shippingOptions: [shippingOption] });
            });

            emitNativeEvent('shippingaddresschange', { requestId: request.id, shippingAddress: address });
            await nativeUpdate;
            await flushEventLoop();

            expect(request.shippingAddress).toStrictEqual(address);
            expect(request.details.total).toStrictEqual(updatedTotal);
            expect(updatePaymentDetailsMock).toHaveBeenCalledWith(
                { error: '', eventName: 'shippingaddresschange', requestId: request.id, total: updatedTotal },
                [displayItem],
                [shippingOption]
            );
        });

        it('should apply the updated details only after native accepted them', async () => {
            expect.hasAssertions();

            const request = createInteractiveRequest();
            let totalWhileUpdating: Maybe<PaymentItem> = null;

            updatePaymentDetailsMock.mockImplementation(async () => {
                totalWhileUpdating = request.details.total;
                resolveNativeUpdate();
            });

            request.addEventListener('shippingaddresschange', event => {
                event.updateWith({ total: updatedTotal });
            });

            emitNativeEvent('shippingaddresschange', { requestId: request.id, shippingAddress: address });
            await nativeUpdate;
            await flushEventLoop();

            expect(totalWhileUpdating).toStrictEqual(initialTotal);
            expect(request.details.total).toStrictEqual(updatedTotal);
        });

        it('should keep the current details when native did not accept the update', async () => {
            expect.hasAssertions();

            updatePaymentDetailsMock.mockImplementation(async () => {
                resolveNativeUpdate();

                return Promise.reject(new Error('Payment sheet is gone'));
            });

            const request = createInteractiveRequest();
            let isFirstEvent = true;

            request.addEventListener('shippingaddresschange', event => {
                if (isFirstEvent) {
                    isFirstEvent = false;
                    event.updateWith({ total: updatedTotal, displayItems: [displayItem] });
                }
            });

            emitNativeEvent('shippingaddresschange', { requestId: request.id, shippingAddress: address });
            await nativeUpdate;
            await flushEventLoop();

            expect(request.details.total).toStrictEqual(initialTotal);
            expect(request.details.displayItems).toBeUndefined();

            armNativeUpdate();
            updatePaymentDetailsMock.mockImplementation(async () => {
                resolveNativeUpdate();
            });

            emitNativeEvent('shippingaddresschange', { requestId: request.id, shippingAddress: address });
            await nativeUpdate;

            expect(updatePaymentDetailsMock).toHaveBeenLastCalledWith(
                { error: '', eventName: 'shippingaddresschange', requestId: request.id, total: initialTotal },
                [],
                []
            );
        });

        it('should keep the current total when the update only replaces the display items', async () => {
            expect.hasAssertions();

            const request = createInteractiveRequest();

            request.addEventListener('shippingaddresschange', event => {
                event.updateWith({ displayItems: [displayItem] });
            });

            emitNativeEvent('shippingaddresschange', { requestId: request.id, shippingAddress: address });
            await nativeUpdate;

            expect(updatePaymentDetailsMock).toHaveBeenCalledWith(
                { error: '', eventName: 'shippingaddresschange', requestId: request.id, total: initialTotal },
                [displayItem],
                []
            );
        });

        it('should await an asynchronous listener before responding to native', async () => {
            expect.hasAssertions();

            const request = createInteractiveRequest();
            let updatingWhileListening = false;

            request.addEventListener('shippingoptionchange', async event => {
                updatingWhileListening = request.updating;

                await new Promise<void>(resolve => {
                    setTimeout(resolve, 10);
                });

                event.updateWith({ total: updatedTotal });
            });

            emitNativeEvent('shippingoptionchange', { requestId: request.id, shippingOption: 'express' });
            await jest.advanceTimersByTimeAsync(10);
            await nativeUpdate;

            expect(updatingWhileListening).toBe(true);
            expect(request.updating).toBe(false);
            expect(request.shippingOption).toBe('express');
            expect(updatePaymentDetailsMock).toHaveBeenCalledWith(
                { error: '', eventName: 'shippingoptionchange', requestId: request.id, total: updatedTotal },
                [],
                []
            );
        });

        it('should accept a promise of updated details and forward the update error', async () => {
            expect.hasAssertions();

            const request = createInteractiveRequest();

            request.addEventListener('shippingaddresschange', event => {
                event.updateWith(Promise.resolve({ total: updatedTotal, error: 'We do not ship there' }));
            });

            emitNativeEvent('shippingaddresschange', { requestId: request.id, shippingAddress: address });
            await nativeUpdate;

            expect(updatePaymentDetailsMock).toHaveBeenCalledWith(
                {
                    error: 'We do not ship there',
                    eventName: 'shippingaddresschange',
                    requestId: request.id,
                    total: updatedTotal,
                },
                [],
                []
            );
        });

        it('should respond with the unchanged details when the listener does not call updateWith', async () => {
            expect.hasAssertions();

            const request = createInteractiveRequest();
            request.addEventListener('couponcodechange', emptyFn);

            emitNativeEvent('couponcodechange', { requestId: request.id, couponCode: 'SALE10' });
            await nativeUpdate;

            expect(request.couponCode).toBe('SALE10');
            expect(updatePaymentDetailsMock).toHaveBeenCalledWith(
                { error: '', eventName: 'couponcodechange', requestId: request.id, total: initialTotal },
                [],
                []
            );
        });

        it('should respond with the unchanged details when the update never settles', async () => {
            expect.hasAssertions();

            const request = createInteractiveRequest();

            request.addEventListener('shippingaddresschange', event => {
                event.updateWith(new Promise<PaymentDetailsUpdate>(emptyFn));
            });

            emitNativeEvent('shippingaddresschange', { requestId: request.id, shippingAddress: address });
            await jest.advanceTimersByTimeAsync(changeEventTimeoutMs);
            await nativeUpdate;

            expect(request.updating).toBe(false);
            expect(updatePaymentDetailsMock).toHaveBeenCalledWith(
                { error: '', eventName: 'shippingaddresschange', requestId: request.id, total: initialTotal },
                [],
                []
            );
        });

        it('should throw InvalidStateError on the second updateWith and keep the first update', async () => {
            expect.hasAssertions();

            const request = createInteractiveRequest();
            let secondCallError: unknown = null;

            request.addEventListener('shippingaddresschange', event => {
                event.updateWith({ total: updatedTotal });

                try {
                    event.updateWith({ total: initialTotal });
                } catch (error) {
                    secondCallError = error;
                }
            });

            emitNativeEvent('shippingaddresschange', { requestId: request.id, shippingAddress: address });
            await nativeUpdate;

            expect(secondCallError).toStrictEqual(new DOMException(PaymentsErrorEnum.InvalidStateError));
            expect(updatePaymentDetailsMock).toHaveBeenCalledWith(
                { error: '', eventName: 'shippingaddresschange', requestId: request.id, total: updatedTotal },
                [],
                []
            );
        });

        it('should throw InvalidStateError when a listener calls updateWith after the event was answered', async () => {
            expect.hasAssertions();

            const request = createInteractiveRequest();
            let lateCallError: unknown = null;
            let lateUpdate: () => void = emptyFn;

            request.addEventListener('shippingaddresschange', event => {
                lateUpdate = () => {
                    try {
                        event.updateWith({ total: updatedTotal });
                    } catch (error) {
                        lateCallError = error;
                    }
                };
            });

            emitNativeEvent('shippingaddresschange', { requestId: request.id, shippingAddress: address });
            await nativeUpdate;
            lateUpdate();

            expect(lateCallError).toStrictEqual(new DOMException(PaymentsErrorEnum.InvalidStateError));
            expect(updatePaymentDetailsMock).toHaveBeenCalledWith(
                { error: '', eventName: 'shippingaddresschange', requestId: request.id, total: initialTotal },
                [],
                []
            );
        });

        it('should respond with unchanged details when the listener throws', async () => {
            expect.hasAssertions();

            const request = createInteractiveRequest();

            request.addEventListener('shippingaddresschange', () => {
                throw new Error('Shipping service is down');
            });

            emitNativeEvent('shippingaddresschange', { requestId: request.id, shippingAddress: address });
            await nativeUpdate;

            expect(warnMock).toHaveBeenCalledWith(expect.stringContaining('Shipping service is down'));
            expect(updatePaymentDetailsMock).toHaveBeenCalledWith(
                { error: '', eventName: 'shippingaddresschange', requestId: request.id, total: initialTotal },
                [],
                []
            );
        });

        it('should respond with unchanged details when the updateWith promise rejects', async () => {
            expect.hasAssertions();

            const request = createInteractiveRequest();

            request.addEventListener('shippingaddresschange', event => {
                event.updateWith(Promise.reject(new Error('Rate lookup failed')));
            });

            emitNativeEvent('shippingaddresschange', { requestId: request.id, shippingAddress: address });
            await nativeUpdate;

            expect(warnMock).toHaveBeenCalledWith(expect.stringContaining('Rate lookup failed'));
            expect(updatePaymentDetailsMock).toHaveBeenCalledWith(
                { error: '', eventName: 'shippingaddresschange', requestId: request.id, total: initialTotal },
                [],
                []
            );
        });

        it('should respond with unchanged details when the updated details are invalid', async () => {
            expect.hasAssertions();

            const request = createInteractiveRequest();

            request.addEventListener('shippingaddresschange', event => {
                event.updateWith({ total: { label: 'Total', amount: { currency: 'USD', value: '-25.00' } } });
            });

            emitNativeEvent('shippingaddresschange', { requestId: request.id, shippingAddress: address });
            await nativeUpdate;

            expect(warnMock).toHaveBeenCalledWith(expect.stringContaining('Total amount value should be non-negative'));
            expect(updatePaymentDetailsMock).toHaveBeenCalledWith(
                { error: '', eventName: 'shippingaddresschange', requestId: request.id, total: initialTotal },
                [],
                []
            );
        });

        it('should keep invalid display items away from native and answer with the unchanged details', async () => {
            expect.hasAssertions();

            const request = createInteractiveRequest();

            request.addEventListener('shippingaddresschange', event => {
                event.updateWith({
                    total: updatedTotal,
                    displayItems: [{ label: 'Shipping', amount: { currency: 'USD', value: '5.00.' } }],
                });
            });

            emitNativeEvent('shippingaddresschange', { requestId: request.id, shippingAddress: address });
            await nativeUpdate;

            expect(warnMock).toHaveBeenCalledWith(
                expect.stringContaining(`'5.00.' is not a valid amount format for display items`)
            );
            expect(request.details.displayItems).toBeUndefined();
            expect(updatePaymentDetailsMock).toHaveBeenCalledWith(
                { error: '', eventName: 'shippingaddresschange', requestId: request.id, total: initialTotal },
                [],
                []
            );
        });

        it('should keep invalid shipping options away from native and answer with the unchanged details', async () => {
            expect.hasAssertions();

            const request = createInteractiveRequest();

            request.addEventListener('shippingoptionchange', event => {
                event.updateWith({
                    total: updatedTotal,
                    shippingOptions: [{ id: 'express', label: 'Express', amount: { currency: 'USD', value: 'free' } }],
                });
            });

            emitNativeEvent('shippingoptionchange', { requestId: request.id, shippingOption: 'express' });
            await nativeUpdate;

            expect(warnMock).toHaveBeenCalledWith(
                expect.stringContaining(`'free' is not a valid amount format for shipping options`)
            );
            expect(request.details.shippingOptions).toBeUndefined();
            expect(updatePaymentDetailsMock).toHaveBeenCalledWith(
                { error: '', eventName: 'shippingoptionchange', requestId: request.id, total: initialTotal },
                [],
                []
            );
        });

        it('should resolve show() normally when a listener answered with invalid details', async () => {
            expect.hasAssertions();

            let finishShow: (details: string) => void = emptyFn;
            jest.mocked(NativePayments.show).mockImplementation(
                async () =>
                    new Promise<string>(resolve => {
                        finishShow = resolve;
                    })
            );

            const request = createRequest();
            request.addEventListener('shippingoptionchange', event => {
                event.updateWith({
                    shippingOptions: [{ id: '', label: '', amount: { currency: 'USD', value: '5.00' } }],
                });
            });

            const response = request.show();
            emitNativeEvent('shippingoptionchange', { requestId: request.id, shippingOption: 'express' });
            await nativeUpdate;
            finishShow(acceptedPayment);

            await expect(response).resolves.toBeInstanceOf(IosPaymentResponse);
            expect(request.state).toBe('closed');
            expect(updatePaymentDetailsMock).toHaveBeenCalledWith(
                { error: '', eventName: 'shippingoptionchange', requestId: request.id, total: initialTotal },
                [],
                []
            );
        });

        it('should deliver a PaymentMethodChangeEvent carrying the method name and details', async () => {
            expect.hasAssertions();

            const request = createInteractiveRequest();
            const listener = jest.fn<(event: PaymentMethodChangeEvent) => void>();
            request.addEventListener('paymentmethodchange', listener);

            emitNativeEvent('paymentmethodchange', {
                requestId: request.id,
                methodName: 'https://apple.com/apple-pay',
                methodDetails: { network: 'Visa' },
            });
            await nativeUpdate;

            const [[event]] = listener.mock.calls;

            expect(event).toBeInstanceOf(PaymentMethodChangeEvent);
            expect(event.methodName).toBe('https://apple.com/apple-pay');
            expect(event.methodDetails).toStrictEqual({ network: 'Visa' });
        });

        it('should deliver a PaymentMethodChangeEvent with empty defaults when native sends no method data', async () => {
            expect.hasAssertions();

            const request = createInteractiveRequest();
            const listener = jest.fn<(event: PaymentMethodChangeEvent) => void>();
            request.addEventListener('paymentmethodchange', listener);

            emitNativeEvent('paymentmethodchange', { requestId: request.id });
            await nativeUpdate;

            const [[event]] = listener.mock.calls;

            expect(event.methodName).toBe('');
            expect(event.methodDetails).toBeNull();
        });

        it('should ignore events addressed to another payment request', async () => {
            expect.hasAssertions();

            const request = createInteractiveRequest();
            const otherRequest = createInteractiveRequest();
            const listener = jest.fn<(event: PaymentRequestUpdateEvent) => void>();
            const otherListener = jest.fn<(event: PaymentRequestUpdateEvent) => void>();

            request.addEventListener('shippingaddresschange', listener);
            otherRequest.addEventListener('shippingaddresschange', otherListener);

            emitNativeEvent('shippingaddresschange', { requestId: request.id, shippingAddress: address });
            await nativeUpdate;

            expect(listener).toHaveBeenCalledTimes(1);
            expect(otherListener).not.toHaveBeenCalled();
            expect(updatePaymentDetailsMock).toHaveBeenCalledTimes(1);
        });

        it('should route interleaved events of two concurrent requests to their own listeners only', async () => {
            expect.hasAssertions();

            const request = createInteractiveRequest();
            const otherRequest = createInteractiveRequest();
            const listener = jest.fn<(event: PaymentRequestUpdateEvent) => void>();
            const otherListener = jest.fn<(event: PaymentRequestUpdateEvent) => void>();

            request.addEventListener('shippingoptionchange', listener);
            otherRequest.addEventListener('shippingoptionchange', otherListener);

            emitNativeEvent('shippingoptionchange', { requestId: request.id, shippingOption: 'express' });
            await nativeUpdate;

            armNativeUpdate();
            emitNativeEvent('shippingoptionchange', { requestId: otherRequest.id, shippingOption: 'standard' });
            await nativeUpdate;

            armNativeUpdate();
            emitNativeEvent('shippingoptionchange', { requestId: request.id, shippingOption: 'ground' });
            await nativeUpdate;

            expect(listener).toHaveBeenCalledTimes(2);
            expect(otherListener).toHaveBeenCalledTimes(1);
            expect(request.shippingOption).toBe('ground');
            expect(otherRequest.shippingOption).toBe('standard');
            expect(updatePaymentDetailsMock.mock.calls.map(([update]) => update.requestId)).toStrictEqual([
                request.id,
                otherRequest.id,
                request.id,
            ]);
        });

        it('should ignore events when the request is no longer interactive', async () => {
            expect.hasAssertions();

            const request = createRequest();
            const listener = jest.fn<(event: PaymentRequestUpdateEvent) => void>();
            request.addEventListener('shippingaddresschange', listener);

            emitNativeEvent('shippingaddresschange', { requestId: request.id, shippingAddress: address });
            await flushEventLoop();

            expect(listener).not.toHaveBeenCalled();
            expect(updatePaymentDetailsMock).not.toHaveBeenCalled();
        });

        it('should answer an event arriving while another one is still processed without dispatching it', async () => {
            expect.hasAssertions();

            const request = createInteractiveRequest();
            const listener = jest.fn(async (event: PaymentRequestUpdateEvent) => {
                await new Promise<void>(resolve => {
                    setTimeout(resolve, 10);
                });

                event.updateWith({ total: updatedTotal });
            });

            request.addEventListener('shippingoptionchange', listener);

            emitNativeEvent('shippingoptionchange', { requestId: request.id, shippingOption: 'express' });
            emitNativeEvent('shippingoptionchange', { requestId: request.id, shippingOption: 'standard' });
            await jest.advanceTimersByTimeAsync(10);

            expect(listener).toHaveBeenCalledTimes(1);
            expect(updatePaymentDetailsMock).toHaveBeenNthCalledWith(
                1,
                { error: '', eventName: 'shippingoptionchange', requestId: request.id, total: initialTotal },
                [],
                []
            );
            expect(updatePaymentDetailsMock).toHaveBeenNthCalledWith(
                2,
                { error: '', eventName: 'shippingoptionchange', requestId: request.id, total: updatedTotal },
                [],
                []
            );
        });

        it('should track the selection of an event that was answered without being dispatched', async () => {
            expect.hasAssertions();

            const request = createInteractiveRequest();

            request.addEventListener('shippingoptionchange', async (event: PaymentRequestUpdateEvent) => {
                await new Promise<void>(resolve => {
                    setTimeout(resolve, 10);
                });

                event.updateWith({ total: updatedTotal });
            });

            emitNativeEvent('shippingoptionchange', { requestId: request.id, shippingOption: 'express' });
            emitNativeEvent('shippingoptionchange', { requestId: request.id, shippingOption: 'standard' });
            await jest.advanceTimersByTimeAsync(10);

            expect(request.shippingOption).toBe('standard');
            expect(updatePaymentDetailsMock).toHaveBeenNthCalledWith(
                1,
                { error: '', eventName: 'shippingoptionchange', requestId: request.id, total: initialTotal },
                [],
                []
            );
        });

        it('should deliver the event to every listener registered for the type', async () => {
            expect.hasAssertions();

            const request = createInteractiveRequest();
            const firstListener = jest.fn<(event: PaymentRequestUpdateEvent) => void>();
            const secondListener = jest.fn<(event: PaymentRequestUpdateEvent) => void>();

            request.addEventListener('shippingaddresschange', firstListener);
            request.addEventListener('shippingaddresschange', secondListener);

            emitNativeEvent('shippingaddresschange', { requestId: request.id, shippingAddress: address });
            await nativeUpdate;

            expect(firstListener).toHaveBeenCalledTimes(1);
            expect(secondListener).toHaveBeenCalledTimes(1);
            expect(subscriptions).toHaveLength(1);
            expect(updatePaymentDetailsMock).toHaveBeenCalledTimes(1);
        });

        it('should register the same listener only once for the same event type', async () => {
            expect.hasAssertions();

            const request = createInteractiveRequest();
            const listener = jest.fn<(event: PaymentRequestUpdateEvent) => void>();

            request.addEventListener('shippingaddresschange', listener);
            request.addEventListener('shippingaddresschange', listener);

            emitNativeEvent('shippingaddresschange', { requestId: request.id, shippingAddress: address });
            await nativeUpdate;

            expect(listener).toHaveBeenCalledTimes(1);
            expect(setActiveEventsMock).toHaveBeenCalledTimes(1);
        });

        it('should keep exactly one native subscription per event type across registration churn', () => {
            expect.hasAssertions();

            const request = createInteractiveRequest();
            const firstListener = jest.fn<(event: PaymentRequestUpdateEvent) => void>();
            const secondListener = jest.fn<(event: PaymentRequestUpdateEvent) => void>();

            request.addEventListener('shippingaddresschange', firstListener);
            request.addEventListener('shippingaddresschange', firstListener);
            request.addEventListener('shippingaddresschange', secondListener);
            request.removeEventListener('shippingaddresschange', firstListener);
            request.removeEventListener('shippingaddresschange', secondListener);
            request.addEventListener('shippingaddresschange', firstListener);

            expect(subscriptions.filter(subscription => !subscription.removed)).toHaveLength(1);
            expect(setActiveEventsMock.mock.calls).toStrictEqual([
                [request.id, ['shippingaddresschange']],
                [request.id, []],
                [request.id, ['shippingaddresschange']],
            ]);
        });

        it('should drop only the removed event type from the native handshake while interactive', () => {
            expect.hasAssertions();

            const request = createInteractiveRequest();
            const addressListener = jest.fn<(event: PaymentRequestUpdateEvent) => void>();
            const optionListener = jest.fn<(event: PaymentRequestUpdateEvent) => void>();

            request.addEventListener('shippingaddresschange', addressListener);
            request.addEventListener('shippingoptionchange', optionListener);
            request.removeEventListener('shippingoptionchange', optionListener);

            expect(setActiveEventsMock).toHaveBeenLastCalledWith(request.id, ['shippingaddresschange']);
            expect(
                subscriptions.filter(subscription => !subscription.removed).map(subscription => subscription.type)
            ).toStrictEqual(['shippingaddresschange']);
        });

        it('should stop delivering the event to the remaining listeners once one of them answered', async () => {
            expect.hasAssertions();

            const request = createInteractiveRequest();
            const skippedListener = jest.fn<(event: PaymentRequestUpdateEvent) => void>();

            request.addEventListener('shippingaddresschange', event => {
                event.updateWith({ total: updatedTotal });
            });
            request.addEventListener('shippingaddresschange', skippedListener);

            emitNativeEvent('shippingaddresschange', { requestId: request.id, shippingAddress: address });
            await nativeUpdate;

            expect(skippedListener).not.toHaveBeenCalled();
            expect(updatePaymentDetailsMock).toHaveBeenCalledWith(
                { error: '', eventName: 'shippingaddresschange', requestId: request.id, total: updatedTotal },
                [],
                []
            );
        });

        it('should keep delivering the event to the remaining listeners when one of them throws', async () => {
            expect.hasAssertions();

            const request = createInteractiveRequest();

            request.addEventListener('shippingaddresschange', () => {
                throw new Error('Analytics is down');
            });
            request.addEventListener('shippingaddresschange', event => {
                event.updateWith({ total: updatedTotal });
            });

            emitNativeEvent('shippingaddresschange', { requestId: request.id, shippingAddress: address });
            await nativeUpdate;

            expect(warnMock).toHaveBeenCalledWith(expect.stringContaining('Analytics is down'));
            expect(updatePaymentDetailsMock).toHaveBeenCalledWith(
                { error: '', eventName: 'shippingaddresschange', requestId: request.id, total: updatedTotal },
                [],
                []
            );
        });

        it('should stop delivering events after the last listener was removed', async () => {
            expect.hasAssertions();

            const request = createInteractiveRequest();
            const listener = jest.fn<(event: PaymentRequestUpdateEvent) => void>();

            request.addEventListener('shippingaddresschange', listener);
            request.removeEventListener('shippingaddresschange', listener);

            emitNativeEvent('shippingaddresschange', { requestId: request.id, shippingAddress: address });
            await flushEventLoop();

            expect(listener).not.toHaveBeenCalled();
            expect(setActiveEventsMock).toHaveBeenLastCalledWith(request.id, []);
        });

        it('should keep the registration when removing a listener that was never registered', async () => {
            expect.hasAssertions();

            const request = createInteractiveRequest();
            const listener = jest.fn<(event: PaymentRequestUpdateEvent) => void>();

            request.addEventListener('shippingaddresschange', listener);
            request.removeEventListener('shippingaddresschange', emptyFn);

            emitNativeEvent('shippingaddresschange', { requestId: request.id, shippingAddress: address });
            await nativeUpdate;

            expect(listener).toHaveBeenCalledTimes(1);
            expect(setActiveEventsMock).toHaveBeenLastCalledWith(request.id, ['shippingaddresschange']);
        });

        it('should keep the subscription when only one of the registered listeners is removed', async () => {
            expect.hasAssertions();

            const request = createInteractiveRequest();
            const removedListener = jest.fn<(event: PaymentRequestUpdateEvent) => void>();
            const keptListener = jest.fn<(event: PaymentRequestUpdateEvent) => void>();

            request.addEventListener('shippingaddresschange', removedListener);
            request.addEventListener('shippingaddresschange', keptListener);
            request.removeEventListener('shippingaddresschange', removedListener);

            emitNativeEvent('shippingaddresschange', { requestId: request.id, shippingAddress: address });
            await nativeUpdate;

            expect(removedListener).not.toHaveBeenCalled();
            expect(keptListener).toHaveBeenCalledTimes(1);
            expect(setActiveEventsMock).toHaveBeenLastCalledWith(request.id, ['shippingaddresschange']);
        });

        it('should do nothing when removing a listener of an event type without registrations', () => {
            expect.hasAssertions();

            createInteractiveRequest().removeEventListener('couponcodechange', emptyFn);

            expect(setActiveEventsMock).not.toHaveBeenCalled();
        });

        it('should warn instead of failing when the native update rejects', async () => {
            expect.hasAssertions();

            updatePaymentDetailsMock.mockImplementation(async () => {
                resolveNativeUpdate();

                return Promise.reject(new Error('Payment sheet is gone'));
            });

            const request = createInteractiveRequest();
            request.addEventListener('shippingaddresschange', emptyFn);

            emitNativeEvent('shippingaddresschange', { requestId: request.id, shippingAddress: address });
            await nativeUpdate;
            await flushEventLoop();

            expect(warnMock).toHaveBeenCalledWith(expect.stringContaining('Payment sheet is gone'));
            expect(request.updating).toBe(false);
        });

        it('should declare the active event types before the payment sheet is shown', async () => {
            expect.hasAssertions();

            jest.mocked(NativePayments.show).mockResolvedValue(acceptedPayment);

            const request = createRequest();
            request.addEventListener('shippingaddresschange', emptyFn);

            await request.show();

            const [showOrder] = jest.mocked(NativePayments.show).mock.invocationCallOrder;
            const syncsBeforeShow = setActiveEventsMock.mock.invocationCallOrder.filter(order => order < showOrder);

            expect(setActiveEventsMock).toHaveBeenCalledWith(request.id, ['shippingaddresschange']);
            expect(syncsBeforeShow).toHaveLength(2);
        });

        it('should remove all subscriptions when show resolves', async () => {
            expect.hasAssertions();

            jest.mocked(NativePayments.show).mockResolvedValue(acceptedPayment);

            const request = createRequest();
            const listener = jest.fn<(event: PaymentRequestUpdateEvent) => void>();
            request.addEventListener('shippingaddresschange', listener);

            await request.show();

            emitNativeEventRacingRemoval('shippingaddresschange', { requestId: request.id, shippingAddress: address });
            await flushEventLoop();

            expect(subscriptions.every(subscription => subscription.removed)).toBe(true);
            expect(setActiveEventsMock).toHaveBeenLastCalledWith(request.id, []);
            expect(listener).not.toHaveBeenCalled();
            expect(updatePaymentDetailsMock).not.toHaveBeenCalled();
        });

        it('should remove all subscriptions when show rejects', async () => {
            expect.hasAssertions();

            jest.mocked(NativePayments.show).mockRejectedValue(new DOMException(PaymentsErrorEnum.AbortError));

            const request = createRequest();
            const listener = jest.fn<(event: PaymentRequestUpdateEvent) => void>();
            request.addEventListener('shippingaddresschange', listener);

            await expect(request.show()).rejects.toThrow(new DOMException(PaymentsErrorEnum.AbortError));

            emitNativeEventRacingRemoval('shippingaddresschange', { requestId: request.id, shippingAddress: address });
            await flushEventLoop();

            expect(subscriptions.every(subscription => subscription.removed)).toBe(true);
            expect(setActiveEventsMock).toHaveBeenLastCalledWith(request.id, []);
            expect(listener).not.toHaveBeenCalled();
            expect(updatePaymentDetailsMock).not.toHaveBeenCalled();
        });

        it('should remove all subscriptions and stop dispatching when the request is aborted', async () => {
            expect.hasAssertions();

            jest.mocked(NativePayments.abort).mockResolvedValue(undefined);

            const request = createInteractiveRequest();
            const listener = jest.fn<(event: PaymentRequestUpdateEvent) => void>();
            request.addEventListener('shippingaddresschange', listener);

            await request.abort();

            emitNativeEventRacingRemoval('shippingaddresschange', { requestId: request.id, shippingAddress: address });
            await flushEventLoop();

            expect(subscriptions.every(subscription => subscription.removed)).toBe(true);
            expect(setActiveEventsMock).toHaveBeenLastCalledWith(request.id, []);
            expect(listener).not.toHaveBeenCalled();
            expect(updatePaymentDetailsMock).not.toHaveBeenCalled();
        });

        it('should drop an in-flight event response once the payment sheet is finished', async () => {
            expect.hasAssertions();

            let finishShow: (details: string) => void = emptyFn;
            jest.mocked(NativePayments.show).mockImplementation(
                async () =>
                    new Promise<string>(resolve => {
                        finishShow = resolve;
                    })
            );

            const request = createRequest();
            request.addEventListener('shippingaddresschange', event => {
                event.updateWith(new Promise<PaymentDetailsUpdate>(emptyFn));
            });

            const response = request.show();
            emitNativeEvent('shippingaddresschange', { requestId: request.id, shippingAddress: address });
            await flushEventLoop();

            finishShow(acceptedPayment);
            await response;
            await flushEventLoop();

            expect(updatePaymentDetailsMock).not.toHaveBeenCalled();
            expect(request.updating).toBe(false);
        });

        it('should close the request and reject a second show once the payment sheet settled', async () => {
            expect.hasAssertions();

            jest.mocked(NativePayments.show).mockResolvedValue(acceptedPayment);

            const request = createRequest();
            request.addEventListener('shippingaddresschange', emptyFn);
            await request.show();

            expect(request.state).toBe('closed');
            await expect(request.show()).rejects.toThrow(new DOMException(PaymentsErrorEnum.InvalidStateError));
        });

        it('should ignore listener registration once the request is closed', async () => {
            expect.hasAssertions();

            jest.mocked(NativePayments.show).mockResolvedValue(acceptedPayment);

            const request = createRequest();
            await request.show();
            setActiveEventsMock.mockClear();

            const listener = jest.fn<(event: PaymentRequestUpdateEvent) => void>();
            request.addEventListener('shippingaddresschange', listener);
            request.removeEventListener('shippingaddresschange', listener);

            expect(subscriptions).toHaveLength(0);
            expect(setActiveEventsMock).not.toHaveBeenCalled();
        });

        it('should reject a second show without replacing the rejecter of the running one', async () => {
            expect.hasAssertions();

            jest.mocked(NativePayments.show).mockResolvedValue(acceptedPayment);

            const request = createRequest();
            const response = request.show();

            await expect(request.show()).rejects.toThrow(new DOMException(PaymentsErrorEnum.InvalidStateError));
            await expect(response).resolves.toBeInstanceOf(IosPaymentResponse);
        });

        it('should show the payment sheet when the native module cannot deliver change events', async () => {
            expect.hasAssertions();

            jest.mocked(getNativePaymentsEventEmitter).mockReturnValue(null);
            jest.mocked(NativePayments.show).mockResolvedValue(acceptedPayment);

            const { setActiveEvents, updatePaymentDetails } = optionalNativePayments;
            delete optionalNativePayments.setActiveEvents;
            delete optionalNativePayments.updatePaymentDetails;

            const request = createRequest();
            request.addEventListener('shippingaddresschange', emptyFn);
            request.addEventListener('paymentmethodchange', emptyFn);

            await expect(request.show()).resolves.toBeInstanceOf(IosPaymentResponse);
            expect(subscriptions).toHaveLength(0);

            Object.assign(optionalNativePayments, { setActiveEvents, updatePaymentDetails });
        });

        it('should forward a field level shipping address error to native', async () => {
            expect.hasAssertions();

            const request = createInteractiveRequest();
            const error = {
                type: PaymentUpdateErrorTypeEnum.ShippingAddressField,
                key: PaymentAddressFieldEnum.PostalCode,
                message: 'We do not ship to this postal code',
            } as const;

            request.addEventListener('shippingaddresschange', event => {
                event.updateWith({ error });
            });

            emitNativeEvent('shippingaddresschange', { requestId: request.id, shippingAddress: address });
            await nativeUpdate;

            expect(updatePaymentDetailsMock).toHaveBeenCalledWith(
                { error, eventName: 'shippingaddresschange', requestId: request.id, total: initialTotal },
                [],
                []
            );
        });

        it('should forward a field level payer contact error to native', async () => {
            expect.hasAssertions();

            const request = createInteractiveRequest();
            const error = {
                type: PaymentUpdateErrorTypeEnum.ContactField,
                field: PaymentContactFieldEnum.Email,
                message: 'We cannot deliver a receipt to this address',
            } as const;

            request.addEventListener('shippingaddresschange', event => {
                event.updateWith({ error });
            });

            emitNativeEvent('shippingaddresschange', { requestId: request.id, shippingAddress: address });
            await nativeUpdate;

            expect(updatePaymentDetailsMock).toHaveBeenCalledWith(
                { error, eventName: 'shippingaddresschange', requestId: request.id, total: initialTotal },
                [],
                []
            );
        });

        it('should forward an expired coupon code error to native', async () => {
            expect.hasAssertions();

            const request = createInteractiveRequest();
            const error = {
                type: PaymentUpdateErrorTypeEnum.CouponCode,
                expired: true,
                message: 'SALE10 expired last week',
            } as const;

            request.addEventListener('couponcodechange', event => {
                event.updateWith({ error });
            });

            emitNativeEvent('couponcodechange', { requestId: request.id, couponCode: 'SALE10' });
            await nativeUpdate;

            expect(updatePaymentDetailsMock).toHaveBeenCalledWith(
                { error, eventName: 'couponcodechange', requestId: request.id, total: initialTotal },
                [],
                []
            );
        });

        it('should pass the pending flag of a display item and of the total to native', async () => {
            expect.hasAssertions();

            let finishShow: (details: string) => void = emptyFn;
            jest.mocked(NativePayments.show).mockImplementation(
                async () =>
                    new Promise<string>(resolve => {
                        finishShow = resolve;
                    })
            );

            const pendingTotal: PaymentItem = { ...updatedTotal, pending: true };
            const pendingItem: PaymentItem = { ...displayItem, pending: true };

            const request = new PaymentRequest([eventsMethodData], {
                total: initialTotal,
                displayItems: [pendingItem],
            });
            request.addEventListener('shippingoptionchange', event => {
                event.updateWith({ total: pendingTotal, displayItems: [pendingItem] });
            });

            const response = request.show();
            emitNativeEvent('shippingoptionchange', { requestId: request.id, shippingOption: 'express' });
            await nativeUpdate;
            finishShow(acceptedPayment);
            await response;

            const [[, shownDetails]] = jest.mocked(NativePayments.show).mock.calls;

            expect((shownDetails as PaymentDetailsInit).displayItems).toStrictEqual([pendingItem]);
            expect(updatePaymentDetailsMock).toHaveBeenCalledWith(
                { error: '', eventName: 'shippingoptionchange', requestId: request.id, total: pendingTotal },
                [pendingItem],
                []
            );
        });

        it('should pass identical shipping options to native from the initial details and from an update', async () => {
            expect.hasAssertions();

            let finishShow: (details: string) => void = emptyFn;
            jest.mocked(NativePayments.show).mockImplementation(
                async () =>
                    new Promise<string>(resolve => {
                        finishShow = resolve;
                    })
            );

            const detailedOption: PaymentShippingOption = {
                id: 'express',
                label: 'Express',
                detail: 'Next business day',
                amount: { currency: 'USD', value: '5.00' },
            };

            const request = new PaymentRequest([eventsMethodData], {
                total: initialTotal,
                shippingOptions: [detailedOption],
            });
            request.addEventListener('shippingoptionchange', event => {
                event.updateWith({ shippingOptions: [detailedOption] });
            });

            const response = request.show();
            emitNativeEvent('shippingoptionchange', { requestId: request.id, shippingOption: 'express' });
            await nativeUpdate;
            finishShow(acceptedPayment);
            await response;

            const [[, shownDetails]] = jest.mocked(NativePayments.show).mock.calls;
            const [[, , updatedShippingOptions]] = updatePaymentDetailsMock.mock.calls;

            expect((shownDetails as PaymentDetailsInit).shippingOptions).toStrictEqual([detailedOption]);
            expect(updatedShippingOptions).toStrictEqual([detailedOption]);
        });

        it('should remove a listener registered while the native module could not deliver change events', () => {
            expect.hasAssertions();

            jest.mocked(getNativePaymentsEventEmitter).mockReturnValue(null);

            const request = createInteractiveRequest();
            request.addEventListener('shippingaddresschange', emptyFn);
            request.removeEventListener('shippingaddresschange', emptyFn);

            expect(setActiveEventsMock).toHaveBeenLastCalledWith(request.id, []);
        });
    });
});
