import type { PaymentDetailsBase } from './payment-details-base';
import type { PaymentItem } from './payment-item';
import type { PaymentDetailsUpdateError } from '../../type/payment-details-update-error.type';

/**
 * The W3C `PaymentDetailsUpdate` dictionary.
 *
 * @see https://www.w3.org/TR/payment-request/#paymentdetailsupdate-dictionary
 */
export interface PaymentDetailsUpdate extends PaymentDetailsBase {
    error?: PaymentDetailsUpdateError;
    total?: PaymentItem;
}
