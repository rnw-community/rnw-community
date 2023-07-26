import { EnvironmentEnum } from '@rnw-community/react-native-payments/src';

import {
    type AndroidPaymentMethodDataInterface,
    PaymentMethodNameEnum,
    SupportedNetworkEnum,
} from '@rnw-community/react-native-payments';

export const androidPaymentMethodData: AndroidPaymentMethodDataInterface = {
    data: {
        requestBilling: true,
        requestShipping: true,
        requestEmail: true,
        environment: EnvironmentEnum.TEST,
        // USD: will not show total and merchantInfo
        currencyCode: 'EUR',
        supportedNetworks: [SupportedNetworkEnum.Visa, SupportedNetworkEnum.Mastercard],
        /*
         * HINT: Android gateway configuration, ask your payment provider, Google Pay should support it
         * https://developers.google.com/pay/api/android/reference/request-objects#gateway
         */
        gatewayConfig: {
            gateway: 'example',
            gatewayMerchantId: 'exampleGatewayMerchantId',
        },
    },
    supportedMethods: PaymentMethodNameEnum.AndroidPay,
};
