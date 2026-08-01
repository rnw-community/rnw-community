import type { PaymentDetailsInit } from '@rnw-community/react-native-payments';

export const paymentDetails: PaymentDetailsInit = {
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

export const paymentDetailsWithoutDisplayItems: PaymentDetailsInit = {
    total: {
        amount: {
            currency: 'EUR',
            value: '20.00',
        },
        label: 'Total',
    },
};
