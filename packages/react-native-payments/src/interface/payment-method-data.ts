import type { IOSPaymentMethodData } from './payment-method-data/ios/ios-payment-method-data';
import type { AndroidMandatoryPaymentDataRequest } from '../android/interface/request/android-mandatory-payment-data-request';
import type { PaymentMethodNameEnum } from '../enum/payment-method-name.enum';

export interface NativePaymentMethodData<T> {
    data: T;
    supportedMethods: PaymentMethodNameEnum[];
}

// https://www.w3.org/TR/payment-request/#paymentmethoddata-dictionary
export type PaymentMethodData =
    | NativePaymentMethodData<AndroidMandatoryPaymentDataRequest>
    | NativePaymentMethodData<IOSPaymentMethodData>;
