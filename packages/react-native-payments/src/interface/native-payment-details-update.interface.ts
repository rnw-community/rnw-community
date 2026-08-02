import type { PaymentItem } from '../@standard/w3c/payment-item';
import type { PaymentDetailsUpdateError } from '../type/payment-details-update-error.type';
import type { PaymentRequestEventType } from '../type/payment-request-event.type';

// Feeds the PassKit sheet update: https://developer.apple.com/documentation/passkit/pkpaymentrequestupdate
export interface NativePaymentDetailsUpdateInterface {
    error: PaymentDetailsUpdateError;
    eventId?: number;
    eventName: PaymentRequestEventType;
    requestId: string;
    total: PaymentItem;
}
