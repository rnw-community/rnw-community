import type { AndroidPaymentMethodTokenizationType } from '../enum/android-payment-method-tokenization-type.enum';

// https://developers.google.com/pay/api/android/reference/request-objects#PaymentMethodTokenizationSpecification
export interface AndroidTokenizationDirectSpecification {
    parameters: Record<string, string> & {
        protocolVersion: string;
        publicKey: string;
    };
    // https://developers.google.com/pay/api/android/reference/request-objects#direct
    type: AndroidPaymentMethodTokenizationType.DIRECT;
}
