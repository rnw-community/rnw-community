import type { PaymentCurrencyAmount } from '../../w3c/payment-currency-amount';

/**
 * The Apple PassKit `PKShippingMethod` shape.
 *
 * @see https://developer.apple.com/documentation/passkit/pkshippingmethod?language=objc
 */
export interface IosPKShippingMethod {
    amount: PaymentCurrencyAmount;
    detail?: string;
    identifier: string;
    label: string;
}
