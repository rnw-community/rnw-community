import type { PaymentAddressFieldEnum } from '../../enum/payment-address-field.enum.js';
import type { PaymentContactFieldEnum } from '../../enum/payment-contact-field.enum.js';

/**
 * The W3C payment validation errors shape returned to a failing `updateWith` call.
 *
 * @see https://www.w3.org/TR/payment-request/#dom-paymentvalidationerrors
 */
export interface PaymentValidationErrors {
    error?: string;
    payer?: Partial<Record<PaymentContactFieldEnum, string>>;
    shippingAddress?: Partial<Record<PaymentAddressFieldEnum, string>>;
}
