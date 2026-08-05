import { IosPKPaymentMethodType } from '../enum/ios-pk-payment-method-type.enum.js';

import { emptyIosPaymentData } from './ios-payment-data.js';

import type { IosPaymentData } from './ios-payment-data.js';

// https://developer.apple.com/documentation/passkit/pkpayment?language=objc
export interface IosPKToken {
    paymentData: IosPaymentData;
    paymentMethod: {
        displayName: string;
        network: string;
        type: IosPKPaymentMethodType;
    };
    transactionIdentifier: string;
}

export const emptyIosPKToken: IosPKToken = {
    paymentData: emptyIosPaymentData,
    paymentMethod: {
        displayName: '',
        network: '',
        type: IosPKPaymentMethodType.PKPaymentMethodTypeUnknown,
    },
    transactionIdentifier: '',
};
