import { PaymentsErrorEnum } from '../../enum/payments-error.enum';
import { DOMException } from '../../error/dom.exception';

import type { PaymentDetailsUpdate } from '../../@standard/w3c/payment-details-update';
import type { PaymentRequestEventType } from '../../type/payment-request-event.type';
import type { PaymentRequestUpdateHandler } from '../../type/payment-request-update-handler.type';

export class PaymentRequestUpdateEvent {
    readonly type: PaymentRequestEventType;

    private isUpdated = false;
    private readonly onUpdateWith: PaymentRequestUpdateHandler;

    constructor(type: PaymentRequestEventType, onUpdateWith: PaymentRequestUpdateHandler) {
        this.type = type;
        this.onUpdateWith = onUpdateWith;
    }

    get isAnswered(): boolean {
        return this.isUpdated;
    }

    updateWith(detailsUpdate: PaymentDetailsUpdate | Promise<PaymentDetailsUpdate>): void {
        if (this.isUpdated) {
            throw new DOMException(PaymentsErrorEnum.InvalidStateError);
        }

        this.onUpdateWith(Promise.resolve(detailsUpdate));
        this.isUpdated = true;
    }
}
