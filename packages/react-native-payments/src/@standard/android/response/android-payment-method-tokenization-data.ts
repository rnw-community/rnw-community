import type { AndroidPaymentMethodTokenizationType } from '../enum/android-payment-method-tokenization-type.enum';

// https://developers.google.com/pay/api/android/reference/response-objects#PaymentMethodTokenizationData
export interface AndroidPaymentMethodTokenizationData {
    // AndroidRawPaymentMethodToken is a stringified JSON object
    token?: string;
    type: AndroidPaymentMethodTokenizationType;
}
