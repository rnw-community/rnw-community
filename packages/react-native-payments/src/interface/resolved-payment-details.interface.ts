import type { PaymentItem } from '../@standard/w3c/payment-item';

export interface ResolvedPaymentDetailsInterface {
    displayItems: PaymentItem[];
    total: PaymentItem;
}
