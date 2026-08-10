import type { AndroidPaymentMethodTokenizationType } from '../enum/android-payment-method-tokenization-type.enum';

/**
 * The Google Pay `PaymentMethodTokenizationData` response shape.
 *
 * @see https://developers.google.com/pay/api/android/reference/response-objects#PaymentMethodTokenizationData
 */
export interface AndroidPaymentMethodTokenizationData {
    token?: string;
    type: AndroidPaymentMethodTokenizationType;
}
