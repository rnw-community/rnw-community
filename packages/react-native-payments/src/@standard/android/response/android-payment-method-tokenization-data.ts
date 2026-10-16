import type { AndroidPaymentMethodTokenizationType } from '../enum/android-payment-method-tokenization-type.enum';

export interface AndroidPaymentMethodTokenizationData {
    token?: string;
    type: AndroidPaymentMethodTokenizationType;
}
