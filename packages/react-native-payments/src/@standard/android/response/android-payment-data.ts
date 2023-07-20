import type { AndroidAddress } from './android-address';
import type { AndroidPaymentMethodData } from './android-payment-method-data';

/*
 * https://developers.google.com/android/reference/com/google/android/gms/wallet/PaymentData
 * https://developers.google.com/pay/api/android/reference/response-objects#PaymentData
 */
export interface AndroidPaymentData {
    apiVersion: number;
    apiVersionMinor: number;
    email?: string;
    paymentMethodData: AndroidPaymentMethodData;
    shippingAddress?: AndroidAddress;
}
