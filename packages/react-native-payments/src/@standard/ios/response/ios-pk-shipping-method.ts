import type { PaymentCurrencyAmount } from '../../w3c/payment-currency-amount';

export interface IosPKShippingMethod {
    amount: PaymentCurrencyAmount;
    detail?: string;
    identifier: string;
    label: string;
}
