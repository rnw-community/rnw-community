import type { AndroidPaymentMethodDataDataInterface } from './android-payment-method-data-data.interface.js';
import type { PaymentMethodNameEnum } from '../../../enum/payment-method-name.enum.js';

export interface AndroidPaymentMethodDataInterface {
    data: AndroidPaymentMethodDataDataInterface;
    supportedMethods: PaymentMethodNameEnum.AndroidPay;
}
