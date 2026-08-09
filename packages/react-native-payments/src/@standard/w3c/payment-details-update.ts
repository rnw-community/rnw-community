import type { PaymentDetailsBase } from './payment-details-base.js';
import type { PaymentItem } from './payment-item.js';
import type { PaymentDetailsUpdateError } from '../../type/payment-details-update-error.type.js';

/**
 * The W3C `PaymentDetailsUpdate` dictionary.
 *
 * @see https://www.w3.org/TR/payment-request/#paymentdetailsupdate-dictionary
 */
export interface PaymentDetailsUpdate extends PaymentDetailsBase {
    error?: PaymentDetailsUpdateError;
    total?: PaymentItem;
}
