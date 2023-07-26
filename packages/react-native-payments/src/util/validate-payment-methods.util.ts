import { isDefined } from '@rnw-community/shared';

import { ConstructorError } from '../error/constructor.error';

import type { PaymentMethodData } from '../@standard/w3c/payment-method-data';

/** @deprecated Move to PaymentRequest */
export const validatePaymentMethods = (methodData: PaymentMethodData[]): void => {
    // Check that at least one payment method is passed in
    if (methodData.length < 1) {
        throw new ConstructorError(`At least one payment method is required`);
    }

    // Check that each payment method has at least one payment method identifier
    methodData.forEach(paymentMethod => {
        if (!isDefined(paymentMethod.supportedMethods)) {
            throw new ConstructorError(`required member supportedMethods is undefined.`);
        }
    });
};
