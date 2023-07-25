import { EnvironmentEnum, type PaymentDetailsInterface } from '@rnw-community/react-native-payments';

export const paymentDetails: PaymentDetailsInterface = {
    environment: EnvironmentEnum.TEST,
    requestBilling: true,
    requestShipping: true,
    requestEmail: true,
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
