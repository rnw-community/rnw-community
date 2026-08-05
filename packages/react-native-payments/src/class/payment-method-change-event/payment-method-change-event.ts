import { PaymentRequestUpdateEvent } from '../payment-request-update-event/payment-request-update-event.js';

import type { PaymentRequestUpdateHandler } from '../../type/payment-request-update-handler.type.js';
import type { Maybe } from '@rnw-community/shared';

// https://www.w3.org/TR/payment-request/#dom-paymentmethodchangeevent
export class PaymentMethodChangeEvent extends PaymentRequestUpdateEvent {
    readonly methodDetails: Maybe<Record<string, unknown>>;
    readonly methodName: string;

    constructor(
        methodName: string,
        methodDetails: Maybe<Record<string, unknown>>,
        onUpdateWith: PaymentRequestUpdateHandler
    ) {
        super('paymentmethodchange', onUpdateWith);

        this.methodName = methodName;
        this.methodDetails = methodDetails;
    }
}
