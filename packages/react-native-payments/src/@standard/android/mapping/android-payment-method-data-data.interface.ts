import type { EnvironmentEnum } from '../../../enum/environment.enum.js';
import type { GenericPaymentMethodDataDataInterface } from '../../../interface/generic-payment-method-data-data.interface.js';
import type { AndroidAllowedAuthMethodsEnum } from '../enum/android-allowed-auth-methods.enum.js';
import type { AndroidTokenizationDirectSpecification } from '../request/android-tokenization-direct-specification.js';
import type { AndroidTokenizationGatewaySpecification } from '../request/android-tokenization-gateway-specification.js';
import type { AndroidTransactionInfo } from '../request/android-transaction-info.js';

interface AndroidGenericPaymentMethodDataInterface extends GenericPaymentMethodDataDataInterface {
    allowedAuthMethods?: AndroidAllowedAuthMethodsEnum[];
    checkoutOption?: AndroidTransactionInfo['checkoutOption'];
    environment: EnvironmentEnum;
    totalPriceStatus?: AndroidTransactionInfo['totalPriceStatus'];
    transactionId?: AndroidTransactionInfo['transactionId'];
}

export type AndroidPaymentMethodDataDataInterface = AndroidGenericPaymentMethodDataInterface &
    (
        | {
              directConfig: AndroidTokenizationDirectSpecification['parameters'];
              gatewayConfig?: never;
          }
        | {
              directConfig?: never;
              gatewayConfig: AndroidTokenizationGatewaySpecification['parameters'];
          }
    );
