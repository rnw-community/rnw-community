/* eslint-disable no-underscore-dangle,max-lines */
import { type EmitterSubscription, NativeEventEmitter, NativeModules } from 'react-native';
import uuid from 'react-native-uuid';

import { isIOS } from '@rnw-community/platform';
import { emptyFn, isNotEmptyString } from '@rnw-community/shared';

import { MODULE_NAME } from '../constants';
import { PaymentMethodNameEnum } from '../enum/payment-method-name.enum';
import { PaymentsErrorEnum } from '../enum/payments-error.enum';
import { ConstructorError } from '../error/constructor.error';
import { DOMException } from '../error/dom.exception';
import { NativePayments } from '../native-payments/native-payments';
import { PaymentResponse } from '../payment-response/payment-response';
import { convertDetailAmountsToString } from '../util/convert-detail-amounts-to-string.util';
import { validateDisplayItems } from '../util/validate-display-items.util';
import { validatePaymentMethods } from '../util/validate-payment-methods.util';
import { validatePlatformMethodData } from '../util/validate-platform-method-data.util';
import { validateShippingOptions } from '../util/validate-shipping-options.util';
import { validateTotal } from '../util/validate-total.util';

import type { NativePaymentDetailsInterface } from '../interface/payment-details/native-payment-details.interface';
import type { PaymentDetailsInit } from '../interface/payment-details/payment-details-init';
import type { PaymentMethodData } from '../interface/payment-method-data/payment-method-data';

export class PaymentRequest {
    // https://www.w3.org/TR/payment-request/#id-attribute
    readonly id: string;
    updating = false;
    state: 'closed' | 'created' | 'interactive' = 'created';

    // Internal Slots https://www.w3.org/TR/payment-request/#internal-slots
    private readonly serializedMethodData: string;
    private readonly normalizedDetails: PaymentDetailsInit;

    private readonly dismissSubscription: EmitterSubscription;
    private readonly acceptSubscription: EmitterSubscription;

    private acceptPromiseResolver: (value: PaymentResponse) => void = emptyFn;
    private acceptPromiseRejecter: (reason: unknown) => void = emptyFn;

    // eslint-disable-next-line max-statements
    constructor(readonly methodData: PaymentMethodData[], public details: PaymentDetailsInit) {
        // 3. Establish the request's id:
        if (!isNotEmptyString(details.id)) {
            details.id = uuid.v4() as string;
        }

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

        // 17. Set request.[[serializedMethodData]] to serializedMethodData.
        this.serializedMethodData = validatePlatformMethodData(methodData);
        this.normalizedDetails = convertDetailAmountsToString(details);
        this.id = details.id;

        // TODO: Is there a more type-safe way to do this?
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const eventEmitter = new NativeEventEmitter(NativeModules['Payments']);
        this.acceptSubscription = eventEmitter.addListener(`${MODULE_NAME}:accept`, this.handleAcceptPayment.bind(this));
        this.dismissSubscription = eventEmitter.addListener(`${MODULE_NAME}:dismiss`, this.handleDismissPayment.bind(this));
    }

    // https://www.w3.org/TR/payment-request/#show-method
    show(): Promise<PaymentResponse> {
        return new Promise<PaymentResponse>((resolve, reject) => {
            this.acceptPromiseResolver = resolve;
            this.acceptPromiseRejecter = reject;

            if (this.state === 'created') {
                this.state = 'interactive';

                // HINT: resolve will be triggered via acceptPromiseResolver() from ReactNativePayments:accept event
                NativePayments.show(
                    JSON.parse(this.serializedMethodData) as PaymentMethodData,
                    this.normalizedDetails
                ).catch(reject);
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

        this.handleDismissPayment();
    }

    private handleAcceptPayment(details: NativePaymentDetailsInterface): void {
        const methodName = isIOS ? PaymentMethodNameEnum.ApplePay : PaymentMethodNameEnum.AndroidPay;

        // TODO: Convert details to unified interface

        this.acceptPromiseResolver(new PaymentResponse(this.id, methodName, details));
    }

    private handleDismissPayment(): void {
        this.state = 'closed';

        // TODO: Should we check if this subscription is already removed? Maybe someone will decide to cache PaymentRequest instance?
        this.dismissSubscription.remove();
        this.acceptSubscription.remove();

        this.acceptPromiseRejecter(new DOMException(PaymentsErrorEnum.AbortError));
    }
}
