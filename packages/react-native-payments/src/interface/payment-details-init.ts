import { emptyPaymentDetailsBase } from './payment-details-base';
import { emptyPaymentItem } from './payment-item';

import type { PaymentDetailsBase } from './payment-details-base';
import type { PaymentItem } from './payment-item';

// https://www.w3.org/TR/payment-request/#paymentdetailsinit-dictionary
export interface PaymentDetailsInit extends PaymentDetailsBase {
    id: string;
    total: PaymentItem;
}

export const emptyPaymentDetailsInit: PaymentDetailsInit = {
    ...emptyPaymentDetailsBase,
    id: '',
    total: emptyPaymentItem,
};
