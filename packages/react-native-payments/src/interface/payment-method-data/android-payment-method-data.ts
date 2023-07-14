import type { AndroidDirectTokenizationParameters } from './android-direct-tokenization-parameters';
import type { AndroidGatewayTokenizationParameters } from './android-gateway-tokenization-parameters';
import type { AllowedPaymentMethodsEnum } from '../../enum/allowed-payment-methods.enum';
import type { EnvironmentEnum } from '../../enum/environment.enum';
import type { PaymentMethodNameEnum } from '../../enum/payment-method-name.enum';
import type { SupportedNetworkEnum } from '../../enum/supported-networks.enum';

export interface AndroidPaymentMethodData {
    data: {
        allowedPaymentMethods: AllowedPaymentMethodsEnum[];
        currencyCode: string;
        environment: EnvironmentEnum;
        paymentMethodTokenizationParameters: AndroidDirectTokenizationParameters | AndroidGatewayTokenizationParameters;
        supportedNetworks: SupportedNetworkEnum[];
    };
    supportedMethods: [PaymentMethodNameEnum.AndroidPay];
}
