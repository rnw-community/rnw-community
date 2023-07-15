import type { AndroidDirectTokenizationParameters } from './android-direct-tokenization-parameters';
import type { AndroidGatewayTokenizationParameters } from './android-gateway-tokenization-parameters';
import type { AllowedPaymentMethodsEnum } from '../../../enum/allowed-payment-methods.enum';
import type { EnvironmentEnum } from '../../../enum/environment.enum';
import type { GenericPaymentMethodData } from '../generic-payment-method-data.interface';

export interface AndroidPaymentMethodData
    extends GenericPaymentMethodData<{
        allowedPaymentMethods: AllowedPaymentMethodsEnum[];
        environment: EnvironmentEnum;
        paymentMethodTokenizationParameters: AndroidDirectTokenizationParameters | AndroidGatewayTokenizationParameters;
    }> {}
