import {
    AndroidAllowedAuthMethodsEnum,
    type AndroidPaymentMethodDataInterface,
    EnvironmentEnum,
    PaymentMethodNameEnum,
    SupportedNetworkEnum,
} from '@rnw-community/react-native-payments';

import type { RequestOptionsInterface } from '../../interface/request-options.interface';

export const getAndroidPaymentMethodData = ({
    requestBillingAddress,
    requestPayerEmail,
    requestPayerPhone,
    requestPayerName,
    requestShipping,
}: RequestOptionsInterface): AndroidPaymentMethodDataInterface => ({
    data: {
        requestBillingAddress,
        requestPayerEmail,
        requestPayerPhone,
        requestPayerName,
        requestShipping,
        environment: __DEV__ ? EnvironmentEnum.TEST : EnvironmentEnum.PRODUCTION,
        countryCode: 'DE',
        currencyCode: 'EUR',
        supportedNetworks: [SupportedNetworkEnum.Visa, SupportedNetworkEnum.Mastercard],
        allowedAuthMethods: [AndroidAllowedAuthMethodsEnum.PAN_ONLY],
        gatewayConfig: {
            gateway: 'example',
            gatewayMerchantId: 'exampleGatewayMerchantId',
        },
    },
    supportedMethods: PaymentMethodNameEnum.AndroidPay,
});
