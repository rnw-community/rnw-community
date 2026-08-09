import { isDefined } from '@rnw-community/shared';

import { PaymentsErrorEnum } from '../../enum/payments-error.enum.js';
import { DOMException } from '../../error/dom.exception.js';
import { PaymentsError } from '../../error/payments.error.js';
import { NativePayments } from '../native-payments/native-payments.js';

import type { PaymentValidationErrors } from '../../@standard/w3c/payment-validation-errors.js';
import type { PaymentComplete } from '../../enum/payment-complete.enum.js';
import type { PaymentResponseDetailsInterface } from '../../interface/payment-response-details.interface.js';
import type { PaymentResponseJsonInterface } from '../../interface/payment-response-json.interface.js';
import type { Maybe } from '@rnw-community/shared';

/**
 * The W3C `PaymentResponse` interface, returned once `PaymentRequest.show()` resolves.
 *
 * @see https://www.w3.org/TR/payment-request/#paymentresponse-interface
 */
export class PaymentResponse {
    private completeCalled = false;
    private retryCalled = false;

    constructor(
        readonly requestId: string,
        readonly methodName: string,
        readonly details: PaymentResponseDetailsInterface,
        readonly shippingOption: Maybe<string> = null
    ) {}

    /**
     * The W3C `PaymentResponse.complete()` method.
     *
     * @see https://www.w3.org/TR/payment-request/#complete-method
     */
    async complete(result: PaymentComplete): Promise<void> {
        if (this.completeCalled || this.retryCalled) {
            throw new DOMException(PaymentsErrorEnum.InvalidStateError);
        }

        this.completeCalled = true;

        return NativePayments.complete(result);
    }

    /**
     * The W3C `PaymentResponse.retry()` method.
     *
     * @see https://www.w3.org/TR/payment-request/#dom-paymentresponse-retry
     */
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
