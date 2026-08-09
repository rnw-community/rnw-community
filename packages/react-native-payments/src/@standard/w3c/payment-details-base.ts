import type { PaymentDetailsModifier } from './payment-details-modifier';
import type { PaymentItem } from './payment-item';
import type { PaymentShippingOption } from './payment-shipping-option';

/**
 * The W3C `PaymentDetailsBase` dictionary.
 *
 * @see https://www.w3.org/TR/payment-request/#paymentdetailsbase-dictionary
 */
export interface PaymentDetailsBase {
    displayItems?: PaymentItem[];
    modifiers?: PaymentDetailsModifier[];
    shippingOptions?: PaymentShippingOption[];
}
