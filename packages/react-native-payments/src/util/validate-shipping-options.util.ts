import { type ClassType, isDefined } from '@rnw-community/shared';

import { MODULE_NAME } from '../constants';

import { isValidDecimalMonetaryValue } from './index';

import type { PaymentsError } from '../error/payments.error';
import type { PaymentDetailsBase } from '../interface/payment-details-base';

// TODO: Why not receive shippingOptions directly?
export const validateShippingOptions = (details: PaymentDetailsBase, ErrorType: ClassType<PaymentsError> = Error): void => {
    // HINT: Ignore validation if shipping options are not defined
    if (!isDefined(details.shippingOptions)) {
        return undefined;
    }

    if (!Array.isArray(details.shippingOptions)) {
        throw new ErrorType(`Shipping options is not iterable`);
    }

    const seenIDs: string[] = [];
    details.shippingOptions.forEach(shippingOption => {
        if (!isDefined(shippingOption.id)) {
            throw new ErrorType(`required member id is undefined.`);
        }

        // Reproducing how Chrome handlers `null`
        if (!isDefined(shippingOption.id)) {
            shippingOption.id = 'null';
        }

        // 8.2.3.1 If option.amount.value is not a valid decimal monetary value, then throw a TypeError, optionally informing the developer that the value is invalid.
        const amountValue = shippingOption.amount.value;
        if (!isValidDecimalMonetaryValue(amountValue)) {
            throw new ErrorType(`'${amountValue}' is not a valid amount format for shippingOptions`);
        }

        // 8.2.3.2 If seenIDs contains option.id, then set options to an empty sequence and break.
        if (seenIDs.includes(shippingOption.id)) {
            details.shippingOptions = [];

            // eslint-disable-next-line no-console
            console.warn(
                `[${MODULE_NAME}] Duplicate shipping option identifier '${shippingOption.id}' is treated as an invalid address indicator.`
            );
        } else {
            // 8.2.3.3 Append option.id to seenIDs.
            seenIDs.push(shippingOption.id);
        }
    });
};
