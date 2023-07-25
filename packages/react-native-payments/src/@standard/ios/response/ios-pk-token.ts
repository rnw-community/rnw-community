import { emptyIosPaymentData } from './ios-payment-data';

import type { IosPaymentData } from './ios-payment-data';

// https://developer.apple.com/documentation/passkit/pkpayment?language=objc
export interface IosPKToken {
    paymentData: IosPaymentData;
    paymentMethod: {
        displayName: string;
        network: string;
        type: string;
    };
    transactionIdentifier: string;
}

export const emptyIosPKToken: IosPKToken = {
    paymentData: emptyIosPaymentData,
    paymentMethod: {
        displayName: '',
        network: '',
        type: '',
    },
    transactionIdentifier: '',
};
