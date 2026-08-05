import type { PaymentItem } from './payment-item.js';
import type { PaymentMethodNameEnum } from '../../enum/payment-method-name.enum.js';

// https://www.w3.org/TR/payment-request/#paymentdetailsmodifier-dictionary
export interface PaymentDetailsModifier {
    additionalDisplayItems?: PaymentItem[];
    data?: Record<string, unknown>;
    supportedMethods: PaymentMethodNameEnum;
    total?: PaymentItem;
}
