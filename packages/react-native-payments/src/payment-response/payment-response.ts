/* eslint-disable no-underscore-dangle */
import { isIOS } from '@rnw-community/platform/src';

import { NativePayments } from '../native-payments/native-payments';

import type { PaymentComplete } from '../enum/payment-complete.enum';
import type { NativePaymentDetailsInterface } from '../interface/payment-details/native-payment-details.interface';
import type { PaymentValidationErrors } from '../interface/payment-validation-errors';

/*
 * https://www.w3.org/TR/payment-request/#paymentresponse-interface
 * TODO: Many of fields and methods of this class does not correspond to the spec, should we change it?
 */
export class PaymentResponse {
    private _completeCalled = false;

    // TODO: Should we extract type? Spec does not provide such data
    constructor(
        // https://www.w3.org/TR/payment-request/#dom-paymentresponse-requestid
        readonly requestId: string,
        // https://www.w3.org/TR/payment-request/#dom-paymentresponse-methodname
        readonly methodName: string,
        // https://www.w3.org/TR/payment-request/#dom-paymentresponse-details
        readonly details: NativePaymentDetailsInterface
    ) {}

    // https://www.w3.org/TR/payment-request/#complete-method
    complete(result: PaymentComplete): Promise<void> {
        if (this._completeCalled) {
            throw new Error('InvalidStateError');
        }

        this._completeCalled = true;

        // TODO: Implement logic https://www.w3.org/TR/payment-request/#complete-method

        return NativePayments.complete(result);
    }

    // https://www.w3.org/TR/payment-request/#dom-paymentresponse-retry
    retry(_errorFields?: PaymentValidationErrors): Promise<undefined> {
        if (this._completeCalled) {
            throw new Error('InvalidStateError');
        }

        // TODO: Implement logic https://www.w3.org/TR/payment-request/#retry-method

        return Promise.resolve(undefined);
    }
}
