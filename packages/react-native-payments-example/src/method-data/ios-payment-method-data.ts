import {
    IosPKMerchantCapability,
    type IosPaymentMethodDataInterface,
    PaymentMethodNameEnum,
    SupportedNetworkEnum,
} from '@rnw-community/react-native-payments';

export const iosPaymentMethodData: IosPaymentMethodDataInterface = {
    data: {
        countryCode: 'US',
        currencyCode: 'USD',
        merchantCapabilities: [IosPKMerchantCapability.PKMerchantCapability3DS],
        supportedNetworks: [SupportedNetworkEnum.Visa, SupportedNetworkEnum.Mastercard],
        // HINT: This should match your Apple Developer Merchant ID(in XCode Apple Pay Capabilities)
        merchantIdentifier: 'merchant.react-native-payments',
    },
    supportedMethods: [PaymentMethodNameEnum.ApplePay],
};
