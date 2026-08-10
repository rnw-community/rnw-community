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
