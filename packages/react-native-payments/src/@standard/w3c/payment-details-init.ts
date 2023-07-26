import type { PaymentDetailsBase } from './payment-details-base';
import type { PaymentItem } from './payment-item';

// https://www.w3.org/TR/payment-request/#paymentdetailsinit-dictionary
export interface PaymentDetailsInit extends PaymentDetailsBase {
    id?: string;
    total: PaymentItem;
}
