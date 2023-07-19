/* eslint-disable no-underscore-dangle,max-lines */
import { isAndroid } from '@rnw-community/platform/src';
import uuid from 'react-native-uuid';

import { isIOS } from '@rnw-community/platform';
import { emptyFn, isDefined, isNotEmptyString } from '@rnw-community/shared';

import { PaymentMethodNameEnum } from '../enum/payment-method-name.enum';
import { PaymentsErrorEnum } from '../enum/payments-error.enum';
import { ConstructorError } from '../error/constructor.error';
import { DOMException } from '../error/dom.exception';
import { NativePayments } from '../native-payments/native-payments';
import { PaymentResponse } from '../payment-response/payment-response';
import { convertDetailAmountsToString } from '../util/convert-detail-amounts-to-string.util';
import { validateDisplayItems } from '../util/validate-display-items.util';
import { validatePaymentMethods } from '../util/validate-payment-methods.util';
import { validateShippingOptions } from '../util/validate-shipping-options.util';
import { validateTotal } from '../util/validate-total.util';

import type { AndroidMandatoryPaymentDataRequest } from '../android/interface/request/android-mandatory-payment-data-request';
import type { AndroidPaymentDataRequest } from '../android/interface/request/android-payment-data-request';
import type { AndroidPaymentDataToken } from '../android/interface/response/android-payment-data-token';
import type { PaymentDetailsInit } from '../interface/payment-details/payment-details-init';
import type { PaymentMethodData } from '../interface/payment-method-data';
import type { IOSPaymentMethodData } from '../interface/payment-method-data/ios/ios-payment-method-data';
import type { PaymentOptionsInterface } from '../interface/payment-options.interface';
import type { PaymentResponseInterface } from '../interface/payment-response.interface';

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
    private readonly normalizedDetails: PaymentDetailsInit;

    private acceptPromiseRejecter: (reason: unknown) => void = emptyFn;

    // eslint-disable-next-line max-statements
    constructor(
        readonly methodData: PaymentMethodData[],
        public details: PaymentDetailsInit,
        public options?: PaymentOptionsInterface
    ) {
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

        // 8. Process shipping options
        validateShippingOptions(details, ConstructorError);

        /*
         * 10. Process payment details modifiers:
         * TODO
         * - Look into how payment details modifiers are used.
         * processPaymentDetailsModifiers(details, serializedModifierData)
         */

        /*
         * 17. Set request.[[serializedMethodData]] to serializedMethodData.
         * TODO: Create single user PaymentMethodData interface for lib usage, make it as unified as possible to simplify usage
         */
        const platformMethodData = this.findPlatformPaymentMethodData();
        const nativePlatformMethodData = isAndroid
            ? this.getAndroidPaymentMethodData(platformMethodData as AndroidMandatoryPaymentDataRequest, options)
            : platformMethodData;
        this.serializedMethodData = JSON.stringify(nativePlatformMethodData);

        // TODO: improve this validation/converter - move to class
        this.normalizedDetails = convertDetailAmountsToString(details);
    }

    // https://www.w3.org/TR/payment-request/#show-method
    show(): Promise<PaymentResponse> {
        return new Promise<PaymentResponse>((resolve, reject) => {
            this.acceptPromiseRejecter = reject;

            if (this.state === 'created') {
                this.state = 'interactive';

                // HINT: resolve will be triggered via acceptPromiseResolver() from ReactNativePayments:accept event
                NativePayments.show(this.serializedMethodData, this.normalizedDetails)
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
            details: platformDetails,
            requestId: this.id,
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

    private findPlatformPaymentMethodData(): AndroidMandatoryPaymentDataRequest | IOSPaymentMethodData {
        const platformSupportedMethod = isIOS ? PaymentMethodNameEnum.ApplePay : PaymentMethodNameEnum.AndroidPay;

        const platformMethod = this.methodData.find(paymentMethodData =>
            paymentMethodData.supportedMethods.includes(platformSupportedMethod)
        );

        if (!isDefined(platformMethod)) {
            throw new DOMException(PaymentsErrorEnum.NotSupportedError);
        }

        return platformMethod.data;
    }

    // eslint-disable-next-line class-methods-use-this
    private getAndroidPaymentMethodData(
        androidData: AndroidMandatoryPaymentDataRequest,
        options?: PaymentOptionsInterface
    ): AndroidPaymentDataRequest {
        return {
            ...androidData,
            allowedPaymentMethods: androidData.allowedPaymentMethods.map(paymentMethod => ({
                ...paymentMethod,
                parameters: {
                    ...paymentMethod.parameters,
                    // TODO: Should add configuration for AndroidBillingAddressParameters, is it the same for the IOS?
                    ...(options?.requestBilling === true && { billingAddressRequired: true }),
                },
            })),
            apiVersion: 2,
            apiVersionMinor: 0,
            ...(options?.requestEmail === true && { emailRequired: true }),
            // TODO: Should add configuration for AndroidShippingAddressParameters, is it the same for the IOS?
            ...(options?.requestShipping === true && { shippingAddressRequired: true }),
        };
    }
}
