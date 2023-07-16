// https://www.w3.org/TR/payment-request/#paymentitem-dictionary
import type { PaymentCurrencyAmount } from './payment-currency-amount';

export interface PaymentItem {
    amount: PaymentCurrencyAmount;
    label: string;
    pending?: boolean;
}
