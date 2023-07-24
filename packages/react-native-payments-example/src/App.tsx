import { IosPKMerchantCapability } from '@rnw-community/react-native-payments/src/@standard/ios/enum/ios-pk-merchant-capability.enum';
import React, { useEffect, useState } from 'react';
import { Button, SafeAreaView, Text } from 'react-native';

import {
    type AndroidPaymentMethodDataInterface,
    EnvironmentEnum,
    type IosPaymentMethodDataInterface,
    PaymentComplete,
    type PaymentDetailsInterface,
    PaymentMethodNameEnum,
    PaymentRequest,
    SupportedNetworkEnum,
} from '@rnw-community/react-native-payments';
import { getErrorMessage, isDefined } from '@rnw-community/shared';

const androidPaymentMethodData: AndroidPaymentMethodDataInterface = {
    data: {
        currencyCode: 'EUR',
        supportedNetworks: [SupportedNetworkEnum.Visa, SupportedNetworkEnum.Mastercard],
        /*
         * HINT: Android gateway configuration, ask you payment provider, Google Pay should support it
         * https://developers.google.com/pay/api/android/reference/request-objects#gateway
         */
        gatewayConfig: {
            gateway: 'firstdata',
            gatewayMerchantId: '12022224648',
        },
        merchantInfo: { merchantName: 'Example merchant' },
    },
    supportedMethods: [PaymentMethodNameEnum.AndroidPay],
};

const iosPaymentMethodData: IosPaymentMethodDataInterface = {
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

const paymentDetails: PaymentDetailsInterface = {
    environment: EnvironmentEnum.TEST,
    displayItems: [
        {
            amount: {
                currency: 'EUR',
                value: '10.00',
            },
            label: 'First item',
        },
        {
            amount: {
                currency: 'EUR',
                value: '10.00',
            },
            label: 'Second item',
        },
    ],
    total: {
        amount: {
            currency: 'EUR',
            value: '20.00',
        },
        label: 'Total',
    },
};

/*
 * TODO: Add UI to add items
 * ts-prune-ignore-next
 */
export const App = (): JSX.Element => {
    const [error, setError] = useState('');
    const [response, setResponse] = useState<object>();
    const [isWalletAvailable, setIsWalletAvailable] = useState(false);

    const createPaymentRequest = (): PaymentRequest => {
        setError('');
        setResponse(undefined);

        return new PaymentRequest([iosPaymentMethodData, androidPaymentMethodData], paymentDetails);
    };

    const handlePay = (): void => {
        createPaymentRequest()
            .show()
            .then(paymentResponse => {
                setResponse(paymentResponse.details);

                return paymentResponse.complete(PaymentComplete.SUCCESS);
            })
            .catch((err: unknown) => {
                setError(getErrorMessage(err));
            });
    };
    const handlePayWithAbort = (): void => {
        const paymentRequest = createPaymentRequest();

        paymentRequest.show().catch((err: unknown) => {
            setError(getErrorMessage(err));
        });

        setTimeout(() => void paymentRequest.abort(), 1000);
    };

    useEffect(() => {
        createPaymentRequest()
            .canMakePayment()
            .then(result => void setIsWalletAvailable(result))
            .catch(() => void setIsWalletAvailable(false));
    }, []);

    return (
        <SafeAreaView>
            {isWalletAvailable ? (
                <>
                    <Button onPress={handlePay} title="AndroidPay/ApplePay" />
                    <Button onPress={handlePayWithAbort} title="ApplePay with delayed abort" />
                    <Text>{error}</Text>
                    {isDefined(response) && <Text>Response:{JSON.stringify(response)}</Text>}
                </>
            ) : (
                <Text>Unfortunately Apple/Google pay is not available</Text>
            )}
        </SafeAreaView>
    );
};
