import type { GenericPaymentMethodData } from '../generic-payment-method-data.interface';

export interface IOSPaymentMethodData
    extends GenericPaymentMethodData<{
        countryCode: string;
        merchantIdentifier: string;
    }> {}
