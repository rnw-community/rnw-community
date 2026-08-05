import type { PaymentDetailsModifier } from './payment-details-modifier.js';
import type { PaymentItem } from './payment-item.js';
import type { PaymentShippingOption } from './payment-shipping-option.js';

// https://www.w3.org/TR/payment-request/#paymentdetailsbase-dictionary
export interface PaymentDetailsBase {
    displayItems?: PaymentItem[];
    modifiers?: PaymentDetailsModifier[];
    shippingOptions?: PaymentShippingOption[];
}
