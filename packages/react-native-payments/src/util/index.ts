import isDecimal from 'validator/es/lib/isDecimal';
import isFloat from 'validator/es/lib/isFloat';
import isInt from 'validator/es/lib/isInt';
import toFloat from 'validator/es/lib/toFloat';
import toInt from 'validator/es/lib/toInt';

import { isDefined, isString } from '@rnw-community/shared';

import type { PaymentCurrencyAmount } from '../interface/payment-currency-amount';
import type { PaymentDetailsInit } from '../interface/payment-details-init';
import type { PaymentShippingOption } from '../interface/payment-shipping-options';

type AmountValue = number | string;

const isNumber = (value: unknown): value is number => typeof value === 'number';

export const isValidDecimalMonetaryValue = (amountValue: AmountValue): boolean => {
    if (!isNumber(amountValue) && !isString(amountValue)) {
        return false;
    }

    return isNumber(amountValue) || isValidStringAmount(amountValue);
};

export const isNegative = (amountValue: AmountValue): boolean =>
    isNumber(amountValue) ? amountValue < 0 : amountValue.startsWith('-');

export const isValidStringAmount = (stringAmount: string): boolean => {
    if (stringAmount.endsWith('.')) {
        return false;
    }

    return isDecimal(stringAmount);
};

export const toNumber = (string: string): number => {
    if (isFloat(string)) {
        return toFloat(string);
    }

    if (isInt(string)) {
        return toInt(string);
    }

    throw new Error(`Invalid string amount: ${string}`);
};

export const toString = (amountValue: AmountValue): string => (isNumber(amountValue) ? amountValue.toString() : amountValue);

export const convertObjectAmountToString = <T extends { amount: PaymentCurrencyAmount }>(objectWithAmount: T): T => ({
    ...objectWithAmount,
    amount: {
        value: toString(objectWithAmount.amount.value),
        currency: objectWithAmount.amount.currency,
    },
});

export const convertDetailAmountsToString = (details: PaymentDetailsInit): PaymentDetailsInit => ({
    ...details,
    total: convertObjectAmountToString(details.total),
    displayItems: details.displayItems.map(paymentItemOrShippingOption =>
        convertObjectAmountToString(paymentItemOrShippingOption)
    ),
    shippingOptions: details.shippingOptions.map(paymentItemOrShippingOption =>
        convertObjectAmountToString(paymentItemOrShippingOption)
    ),
});

export const getSelectedShippingOption = (shippingOptions: PaymentShippingOption[]): string | null => {
    // Return null if shippingOptions isn't an Array
    if (!Array.isArray(shippingOptions)) {
        return null;
    }

    // Return null if shippingOptions is empty
    if (shippingOptions.length === 0) {
        return null;
    }

    const selectedShippingOption = shippingOptions.find(shippingOption => shippingOption.selected);

    // Return selectedShippingOption id
    if (isDefined(selectedShippingOption)) {
        return selectedShippingOption.id;
    }

    // Return first shippingOption if no shippingOption was marked as selected
    return shippingOptions[0].id;
};
