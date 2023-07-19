import type { AndroidPaymentDataRequest } from './android-payment-data-request';

export interface AndroidMandatoryPaymentDataRequest
    extends Pick<Required<AndroidPaymentDataRequest>, 'allowedPaymentMethods' | 'transactionInfo'>,
        Partial<AndroidPaymentDataRequest> {
    allowedPaymentMethods: AndroidPaymentDataRequest['allowedPaymentMethods'];
    transactionInfo: AndroidPaymentDataRequest['transactionInfo'];
}
