import type { PaymentCurrencyAmount } from './payment-currency-amount.js';

// https://www.w3.org/TR/payment-request/#paymentitem-dictionary
export interface PaymentItem {
    amount: PaymentCurrencyAmount;
    label: string;
    pending?: boolean;
}
