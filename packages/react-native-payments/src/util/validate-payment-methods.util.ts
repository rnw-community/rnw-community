import { isDefined, isNotEmptyArray } from '@rnw-community/shared';

import { ConstructorError } from '../error/constructor.error';

import type { PaymentMethodData } from '../@standard/w3c/payment-method-data';

export const validatePaymentMethods = (methodData: PaymentMethodData[]): void => {
    if (!isNotEmptyArray(methodData)) {
        throw new ConstructorError(`At least one payment method is required`);
    }

    methodData.forEach(paymentMethod => {
        if (!isDefined(paymentMethod.supportedMethods)) {
            throw new ConstructorError(`required member supportedMethods is undefined.`);
        }
    });
};
