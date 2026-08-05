import type { AndroidCardInfo } from './android-card-info.js';
import type { AndroidPaymentMethodTokenizationData } from './android-payment-method-tokenization-data.js';

// https://developers.google.com/pay/api/android/reference/response-objects#PaymentMethodData
export interface AndroidPaymentMethodData {
    description: string;
    info: AndroidCardInfo;
    tokenizationData: AndroidPaymentMethodTokenizationData;
    type: string;
}
