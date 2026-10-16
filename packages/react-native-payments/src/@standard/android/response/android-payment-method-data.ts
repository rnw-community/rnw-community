import type { AndroidCardInfo } from './android-card-info';
import type { AndroidPaymentMethodTokenizationData } from './android-payment-method-tokenization-data';

export interface AndroidPaymentMethodData {
    description: string;
    info: AndroidCardInfo;
    tokenizationData: AndroidPaymentMethodTokenizationData;
    type: string;
}
