// https://www.w3.org/TR/payment-request/#paymentitem-dictionary
import { emptyPaymentCurrencyAmount } from './payment-currency-amount';

import type { PaymentCurrencyAmount } from './payment-currency-amount';

export interface PaymentItem {
    amount: PaymentCurrencyAmount;
    label: string;
    pending: boolean;
}

export const emptyPaymentItem: PaymentItem = {
    amount: emptyPaymentCurrencyAmount,
    label: '',
    pending: false,
};
