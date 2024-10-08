import {
    type IosPaymentMethodDataInterface,
    PaymentMethodNameEnum,
    SupportedNetworkEnum,
} from '@rnw-community/react-native-payments';

export const iosPaymentMethodData: IosPaymentMethodDataInterface = {
    data: {
        requestBillingAddress: true,
        requestShipping: true,
        requestPayerEmail: true,
        countryCode: 'US',
        currencyCode: 'USD',
        supportedNetworks: [SupportedNetworkEnum.Visa, SupportedNetworkEnum.Mastercard],
        // HINT: This should match your Apple Developer Merchant ID(in XCode Apple Pay Capabilities)
        merchantIdentifier: 'merchant.react-native-payments',
    },
    supportedMethods: PaymentMethodNameEnum.ApplePay,
};

export const iosPaymentMethodDataWithoutShipping: IosPaymentMethodDataInterface = {
    data: {
        requestBillingAddress: true,
        requestPayerName: true,
        requestPayerEmail: true,
        requestPayerPhone: true,
        countryCode: 'US',
        currencyCode: 'USD',
        supportedNetworks: [SupportedNetworkEnum.Visa, SupportedNetworkEnum.Mastercard],
        // HINT: This should match your Apple Developer Merchant ID(in XCode Apple Pay Capabilities)
        merchantIdentifier: 'merchant.react-native-payments',
    },
    supportedMethods: PaymentMethodNameEnum.ApplePay,
};
