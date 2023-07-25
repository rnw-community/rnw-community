import { IosPKPaymentMethodType } from '../enum/ios-pk-payment-method-type.enum';

import { emptyIosPaymentData } from './ios-payment-data';

import type { IosPaymentData } from './ios-payment-data';

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
