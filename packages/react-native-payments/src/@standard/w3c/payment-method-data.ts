import type { AndroidPaymentMethodDataInterface } from '../android/mapping/android-payment-method-data.interface.js';
import type { IosPaymentMethodDataInterface } from '../ios/mapping/ios-payment-method-data.interface.js';

// https://www.w3.org/TR/payment-request/#paymentmethoddata-dictionary
export type PaymentMethodData = AndroidPaymentMethodDataInterface | IosPaymentMethodDataInterface;
