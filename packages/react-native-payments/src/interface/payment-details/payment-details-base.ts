import type { PaymentDetailsModifier } from './payment-details-modifier';
import type { PaymentItem } from '../payment-item';
import type { PaymentShippingOption } from '../payment-shipping-options';

// https://www.w3.org/TR/payment-request/#paymentdetailsbase-dictionary
export interface PaymentDetailsBase {
    displayItems: PaymentItem[];
    modifiers: PaymentDetailsModifier[];
    shippingOptions: PaymentShippingOption[];
    total: PaymentItem;
}
