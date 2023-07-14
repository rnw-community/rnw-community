import type { PaymentMethodNameEnum } from '../../enum/payment-method-name.enum';
import type { SupportedNetworkEnum } from '../../enum/supported-networks.enum';

export interface IOSPaymentMethodData {
    data: {
        countryCode: string;
        currencyCode: string;
        merchantIdentifier: string;
        supportedNetworks: SupportedNetworkEnum[];
    };
    supportedMethods: [PaymentMethodNameEnum.ApplePay];
}
