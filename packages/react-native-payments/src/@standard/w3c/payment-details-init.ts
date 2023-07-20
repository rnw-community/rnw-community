import type { PaymentDetailsBase } from './payment-details-base';

// https://www.w3.org/TR/payment-request/#paymentdetailsinit-dictionary
export interface PaymentDetailsInit extends PaymentDetailsBase {
    id?: string;
}
