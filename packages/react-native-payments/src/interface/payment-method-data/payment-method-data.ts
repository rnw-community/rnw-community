import type { AndroidPaymentMethodData } from './android/android-payment-method-data';
import type { IOSPaymentMethodData } from './ios/ios-payment-method-data';

/*
 * TODO: Merge and unify interface?
 * https://www.w3.org/TR/payment-request/#paymentmethoddata-dictionary
 */
export type PaymentMethodData = AndroidPaymentMethodData | IOSPaymentMethodData;
