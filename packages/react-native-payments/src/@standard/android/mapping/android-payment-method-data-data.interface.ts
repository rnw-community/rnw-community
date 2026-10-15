import type { EnvironmentEnum } from '../../../enum/environment.enum';
import type { GenericPaymentMethodDataDataInterface } from '../../../interface/generic-payment-method-data-data.interface';
import type { AndroidAllowedAuthMethodsEnum } from '../enum/android-allowed-auth-methods.enum';
import type { AndroidAutomaticReloadTransactionInfo } from '../request/android-automatic-reload-transaction-info.interface';
import type { AndroidDeferredTransactionInfo } from '../request/android-deferred-transaction-info.type';
import type { AndroidRecurringTransactionInfo } from '../request/android-recurring-transaction-info.interface';
import type { AndroidTokenizationDirectSpecification } from '../request/android-tokenization-direct-specification';
import type { AndroidTokenizationGatewaySpecification } from '../request/android-tokenization-gateway-specification';
import type { AndroidTransactionInfo } from '../request/android-transaction-info';

interface AndroidGenericPaymentMethodDataInterface extends GenericPaymentMethodDataDataInterface {
    allowedAuthMethods?: AndroidAllowedAuthMethodsEnum[];
    automaticReloadTransactionInfo?: AndroidAutomaticReloadTransactionInfo;
    checkoutOption?: AndroidTransactionInfo['checkoutOption'];
    deferredTransactionInfo?: AndroidDeferredTransactionInfo;
    environment: EnvironmentEnum;
    recurringTransactionInfo?: AndroidRecurringTransactionInfo;
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
