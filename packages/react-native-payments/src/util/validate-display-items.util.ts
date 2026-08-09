import { type ClassType, isDefined } from '@rnw-community/shared';

import { isValidDecimalMonetaryValue } from './is-valid-decimal-monetary-value/is-valid-decimal-monetary-value.util.js';

import type { PaymentItem } from '../@standard/w3c/payment-item.js';

export const validateDisplayItems = (ErrorType: ClassType<Error>, displayItems: PaymentItem[] = []): void => {
    displayItems.forEach(item => {
        if (!isDefined(item) || !isDefined(item.amount) || !isDefined(item.amount.value)) {
            throw new ErrorType(`required member value is undefined.`);
        }

        if (!isValidDecimalMonetaryValue(item.amount.value)) {
            throw new ErrorType(`'${item.amount.value}' is not a valid amount format for display items`);
        }
    });
};
