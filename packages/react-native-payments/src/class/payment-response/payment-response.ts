import { NativePayments } from '../native-payments/native-payments';

import type { PaymentValidationErrors } from '../../@standard/w3c/payment-validation-errors';
import type { PaymentComplete } from '../../enum/payment-complete.enum';
import type { PaymentResponseDetailsInterface } from '../../interface/payment-response-details.interface';

/*
 * https://www.w3.org/TR/payment-request/#paymentresponse-interface
 */
export class PaymentResponse {
    private completeCalled = false;

    constructor(
        // https://www.w3.org/TR/payment-request/#dom-paymentresponse-requestid
        readonly requestId: string,
        // https://www.w3.org/TR/payment-request/#dom-paymentresponse-methodname
        readonly methodName: string,
        // https://www.w3.org/TR/payment-request/#dom-paymentresponse-details
        readonly details: PaymentResponseDetailsInterface
    ) {}

    // https://www.w3.org/TR/payment-request/#complete-method
    complete(result: PaymentComplete): Promise<void> {
        if (this.completeCalled) {
            throw new Error('InvalidStateError');
        }

        this.completeCalled = true;

        // TODO: Implement logic https://www.w3.org/TR/payment-request/#complete-method

        return NativePayments.complete(result);
    }

    // https://www.w3.org/TR/payment-request/#dom-paymentresponse-retry
    retry(_errorFields?: PaymentValidationErrors): Promise<undefined> {
        if (this.completeCalled) {
            throw new Error('InvalidStateError');
        }

        // TODO: Implement logic https://www.w3.org/TR/payment-request/#retry-method

        return Promise.resolve(undefined);
    }
}
