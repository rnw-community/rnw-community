import type { PaymentItem } from '../@standard/w3c/payment-item';
import type { PaymentRequestEventType } from '../type/payment-request-event.type';

export interface NativePaymentDetailsUpdateInterface {
    error: string;
    eventName: PaymentRequestEventType;
    requestId: string;
    total: PaymentItem;
}
