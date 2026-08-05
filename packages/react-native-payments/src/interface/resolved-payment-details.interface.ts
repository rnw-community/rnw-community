import type { PaymentItem } from '../@standard/w3c/payment-item.js';

export interface ResolvedPaymentDetailsInterface {
    displayItems: PaymentItem[];
    total: PaymentItem;
}
