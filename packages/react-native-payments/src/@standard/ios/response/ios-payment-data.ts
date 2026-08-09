import { emptyIosPaymentDataHeader } from './ios-payment-data-header.js';

import type { IosPaymentDataHeader } from './ios-payment-data-header.js';

/**
 * The Apple PassKit `PKPaymentToken.paymentData` shape.
 *
 * @see https://developer.apple.com/documentation/passkit/pkpaymenttoken/1617000-paymentdata?language=objc
 * @see https://developer.apple.com/documentation/passkit/apple_pay/payment_token_format_reference?language=objc
 */
export interface IosPaymentData {
    data: string;
    header: IosPaymentDataHeader;
    signature: string;
    version: string;
}
export const emptyIosPaymentData: IosPaymentData = {
    data: '',
    header: emptyIosPaymentDataHeader,
    signature: '',
    version: '',
};
