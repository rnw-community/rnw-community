import type { IosPaymentMethodDataDataInterface } from './ios-payment-method-data-data.interface';
import type { PaymentMethodNameEnum } from '../../../enum/payment-method-name.enum';

/**
 * The Apple Pay entry of the `methodData` array passed to `new PaymentRequest(...)`.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/react-native-payments/docs/api/ios-payment-method-data.md
 * @see https://www.w3.org/TR/payment-request/#dom-paymentmethoddata
 */
export interface IosPaymentMethodDataInterface {
    data: IosPaymentMethodDataDataInterface;
    supportedMethods: PaymentMethodNameEnum.ApplePay;
}
