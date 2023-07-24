import type { PaymentDetailsBase } from './payment-details-base';

/*
 * https://www.w3.org/TR/payment-request/#paymentdetailsupdate-dictionary
 * ts-prune-ignore-next
 */
export interface PaymentDetailsUpdate extends PaymentDetailsBase {
    error: string;
}
