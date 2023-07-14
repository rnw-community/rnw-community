import type { PaymentDetailsBase } from './payment-details-base';
import type { PaymentItem } from './payment-item';

// https://www.w3.org/TR/payment-request/#paymentdetailsupdate-dictionary
export interface PaymentDetailsUpdate extends PaymentDetailsBase {
    error: string;
    total: PaymentItem;
}
