import type { PaymentDetailsModifier } from './payment-details-modifier';
import type { PaymentItem } from './payment-item';

// https://www.w3.org/TR/payment-request/#paymentdetailsbase-dictionary
export interface PaymentDetailsBase {
    displayItems: PaymentItem[];
    modifiers?: PaymentDetailsModifier[];
}
