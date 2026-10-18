import type { PaymentsConfig } from '@rnw-community/react-native-payments';

export default {
    merchantIdentifier: 'merchant.react-native-payments',
    supportedNetworks: ['visa', 'masterCard'],
    googlePayEnvironment: 'TEST',
} satisfies PaymentsConfig;
