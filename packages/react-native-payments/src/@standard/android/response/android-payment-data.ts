import type { AndroidFullAddress } from './android-full-address';
import type { AndroidPaymentMethodData } from './android-payment-method-data';

export interface AndroidPaymentData {
    apiVersion: number;
    apiVersionMinor: number;
    email?: string;
    paymentMethodData: AndroidPaymentMethodData;
    shippingAddress?: AndroidFullAddress;
}
