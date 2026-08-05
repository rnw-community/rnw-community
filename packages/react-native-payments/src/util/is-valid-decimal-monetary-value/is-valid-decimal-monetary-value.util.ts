import { isDecimalMonetaryValue, isNumber } from '@rnw-community/shared';

import type { AmountValue } from '../../type/amount-value.type.js';

export const isValidDecimalMonetaryValue = (amountValue: AmountValue): boolean =>
    isNumber(amountValue) || isDecimalMonetaryValue(amountValue);
