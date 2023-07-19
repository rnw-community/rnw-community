import type { AndroidPaymentMethodTokenizationData } from './android-payment-method-tokenization-data';

// https://developers.google.com/pay/api/android/reference/response-objects#PaymentMethodData
export interface AndroidPaymentMethodData {
    description: string;
    info: object;
    tokenizationData: AndroidPaymentMethodTokenizationData;
    type: string;
}
