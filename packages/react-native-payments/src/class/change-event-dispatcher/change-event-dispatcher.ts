import { emptyFn, isDefined, wait } from '@rnw-community/shared';

import { changeEventTimeoutMs } from '../../constant/change-event-timeout-ms';
import { PaymentsErrorEnum } from '../../enum/payments-error.enum';
import { DOMException } from '../../error/dom.exception';
import { warnChangeEventError } from '../../util/warn-change-event-error.util';
import { PaymentMethodChangeEvent } from '../payment-method-change-event/payment-method-change-event';
import { PaymentRequestUpdateEvent } from '../payment-request-update-event/payment-request-update-event';

import type { PaymentDetailsUpdate } from '../../@standard/w3c/payment-details-update';
import type { PaymentRequestEventPayloadInterface } from '../../interface/payment-request-event-payload.interface';
import type { PaymentRequestEventListener } from '../../type/payment-request-event-listener.type';
import type { PaymentRequestEventType } from '../../type/payment-request-event.type';
import type { EmptyFn, Maybe } from '@rnw-community/shared';

export class ChangeEventDispatcher {
    private answer: Maybe<Promise<PaymentDetailsUpdate>> = null;
    private isOpen = true;
    private releaseAbandoned: EmptyFn = emptyFn;

    private readonly abandoned = new Promise<null>(resolve => {
        this.releaseAbandoned = () => {
            resolve(null);
        };
    });

    private readonly isRequestActive: () => boolean;

    private readonly event: PaymentRequestUpdateEvent;

    constructor(
        type: PaymentRequestEventType,
        payload: PaymentRequestEventPayloadInterface,
        isRequestActive: () => boolean
    ) {
        this.isRequestActive = isRequestActive;
        this.event =
            type === 'paymentmethodchange'
                ? new PaymentMethodChangeEvent(
                      payload.methodName ?? '',
                      payload.methodDetails ?? null,
                      this.handleUpdateWith
                  )
                : new PaymentRequestUpdateEvent(type, this.handleUpdateWith);
    }

    async dispatch(listeners: readonly PaymentRequestEventListener[]): Promise<Maybe<PaymentDetailsUpdate>> {
        const deadline = wait(changeEventTimeoutMs).then(() => null);

        await Promise.race([this.callListeners(listeners), this.abandoned, deadline]);

        this.isOpen = false;

        return await this.resolveAnswer(deadline);
    }

    abandon(): void {
        this.isOpen = false;
        this.releaseAbandoned();
    }

    private async callListeners(listeners: readonly PaymentRequestEventListener[]): Promise<void> {
        for (const listener of [...listeners]) {
            if (this.event.isAnswered) {
                return;
            }

            if (listeners.includes(listener)) {
                // eslint-disable-next-line no-await-in-loop
                await this.callListener(listener);
            }
        }
    }

    private async callListener(listener: PaymentRequestEventListener): Promise<void> {
        try {
            await listener(this.event);
        } catch (error) {
            warnChangeEventError(error);
        }
    }

    private async resolveAnswer(deadline: Promise<null>): Promise<Maybe<PaymentDetailsUpdate>> {
        if (!isDefined(this.answer)) {
            return null;
        }

        return await Promise.race([this.answer, this.abandoned, deadline]);
    }

    private readonly handleUpdateWith = (detailsUpdate: Promise<PaymentDetailsUpdate>): void => {
        if (!this.isOpen || !this.isRequestActive()) {
            throw new DOMException(PaymentsErrorEnum.InvalidStateError);
        }

        detailsUpdate.catch(emptyFn);
        this.answer = detailsUpdate;
    };
}
