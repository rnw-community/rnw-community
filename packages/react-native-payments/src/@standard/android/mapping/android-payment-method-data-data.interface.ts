import type { EnvironmentEnum } from '../../../enum/environment.enum';
import type { GenericPaymentMethodDataDataInterface } from '../../../interface/generic-payment-method-data-data.interface';
import type { AndroidAllowedAuthMethodsEnum } from '../enum/android-allowed-auth-methods.enum';
import type { AndroidTokenizationDirectSpecification } from '../request/android-tokenization-direct-specification';
import type { AndroidTokenizationGatewaySpecification } from '../request/android-tokenization-gateway-specification';
import type { AndroidTransactionInfo } from '../request/android-transaction-info';

interface AndroidGenericPaymentMethodDataInterface extends GenericPaymentMethodDataDataInterface {
    // PAN_ONLY and CRYPTOGRAM_3DS by default. https://developers.google.com/pay/api/android/reference/request-objects#CardParameters
    allowedAuthMethods?: AndroidAllowedAuthMethodsEnum[];
    // Requires totalPriceStatus FINAL. https://developers.google.com/pay/api/android/reference/request-objects#TransactionInfo
    checkoutOption?: AndroidTransactionInfo['checkoutOption'];
    // Android environment https://developers.google.com/android/reference/com/google/android/gms/wallet/Wallet.WalletOptions.Builder#setEnvironment(int)
    environment: EnvironmentEnum;
    // FINAL by default. https://developers.google.com/pay/api/android/reference/request-objects#TransactionInfo
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
