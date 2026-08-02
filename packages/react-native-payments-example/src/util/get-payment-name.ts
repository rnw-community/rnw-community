import { Platform } from 'react-native';

export const getPaymentName = (): string => {
    if (Platform.OS === 'ios') {
        return 'ApplePay';
    } else if (Platform.OS === 'android') {
        return 'GooglePay';
    }

    return 'Pay';
};
