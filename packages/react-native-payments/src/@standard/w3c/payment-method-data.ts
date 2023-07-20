import type { AndroidPaymentMethodDataInterface } from '../android/mapping/android-payment-method-data.interface';
import type { IosPaymentMethodDataInterface } from '../ios/mapping/ios-payment-method-data.interface';

// https://www.w3.org/TR/payment-request/#paymentmethoddata-dictionary
export type PaymentMethodData = AndroidPaymentMethodDataInterface | IosPaymentMethodDataInterface;
