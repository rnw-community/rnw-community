import type { AndroidPaymentMethodTokenizationType } from '../enum/android-payment-method-tokenization-type.enum.js';

/**
 * The Google Pay `PaymentMethodTokenizationSpecification` request shape (payment-gateway tokenization).
 *
 * @see https://developers.google.com/pay/api#participating-processors
 */
export interface AndroidTokenizationGatewaySpecification {
    parameters: Record<string, string> & {
        gateway: string;
        gatewayMerchantId: string;
    };
    type: AndroidPaymentMethodTokenizationType.PAYMENT_GATEWAY;
}
