import type { PaymentCurrencyAmount } from './payment-currency-amount';

/**
 * The W3C `PaymentShippingOption` dictionary.
 *
 * @see https://www.w3.org/TR/payment-request/#paymentshippingoption-dictionary
 */
export interface PaymentShippingOption {
    amount: PaymentCurrencyAmount;
    detail?: string;
    id: string;
    label: string;
    selected?: boolean;
}
