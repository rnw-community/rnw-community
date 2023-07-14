import { type ClassType, isDefined } from '@rnw-community/shared';

import { isNegative, isValidDecimalMonetaryValue } from './index';

import type { PaymentsError } from '../error/payments.error';
import type { PaymentItem } from '../interface/payment-item';

export const validateTotal = (total: PaymentItem, ErrorType: ClassType<PaymentsError> = Error): void => {
    // Should Validator take an errorType to pre populate "Failed to construct 'PaymentRequest'"

    if (!isDefined(total)) {
        throw new ErrorType(`required member total is undefined.`);
    }

    // Check that there is a total
    if (!isDefined(total.amount) || !isDefined(total.amount.value) || Number(total.amount.value) === 0) {
        throw new ErrorType(`Missing required member(s): amount, label.`);
    }

    const totalAmountValue = total.amount.value;

    // Check that total is a valid decimal monetary value.
    if (!isValidDecimalMonetaryValue(totalAmountValue)) {
        throw new ErrorType(`'${totalAmountValue}' is not a valid amount format for total`);
    }

    // Check that total isn't negative
    if (isNegative(totalAmountValue)) {
        throw new ErrorType(`Total amount value should be non-negative`);
    }
};
