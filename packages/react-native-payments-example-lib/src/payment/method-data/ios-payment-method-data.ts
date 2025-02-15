import {
    type IosPaymentMethodDataInterface,
    PaymentMethodNameEnum,
    SupportedNetworkEnum,
} from '@rnw-community/react-native-payments';

interface GetIOSPaymentMethodDataProps {
    requestBillingAddress?: boolean;
    requestPayerEmail?: boolean;
    requestPayerName?: boolean;
    requestPayerPhone?: boolean;
    requestShipping?: boolean;
}

export const getIosPaymentMethodData = ({
    requestBillingAddress = false,
    requestPayerEmail = false,
    requestPayerName = false,
    requestPayerPhone = false,
    requestShipping = false,
}: GetIOSPaymentMethodDataProps = {}): IosPaymentMethodDataInterface => ({
    data: {
        requestBillingAddress,
        requestPayerName,
        requestPayerEmail,
        requestPayerPhone,
        requestShipping,
        countryCode: 'US',
        currencyCode: 'USD',
        supportedNetworks: [SupportedNetworkEnum.Visa, SupportedNetworkEnum.Mastercard],
        // HINT: This should match your Apple Developer Merchant ID(in XCode Apple Pay Capabilities)
        merchantIdentifier: 'merchant.react-native-payments',
    },
    supportedMethods: PaymentMethodNameEnum.ApplePay,
});
