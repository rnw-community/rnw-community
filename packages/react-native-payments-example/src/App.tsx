import React, { useEffect } from 'react';
import { SafeAreaView, Text } from 'react-native';

import { PaymentRequest } from '@rnw-community/react-native-payments';

import type { PaymentDetailsInit, PaymentMethodData } from '@rnw-community/react-native-payments';

const paymentMethodData: PaymentMethodData[] = [
    {
        data: {
            currencyCode: 'USD',
            countryCode: 'US',
            supportedNetworks: ['visa'],
            merchantIdentifier: 'test',
        },
        supportedMethods: ['apple-pay'],
    },
];
const paymentDetails: PaymentDetailsInit = {
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

export const App = (): JSX.Element => {
    useEffect(() => {
        const paymentRequest = new PaymentRequest(paymentMethodData, paymentDetails);
        void paymentRequest.show().then(paymentResponse => void console.log(paymentResponse));
    }, []);

    return (
        <SafeAreaView>
            <Text>React native payments</Text>
        </SafeAreaView>
    );
};
