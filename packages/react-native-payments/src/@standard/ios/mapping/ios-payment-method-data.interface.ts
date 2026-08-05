import type { IosPaymentMethodDataDataInterface } from './ios-payment-method-data-data.interface.js';
import type { PaymentMethodNameEnum } from '../../../enum/payment-method-name.enum.js';

export interface IosPaymentMethodDataInterface {
    data: IosPaymentMethodDataDataInterface;
    supportedMethods: PaymentMethodNameEnum.ApplePay;
}
