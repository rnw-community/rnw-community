/*
 * https://developer.apple.com/documentation/passkit/pkpaymenttoken/1617000-paymentdata?language=objc
 * https://developer.apple.com/documentation/passkit/apple_pay/payment_token_format_reference?language=objc
 */
import { emptyIosPaymentDataHeader } from './ios-payment-data-header';

import type { IosPaymentDataHeader } from './ios-payment-data-header';

/*
 * https://developer.apple.com/documentation/passkit/pkpaymenttoken/1617000-paymentdata?language=objc
 * https://developer.apple.com/documentation/passkit/apple_pay/payment_token_format_reference?language=objc
 */
export interface IosPaymentData {
    // https://developer.apple.com/documentation/passkit/apple_pay/payment_token_format_reference?language=objc
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
