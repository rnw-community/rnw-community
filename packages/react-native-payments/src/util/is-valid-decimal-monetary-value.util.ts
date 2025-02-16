import validator from 'validator';

import { isNumber, isString } from '@rnw-community/shared';

import type { AmountValue } from '../type/amount-value.type';

const isValidStringAmount = (stringAmount: string): boolean => {
    if (stringAmount.endsWith('.')) {
        return false;
    }

    return validator.isDecimal(stringAmount);
};

export const isValidDecimalMonetaryValue = (amountValue: AmountValue): boolean => {
    if (!isNumber(amountValue) && !isString(amountValue)) {
        return false;
    }

    return isNumber(amountValue) || isValidStringAmount(amountValue);
};
