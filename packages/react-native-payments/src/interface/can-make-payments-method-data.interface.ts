import type { AllowedPaymentMethodsEnum } from '../enum/allowed-payment-methods.enum';
import type { EnvironmentEnum } from '../enum/environment.enum';
import type { SupportedNetworkEnum } from '../enum/supported-networks.enum';

export interface CanMakePaymentsMethodDataInterface {
    allowedPaymentMethods: AllowedPaymentMethodsEnum[];
    environment: EnvironmentEnum;
    supportedNetworks: SupportedNetworkEnum[];
}
