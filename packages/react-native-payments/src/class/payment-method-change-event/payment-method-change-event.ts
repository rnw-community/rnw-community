import { PaymentRequestUpdateEvent } from '../payment-request-update-event/payment-request-update-event';

import type { PaymentRequestUpdateHandler } from '../../type/payment-request-update-handler.type';
import type { Maybe } from '@rnw-community/shared';

/**
 * The W3C `PaymentMethodChangeEvent` interface.
 *
 * @see https://www.w3.org/TR/payment-request/#dom-paymentmethodchangeevent
 */
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
