import { isDefined } from '@rnw-community/shared';

import { PaymentsErrorEnum } from '../../enum/payments-error.enum';
import { DOMException } from '../../error/dom.exception';
import { PaymentsError } from '../../error/payments.error';
import { NativePayments } from '../native-payments/native-payments';

import type { PaymentValidationErrors } from '../../@standard/w3c/payment-validation-errors';
import type { PaymentComplete } from '../../enum/payment-complete.enum';
import type { PaymentResponseDetailsInterface } from '../../interface/payment-response-details.interface';
import type { PaymentResponseJsonInterface } from '../../interface/payment-response-json.interface';
import type { Maybe } from '@rnw-community/shared';

/*
 * https://www.w3.org/TR/payment-request/#paymentresponse-interface
 */
export class PaymentResponse {
    private completeCalled = false;
    private retryCalled = false;

    constructor(
        // https://www.w3.org/TR/payment-request/#dom-paymentresponse-requestid
        readonly requestId: string,
        // https://www.w3.org/TR/payment-request/#dom-paymentresponse-methodname
        readonly methodName: string,
        // https://www.w3.org/TR/payment-request/#dom-paymentresponse-details
        readonly details: PaymentResponseDetailsInterface,
        // https://www.w3.org/TR/payment-request/#dom-paymentresponse-shippingoption
        readonly shippingOption: Maybe<string> = null
    ) {}

    // https://www.w3.org/TR/payment-request/#complete-method
    async complete(result: PaymentComplete): Promise<void> {
        if (this.completeCalled || this.retryCalled) {
            throw new DOMException(PaymentsErrorEnum.InvalidStateError);
        }

        this.completeCalled = true;

        // TODO: Implement logic https://www.w3.org/TR/payment-request/#complete-method

        return NativePayments.complete(result);
    }

    // https://www.w3.org/TR/payment-request/#dom-paymentresponse-retry
    async retry(errorFields?: PaymentValidationErrors): Promise<undefined> {
        if (this.completeCalled) {
            throw new DOMException(PaymentsErrorEnum.InvalidStateError);
        }

        if (this.retryCalled) {
            throw new DOMException(PaymentsErrorEnum.InvalidStateError);
        }

        const { retry } = NativePayments;

        if (!isDefined(retry)) {
            throw new DOMException(PaymentsErrorEnum.NotSupportedError);
        }

        this.retryCalled = true;

        await retry(this.requestId, errorFields ?? {}).catch(() => {
            throw new PaymentsError(`Failed retrying PaymentRequest`);
        });

        // eslint-disable-next-line no-undefined
        return undefined;
    }

    // https://www.w3.org/TR/payment-request/#dom-paymentresponse-tojson
    toJSON(): PaymentResponseJsonInterface {
        return {
            requestId: this.requestId,
            methodName: this.methodName,
            details: this.details,
            shippingAddress: this.details.shippingAddress ?? null,
            shippingOption: this.shippingOption,
            payerEmail: this.details.payerEmail ?? null,
            payerName: this.details.payerName ?? null,
            payerPhone: this.details.payerPhone ?? null,
        };
    }
}
