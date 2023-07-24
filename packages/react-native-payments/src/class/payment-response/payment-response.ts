import { NativePayments } from '../native-payments/native-payments';

import type { PaymentValidationErrors } from '../../@standard/w3c/payment-validation-errors';
import type { PaymentComplete } from '../../enum/payment-complete.enum';
import type { PaymentResponseDetailsInterface } from '../../interface/payment-response-details.interface';

/*
 * https://www.w3.org/TR/payment-request/#paymentresponse-interface
 * TODO: Many of fields and methods of this class does not correspond to the spec, should we change it?
 */
export class PaymentResponse<TokenDetails> {
    private completeCalled = false;

    // TODO: Should we extract type? Spec does not provide such data
    constructor(
        // https://www.w3.org/TR/payment-request/#dom-paymentresponse-requestid
        readonly requestId: string,
        // https://www.w3.org/TR/payment-request/#dom-paymentresponse-methodname
        readonly methodName: string,
        // https://www.w3.org/TR/payment-request/#dom-paymentresponse-details
        readonly details: PaymentResponseDetailsInterface<TokenDetails>
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
