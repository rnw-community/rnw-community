import type { PaymentCurrencyAmount } from './payment-currency-amount';

export interface PaymentShippingOption {
    amount: PaymentCurrencyAmount;
    id: string;
    label: string;
    selected: boolean;
}
