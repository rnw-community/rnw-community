import type { AndroidPaymentDataRequest } from './android/android-payment-data-request';
import type { IOSPaymentMethodData } from './ios/ios-payment-method-data';
import type { PaymentMethodNameEnum } from '../../enum/payment-method-name.enum';

// https://www.w3.org/TR/payment-request/#paymentmethoddata-dictionary
export interface NativePaymentMethodData<T> {
    data: T;
    supportedMethods: PaymentMethodNameEnum[];
}

export type PaymentMethodData =
    | NativePaymentMethodData<AndroidPaymentDataRequest>
    | NativePaymentMethodData<IOSPaymentMethodData>;
