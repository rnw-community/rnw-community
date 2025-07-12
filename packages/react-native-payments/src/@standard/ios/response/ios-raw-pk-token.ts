import type { IosPKPaymentMethodType } from '../enum/ios-pk-payment-method-type.enum';

// https://developer.apple.com/documentation/passkit/apple_pay/payment_token_format_reference?language=objc
export interface IosRawPKToken {
    /*
     * https://developer.apple.com/documentation/passkit/pkpaymenttoken/1617000-paymentdata?language=objc
     * Send this data to your e-commerce back-end system, where it can be decrypted and submitted to your payment processor.
     */
    paymentData: string;
    paymentMethod: {
        displayName: string;
        network: string;
        type: IosPKPaymentMethodType;
    };
    transactionIdentifier: string;
}
