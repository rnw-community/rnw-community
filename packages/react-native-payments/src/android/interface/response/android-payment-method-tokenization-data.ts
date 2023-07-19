import type { AndroidPaymentMethodTokenizationType } from '../../enum/android-payment-method-tokenization-type.enum';

// https://developers.google.com/pay/api/android/reference/response-objects#PaymentMethodTokenizationData
export interface AndroidPaymentMethodTokenizationData {
    token?: string;
    type: AndroidPaymentMethodTokenizationType;
}
