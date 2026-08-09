import { IosPKPaymentMethodType } from '../enum/ios-pk-payment-method-type.enum.js';

import { emptyIosPaymentData } from './ios-payment-data.js';

import type { IosPaymentData } from './ios-payment-data.js';

/**
 * The Apple PassKit `PKPaymentToken` shape.
 *
 * @see https://developer.apple.com/documentation/passkit/pkpaymenttoken?language=objc
 */
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
