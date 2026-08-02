import { type ClassType, isDefined, isNotEmptyString, isString } from '@rnw-community/shared';

import { isValidDecimalMonetaryValue } from './is-valid-decimal-monetary-value.util';

import type { PaymentShippingOption } from '../@standard/w3c/payment-shipping-option';
import type { PaymentsError } from '../error/payments.error';

export const validateShippingOptions = (
    ErrorType: ClassType<PaymentsError>,
    shippingOptions: PaymentShippingOption[] = []
): void => {
    shippingOptions.forEach(shippingOption => {
        if (!isDefined(shippingOption) || !isNotEmptyString(shippingOption.id) || !isNotEmptyString(shippingOption.label)) {
            throw new ErrorType(`Missing required member(s): id, label.`);
        }

        if (!isDefined(shippingOption.amount) || !isDefined(shippingOption.amount.value)) {
            throw new ErrorType(`required member value is undefined.`);
        }

        if (!isString(shippingOption.amount.value) || !isValidDecimalMonetaryValue(shippingOption.amount.value)) {
            throw new ErrorType(`'${shippingOption.amount.value}' is not a valid amount format for shipping options`);
        }
    });
};
