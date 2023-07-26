import type { IosPaymentMethodDataDataInterface } from './ios-payment-method-data-data.interface';
import type { PaymentMethodNameEnum } from '../../../enum/payment-method-name.enum';

export interface IosPaymentMethodDataInterface {
    data: IosPaymentMethodDataDataInterface;
    supportedMethods: PaymentMethodNameEnum.ApplePay;
}
