/* eslint-disable no-underscore-dangle,max-lines */
import { isAndroid } from '@rnw-community/platform/src';
import uuid from 'react-native-uuid';

import { isIOS } from '@rnw-community/platform';
import { emptyFn, isDefined, isNotEmptyString } from '@rnw-community/shared';

import { AndroidPaymentMethodTokenizationType } from '../../@standard/android/enum/android-payment-method-tokenization-type.enum';
import { defaultAndroidPaymentDataRequest } from '../../@standard/android/request/android-payment-data-request';
import { defaultAndroidPaymentMethod } from '../../@standard/android/request/android-payment-method';
import { defaultAndroidTransactionInfo } from '../../@standard/android/request/android-transaction-info';
import { PaymentMethodNameEnum } from '../../enum/payment-method-name.enum';
import { PaymentsErrorEnum } from '../../enum/payments-error.enum';
import { ConstructorError } from '../../error/constructor.error';
import { DOMException } from '../../error/dom.exception';
import { validateDisplayItems } from '../../util/validate-display-items.util';
import { validatePaymentMethods } from '../../util/validate-payment-methods.util';
import { validateTotal } from '../../util/validate-total.util';
import { NativePayments } from '../native-payments/native-payments';
import { PaymentResponse } from '../payment-response/payment-response';

import type { AndroidAllowedCardNetworksEnum } from '../../@standard/android/enum/android-allowed-card-networks.enum';
import type { AndroidPaymentMethodDataDataInterface } from '../../@standard/android/mapping/android-payment-method-data-data.interface';
import type { AndroidPaymentDataRequest } from '../../@standard/android/request/android-payment-data-request';
import type { AndroidPaymentDataToken } from '../../@standard/android/response/android-payment-data-token';
import type { IosPaymentMethodDataDataInterface } from '../../@standard/ios/mapping/ios-payment-method-data-data.interface';
import type { PaymentMethodData } from '../../@standard/w3c/payment-method-data';
import type { PaymentDetailsInterface } from '../../interface/payment-details.interface';
import type { PaymentResponseInterface } from '../../interface/payment-response.interface';

/*
 * HINT: Troubleshooting: https://developers.google.com/pay/api/android/support/troubleshooting
 * HINT: Google Pay API Errors: https://developers.google.com/pay/api/web/reference/error-objects
 */
export class PaymentRequest {
    // https://www.w3.org/TR/payment-request/#id-attribute
    readonly id: string;
    updating = false;
    state: 'closed' | 'created' | 'interactive' = 'created';

    // Internal Slots https://www.w3.org/TR/payment-request/#internal-slots
    private readonly serializedMethodData: string;

    private acceptPromiseRejecter: (reason: unknown) => void = emptyFn;

    // eslint-disable-next-line max-statements
    constructor(readonly methodData: PaymentMethodData[], public details: PaymentDetailsInterface) {
        // 3. Establish the request's id:
        if (!isNotEmptyString(details.id)) {
            // TODO: Can we avoid using external lib? Use Math.random?
            details.id = uuid.v4() as string;
        }
        this.id = details.id;

        // 4. Process payment methods
        validatePaymentMethods(methodData);

        // 5. Process the total
        validateTotal(details.total, ConstructorError);

        // 6. If the displayItems member of details is present, then for each item in details.displayItems:
        validateDisplayItems(details.displayItems, ConstructorError);

        // 17. Set request.[[serializedMethodData]] to serializedMethodData.         */
        const platformMethodData = this.findPlatformPaymentMethodData();
        const nativePlatformMethodData = isAndroid
            ? this.getAndroidPaymentMethodData(platformMethodData as AndroidPaymentMethodDataDataInterface, details)
            : platformMethodData;
        this.serializedMethodData = JSON.stringify(nativePlatformMethodData);
    }

    // https://www.w3.org/TR/payment-request/#show-method
    show(): Promise<PaymentResponse> {
        return new Promise<PaymentResponse>((resolve, reject) => {
            this.acceptPromiseRejecter = reject;

            if (this.state === 'created') {
                this.state = 'interactive';

                NativePayments.show(this.serializedMethodData, this.details)
                    .then(details => {
                        resolve(this.handleAccept(details));

                        return void 0;
                    })
                    .catch(reject);
            } else {
                reject(new DOMException(PaymentsErrorEnum.InvalidStateError));
            }
        });
    }

    // https://www.w3.org/TR/payment-request/#abort-method
    async abort(): Promise<void> {
        if (this.state !== 'interactive') {
            throw new DOMException(PaymentsErrorEnum.InvalidStateError);
        }

        await NativePayments.abort().catch(() => {
            throw new DOMException(PaymentsErrorEnum.InvalidStateError);
        });

        this.state = 'closed';

        this.acceptPromiseRejecter(new DOMException(PaymentsErrorEnum.AbortError));
    }

    private handleAccept(details: string): PaymentResponse {
        const methodName = isIOS ? PaymentMethodNameEnum.ApplePay : PaymentMethodNameEnum.AndroidPay;
        const platformDetails = isIOS ? (JSON.parse(details) as object) : (JSON.parse(details) as AndroidPaymentDataToken);

        const response: PaymentResponseInterface = {
            details: platformDetails as AndroidPaymentDataToken,
            /*
             * TODO: Add implementation to request and receive following data
             * payerEmail: '',
             * payerName: '',
             * payerPhone: '',
             * shippingAddress: {};
             * billingAddress: {};
             */
        };

        return new PaymentResponse(this.id, methodName, response);
    }

    private findPlatformPaymentMethodData(): AndroidPaymentMethodDataDataInterface | IosPaymentMethodDataDataInterface {
        const platformSupportedMethod = isIOS ? PaymentMethodNameEnum.ApplePay : PaymentMethodNameEnum.AndroidPay;

        const platformMethod = this.methodData.find(
            paymentMethodData => paymentMethodData.supportedMethods.at(0) === platformSupportedMethod
        );

        if (!isDefined(platformMethod)) {
            throw new DOMException(PaymentsErrorEnum.NotSupportedError);
        }

        return platformMethod.data;
    }

    /**
     * Convert ReactNativePayments methodData configuration to Android specification
     *
     * @param methodData
     * @param details
     * @private
     */
    // eslint-disable-next-line class-methods-use-this
    private getAndroidPaymentMethodData(
        methodData: AndroidPaymentMethodDataDataInterface,
        details: PaymentDetailsInterface
    ): AndroidPaymentDataRequest {
        return {
            ...defaultAndroidPaymentDataRequest,
            merchantInfo: methodData.merchantInfo,
            transactionInfo: {
                ...defaultAndroidTransactionInfo,
                currencyCode: methodData.currencyCode,
                totalPrice: details.total.amount.value,
                totalPriceLabel: details.total.label,
                countryCode: methodData.countryCode,
            },
            allowedPaymentMethods: [
                {
                    ...defaultAndroidPaymentMethod,
                    parameters: {
                        ...defaultAndroidPaymentMethod.parameters,
                        allowedCardNetworks: methodData.supportedNetworks.map(
                            network => network.toUpperCase() as AndroidAllowedCardNetworksEnum
                        ),
                        // TODO: Should add configuration for AndroidBillingAddressParameters, is it the same for the IOS?
                        ...(details.requestBilling === true && { billingAddressRequired: true }),
                    },
                    ...(isDefined(methodData.gatewayConfig) && {
                        tokenizationSpecification: {
                            parameters: methodData.gatewayConfig,
                            type: AndroidPaymentMethodTokenizationType.PAYMENT_GATEWAY,
                        },
                    }),
                    ...(isDefined(methodData.directConfig) && {
                        tokenizationSpecification: {
                            parameters: methodData.directConfig,
                            type: AndroidPaymentMethodTokenizationType.DIRECT,
                        },
                    }),
                },
            ],
            ...(details.requestEmail === true && { emailRequired: true }),
            // TODO: Should add configuration for AndroidShippingAddressParameters, is it the same for the IOS?
            ...(details.requestShipping === true && { shippingAddressRequired: true }),
        };
    }
}
