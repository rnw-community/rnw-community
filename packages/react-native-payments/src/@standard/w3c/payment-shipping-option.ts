import type { PaymentCurrencyAmount } from './payment-currency-amount';

export interface PaymentShippingOption {
    amount: PaymentCurrencyAmount;
    detail?: string;
    id: string;
    label: string;
    selected?: boolean;
}
