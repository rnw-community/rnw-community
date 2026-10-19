import type { AndroidPaymentMethodDataDataInterface } from './android-payment-method-data-data.interface';
import type { PaymentMethodNameEnum } from '../../../enum/payment-method-name.enum';

/**
 * The Android entry of the `methodData` array passed to `new PaymentRequest(...)`, targeting Google Pay.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/react-native-payments/docs/api/android-payment-method-data.md
 * @see https://www.w3.org/TR/payment-request/#dom-paymentmethoddata
 */
export interface AndroidPaymentMethodDataInterface {
    data: AndroidPaymentMethodDataDataInterface;
    supportedMethods: PaymentMethodNameEnum.AndroidPay;
}
