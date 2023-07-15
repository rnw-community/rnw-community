import type { PaymentMethodNameEnum } from '../../enum/payment-method-name.enum';
import type { SupportedNetworkEnum } from '../../enum/supported-networks.enum';

export interface GenericPaymentMethodData<T> {
    data: T & {
        currencyCode: string;
        supportedNetworks: SupportedNetworkEnum[];
    };
    supportedMethods: PaymentMethodNameEnum[];
}
