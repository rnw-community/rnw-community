import { isNumber } from './is-number.util';

import type { PaymentCurrencyAmount } from '../interface/payment-currency-amount';
import type { PaymentDetailsBase } from '../interface/payment-details/payment-details-base';
import type { AmountValue } from '../type/amount-value.type';

const toString = (amountValue: AmountValue): string => (isNumber(amountValue) ? amountValue.toString() : amountValue);

const convertObjectAmountToString = <T extends { amount: PaymentCurrencyAmount }>(objectWithAmount: T): T => ({
    ...objectWithAmount,
    amount: {
        value: toString(objectWithAmount.amount.value),
        currency: objectWithAmount.amount.currency,
    },
});

export const convertDetailAmountsToString = <T extends PaymentDetailsBase>(details: T): T => ({
    ...details,
    total: convertObjectAmountToString(details.total),
    displayItems: details.displayItems.map(paymentItemOrShippingOption =>
        convertObjectAmountToString(paymentItemOrShippingOption)
    ),
    shippingOptions: details.shippingOptions.map(paymentItemOrShippingOption =>
        convertObjectAmountToString(paymentItemOrShippingOption)
    ),
});
