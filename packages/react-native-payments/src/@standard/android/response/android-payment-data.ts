import type { AndroidFullAddress } from './android-full-address';
import type { AndroidPaymentMethodData } from './android-payment-method-data';

/**
 * The Google Pay `PaymentData` response shape.
 *
 * @see https://developers.google.com/android/reference/com/google/android/gms/wallet/PaymentData
 * @see https://developers.google.com/pay/api/android/reference/response-objects#PaymentData
 */
export interface AndroidPaymentData {
    apiVersion: number;
    apiVersionMinor: number;
    email?: string;
    paymentMethodData: AndroidPaymentMethodData;
    shippingAddress?: AndroidFullAddress;
}
