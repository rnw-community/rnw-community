import type { IosPKPaymentMethodType } from '../enum/ios-pk-payment-method-type.enum.js';

/**
 * The Apple PassKit `PKPaymentToken` raw (un-parsed) shape.
 *
 * @see https://developer.apple.com/documentation/passkit/apple_pay/payment_token_format_reference?language=objc
 */
export interface IosRawPKToken {
    paymentData: string;
    paymentMethod: {
        displayName: string;
        network: string;
        type: IosPKPaymentMethodType;
    };
    transactionIdentifier: string;
}
