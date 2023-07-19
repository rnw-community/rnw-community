import React, { useState } from 'react';
import { Button, SafeAreaView, Text } from 'react-native';

import {
    type NativePaymentDetailsInterface,
    PaymentComplete,
    type PaymentDetailsInit,
    type PaymentMethodData,
    PaymentMethodNameEnum,
    PaymentRequest,
    SupportedNetworkEnum,
} from '@rnw-community/react-native-payments';
import { getErrorMessage, isDefined } from '@rnw-community/shared';

const paymentMethodData: PaymentMethodData[] = [
    {
        data: {
            currencyCode: 'USD',
            countryCode: 'US',
            supportedNetworks: [SupportedNetworkEnum.visa, SupportedNetworkEnum.mastercard],
            // HINT: This should match your Apple Developer Merchant ID(in XCode Apple Pay Capabilities)
            merchantIdentifier: 'merchant.react-native-payments',
        },
        supportedMethods: [PaymentMethodNameEnum.ApplePay],
    },
    {
        data: {
            allowedPaymentMethods: [
                {
                    parameters: {
                        allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                        allowedCardNetworks: ['AMEX', 'MASTERCARD', 'VISA'],
                        /*
                         * allowCreditCards: true,
                         * allowPrepaidCards: true,
                         * assuranceDetailsRequired: true,
                         * billingAddressParameters: {
                         *     format: 'FULL',
                         *     phoneNumberRequired: true,
                         * },
                         * billingAddressRequired: true,
                         */
                    },
                    tokenizationSpecification: {
                        parameters: {
                            gateway: 'firstdata',
                            gatewayMerchantId: '12022224648',
                        },
                        type: 'PAYMENT_GATEWAY',
                    },
                    type: 'CARD',
                },
            ],
            apiVersion: 2,
            apiVersionMinor: 0,
            emailRequired: true,
            // merchantInfo: { merchantName: 'Example merchant' },
            transactionInfo: {
                /*
                 * checkoutOption: 'COMPLETE_IMMEDIATE_PURCHASE',
                 */
                countryCode: 'US',
                currencyCode: 'USD',
                totalPrice: '111',
                totalPriceStatus: 'FINAL',
                /*
                 * totalPriceLabel: 'TestPurchase',
                 * transactionId: '123',
                 */
            },
            /*
             * shippingAddressRequired: true,
             * shippingAddressParameters: {
             *     allowedCountryCodes: ['US'],
             *     phoneNumberRequired: true,
             * },
             */
        },
        supportedMethods: [PaymentMethodNameEnum.AndroidPay],
    },
];
const paymentDetails: PaymentDetailsInit = {
    environment: 'TEST',
    displayItems: [
        {
            amount: {
                currency: 'USD',
                value: '10.00',
            },
            label: 'First item',
        },
        {
            amount: {
                currency: 'USD',
                value: '10.00',
            },
            label: 'Second item',
        },
    ],
    total: {
        amount: {
            currency: 'USD',
            value: '20.00',
        },
        label: 'Total',
    },
};

// TODO: Add UI to add items
export const App = (): JSX.Element => {
    const [error, setError] = useState('');
    const [response, setResponse] = useState<NativePaymentDetailsInterface>();

    const createPaymentRequest = (): PaymentRequest => {
        setError('');
        setResponse(undefined);

        return new PaymentRequest(paymentMethodData, paymentDetails);
    };
    const handlePay = (): void => {
        void createPaymentRequest()
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

    return (
        <SafeAreaView>
            <Button onPress={handlePay} title="AndroidPay/ApplePay" />
            <Button onPress={handlePayWithAbort} title="ApplePay with delayed abort" />
            <Text>{error}</Text>
            {isDefined(response) && <Text>Response:{JSON.stringify(response)}</Text>}
        </SafeAreaView>
    );
};
