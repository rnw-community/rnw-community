import type { AndroidPaymentMethodData } from './android/android-payment-method-data';
import type { GenericPaymentMethodData } from './generic-payment-method-data.interface';
import type { IOSPaymentMethodData } from './ios/ios-payment-method-data';

// https://www.w3.org/TR/payment-request/#paymentmethoddata-dictionary
export type PaymentMethodData = AndroidPaymentMethodData | GenericPaymentMethodData<unknown> | IOSPaymentMethodData;
