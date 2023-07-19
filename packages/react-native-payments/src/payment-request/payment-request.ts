/* eslint-disable no-underscore-dangle,max-lines */
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

import type { NativePaymentDetailsInterface } from '../interface/payment-details/native-payment-details.interface';
import type { PaymentDetailsInit } from '../interface/payment-details/payment-details-init';
import type { AndroidPaymentDataRequest } from '../interface/payment-method-data/android/android-payment-data-request';
import type { IOSPaymentMethodData } from '../interface/payment-method-data/ios/ios-payment-method-data';
import type { PaymentMethodData } from '../interface/payment-method-data/payment-method-data';

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
    constructor(readonly methodData: PaymentMethodData[], public details: PaymentDetailsInit) {
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

        // TODO: Create single user PaymentMethodData interface for lib usage, make it as unified as possible to simplify usage
        const platformMethodData = this.findPlatformPaymentMethodData();

        // TODO: Modify payment data per platform

        // 17. Set request.[[serializedMethodData]] to serializedMethodData.
        this.serializedMethodData = JSON.stringify(platformMethodData);

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
                        const methodName = isIOS ? PaymentMethodNameEnum.ApplePay : PaymentMethodNameEnum.AndroidPay;

                        // TODO: Add conversion from native details to unified interface - PaymentDetailsUpdate?

                        resolve(new PaymentResponse(this.id, methodName, details as NativePaymentDetailsInterface));

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

    private findPlatformPaymentMethodData(): AndroidPaymentDataRequest | IOSPaymentMethodData {
        const platformSupportedMethod = isIOS ? PaymentMethodNameEnum.ApplePay : PaymentMethodNameEnum.AndroidPay;

        const platformMethod = this.methodData.find(paymentMethodData =>
            paymentMethodData.supportedMethods.includes(platformSupportedMethod)
        );

        if (!isDefined(platformMethod)) {
            throw new DOMException(PaymentsErrorEnum.NotSupportedError);
        }

        return platformMethod.data;
    }
}
