import type { AndroidPaymentMethodData } from './android-payment-method-data';
import type { IOSPaymentMethodData } from './ios-payment-method-data';

// https://www.w3.org/TR/payment-request/#paymentmethoddata-dictionary
export type PaymentMethodData = AndroidPaymentMethodData | IOSPaymentMethodData;
