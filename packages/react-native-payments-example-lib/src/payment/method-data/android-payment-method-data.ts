import { EnvironmentEnum } from '@rnw-community/react-native-payments';
import {
    AndroidAllowedAuthMethodsEnum,
    type AndroidPaymentMethodDataInterface,
    PaymentMethodNameEnum,
    SupportedNetworkEnum,
} from '@rnw-community/react-native-payments';

interface GetAndroidPaymentMethodDataProps {
    requestBillingAddress?: boolean;
    requestPayerEmail?: boolean;
    requestPayerName?: boolean;
    requestPayerPhone?: boolean;
    requestShipping?: boolean;
}

export const getAndroidPaymentMethodData = ({
    requestBillingAddress = false,
    requestPayerEmail = false,
    requestPayerPhone = false,
    requestPayerName = false,
    requestShipping = false,
}: GetAndroidPaymentMethodDataProps = {}): AndroidPaymentMethodDataInterface => ({
    data: {
        requestBillingAddress,
        requestPayerEmail,
        requestPayerPhone,
        requestPayerName,
        requestShipping,
        environment: __DEV__ ? EnvironmentEnum.TEST : EnvironmentEnum.PRODUCTION,
        // USD: will not show total and merchantInfo
        currencyCode: 'EUR',
        supportedNetworks: [SupportedNetworkEnum.Visa, SupportedNetworkEnum.Mastercard],
        // HINT: default allowedAuthMethods is both PAN_ONLY and CRYPTOGRAM_3DS
        allowedAuthMethods: [AndroidAllowedAuthMethodsEnum.PAN_ONLY],
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
});
