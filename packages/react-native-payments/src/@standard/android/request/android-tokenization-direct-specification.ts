import type { AndroidPaymentMethodTokenizationType } from '../enum/android-payment-method-tokenization-type.enum';

/**
 * The Google Pay `PaymentMethodTokenizationSpecification` request shape (direct tokenization).
 *
 * @see https://developers.google.com/pay/api/android/reference/request-objects#PaymentMethodTokenizationSpecification
 */
export interface AndroidTokenizationDirectSpecification {
    parameters: Record<string, string> & {
        protocolVersion: string;
        publicKey: string;
    };
    type: AndroidPaymentMethodTokenizationType.DIRECT;
}
