import type { AndroidPaymentMethodDataDataInterface } from './android-payment-method-data-data.interface';
import type { PaymentMethodNameEnum } from '../../../enum/payment-method-name.enum';

export interface AndroidPaymentMethodDataInterface {
    data: AndroidPaymentMethodDataDataInterface;
    supportedMethods: PaymentMethodNameEnum.AndroidPay;
}
